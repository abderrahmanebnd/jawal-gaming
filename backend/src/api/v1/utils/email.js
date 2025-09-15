const nodemailer = require("nodemailer");

exports.sendEmail = async (options) => {
  // 1) Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, 
    port: process.env.EMAIL_PORT, 
    secure: process.env.EMAIL_PORT == 465, 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: `"Jawal Games" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // optional if you want fancy HTML email
  };

  // 3) Send email
  await transporter.sendMail(mailOptions);
};
