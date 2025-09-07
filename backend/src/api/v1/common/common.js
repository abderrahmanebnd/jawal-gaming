const Cryptr = require("cryptr");
const config = require("../../../config/config.json");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * This function use to generate common type responses
 * @param {*} status: response status
 * @param {*} data: response data
 * @param {*} error: response error
 * @param {*} errorCode: response error code
 * @returns
 */
const commonResponse = (res, status = 0, data = null, error = null, errorCode = "000") => {
  const response = {
    status,
    data,
    error,
    errorCode
  };
  res.status(status).json(response);
};

/**
 * This function use to encrypt values using Cryptr
 * @returns encrypted value
 */
const encrypt = value => {
  const secretKey = config?.cookieSecretKey;
  const cryptr = new Cryptr(secretKey);
  const encryptedValue = cryptr.encrypt(value);
  return encryptedValue;
};

/**
 * This function use to decrypt values using Cryptr
 * @param {*} value : encrypted value
 * @returns : decrypted value
 */
const decrypt = value => {
  const secretKey = config?.cookieSecretKey;
  const cryptr = new Cryptr(secretKey);
  const decryptedValue = cryptr.decrypt(value);
  return decryptedValue;
};

/**
 * This function use to set session token
 * @param {*} res
 * @param {*} data
 */
const setSessionTokenCookie = (res, data) => {
  const secret = {
    userId: data?._id,
    email: data?.email,
  };
  const sessionToken = jwt.sign(secret, config.cookieSecretKey, {
    expiresIn: "24h"
  });

  // Encrypt session token
  const encryptedSessionToken = encrypt(sessionToken);

  // Set the expiration date for the cookie
  const cookieExpirationDate = new Date(Date.now() + 60 * 60 * 1000);

  // Set the session token cookie in the response
  res.cookie("sessionTokenCookie", encryptedSessionToken, {
    expires: cookieExpirationDate,
    httpOnly: true,
    secure: true,
    sameSite: "Strict"
  });
};

/**
 * This function use to refresh session token
 * @param {*} res
 * @param {*} data
 */
const refreshSessionTokenCookie = (res, data) => {
  try {
    const secret = {
      userId: data?.userId,
      email: data?.email,
    };

    const newSessionToken = jwt.sign(secret, config.cookieSecretKey, {
      expiresIn: "1h"
    });

    const encryptedSessionToken = encrypt(newSessionToken);
    const cookieExpirationDate = new Date(Date.now() + 60 * 60 * 1000);
    res.cookie("sessionTokenCookie", encryptedSessionToken, {
      expires: cookieExpirationDate,
      httpOnly: true,
      secure: true,
      sameSite: "Strict"
    });
  } catch (error) {}
};

function generateText() {
  return crypto
    .randomBytes(Math.ceil(8 / 2))
    .toString("hex")
    .slice(0, 8);
}

const common = { commonResponse, encrypt, decrypt, setSessionTokenCookie, refreshSessionTokenCookie, generateText };

module.exports = common;
