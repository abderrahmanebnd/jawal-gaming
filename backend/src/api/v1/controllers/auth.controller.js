const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserOtp,
} = require("../models/auth.model"); // adjust path
const { sendEmail } = require("../utils/email");

// Helper: sign JWT
const signToken = (id) => {
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  console.log("JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Helper: create and send JWT in cookie + response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    path: "/",
  };

  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

// ✅ Signup (no OTP needed)
exports.signup = async (req, res) => {
  try {
    const { email, password, role = "USER" } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await createUser(email, hashedPassword, role);

    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error("signup ERROR::", error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

//
// ✅ Step 1: Login (send OTP instead of logging in directly)
//
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    // 🔹 Check status
    if (user.status === "INACTIVE") {
      return res
        .status(403)
        .json({ status: "fail", message: "Your account is inactive." });
    }
    if (user.status === "SUSPENDED") {
      return res
        .status(403)
        .json({ status: "fail", message: "Your account has been suspended." });
    }

    // 🔹 Generate OTP (6 digits)
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Save OTP in DB
    await updateUserOtp(user.id, otp, otpExpiry);

    // TODO: send OTP via email/SMS (for now just log it)
    console.log(`OTP for ${email}: ${otp}`);

    await sendEmail({
      email: user.email,
      subject: "Your OTP Code",
      message: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    });
    res.status(200).json({
      status: "success",
      message: "OTP sent, please verify.",
    });
  } catch (error) {
  console.error("login ERROR::", error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

//
// ✅ Step 2: Verify OTP
//
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and OTP",
      });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({
        status: "fail",
        message: "No OTP found, please login again.",
      });
    }

    // Check OTP match & expiry
    if (user.otp !== otp || new Date(user.otpExpiry) < new Date()) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid or expired OTP",
      });
    }

    // Clear OTP
    await updateUserOtp(user.id, null, null);

    delete user.password;
    delete user.otp;
    delete user.otpExpiry;

    // Now login user
    createSendToken(user, 200, res);
  } catch (error) {
    console.error("verifyOtp ERROR::", error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};


//
//  Resend OTP
//
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        status: "fail",
        message: `Your account is ${user.status}. Access denied.`,
      });
    }

    // 🔹 Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await updateUserOtp(user.id, otp, otpExpiry);

    // send email
    await sendEmail({
      email: user.email,
      subject: "Your New OTP Code",
      message: `Your new OTP code is ${otp}. It is valid for 5 minutes.`,
    });

    res.status(200).json({
      status: "success",
      message: "New OTP sent successfully",
    });
  } catch (error) {
    console.error("resendOtp ERROR::", error);
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};


// ✅ Protect middleware
exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in!",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await findUserById(decoded.id);
    if (!freshUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token does not exist.",
      });
    }

    if (freshUser.status !== "ACTIVE") {
      return res.status(403).json({
        status: "fail",
        message: `Your account is ${freshUser.status}. Access denied.`,
      });
    }

    req.user = freshUser;
    next();
  } catch (error) {
    console.error("protect ERROR::", error);
    return res.status(401).json({
      status: "fail",
      message: "Invalid or expired token",
    });
  }
};

// ✅ Restrict by role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

// ✅ Logout
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in!",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token does no longer exist.",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        status: "fail",
        message: `Your account is ${user.status}. Access denied.`,
      });
    }

    delete user.password;
    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    console.error("getMe ERROR::", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while fetching user details",
    });
  }
};
