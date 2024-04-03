const jwt = require("jsonwebtoken"),
  mongoose = require("mongoose");
const secret = process.env.JWTSECRETKEY;

module.exports = {
  sign: (userId) => {
    const payload = { id: userId };

    return jwt.sign(payload, secret, {
      algorithm: "HS256",
      expiresIn: "3h",
    });
  },
  verify: (token) => {
    let decoded = null;
    try {
      decoded = jwt.verify(token, secret);
      return {
        success: true,
        id: decoded.id,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  },
  getExipreAt: (token) => {
    let decoded = null;
    try {
      decoded = jwt.decode(token, secret);
      return {
        success: true,
        id: decoded.exp,
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  },
  refresh: () => {
    return jwt.sign({}, secret, {
      algorithm: "HS256",
      expiresIn: "14d",
    });
  },
  refreshVerify: async (token) => {
    try {
      jwt.verify(token, secret);
      return true;
    } catch (err) {
      return false;
    }
  },
};
