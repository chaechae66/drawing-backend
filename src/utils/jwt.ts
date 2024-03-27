const jwt = require("jsonwebtoken"),
  mongoose = require("mongoose");
const secret = process.env.JWTSECRETKEY;
const Refresh = require("../models/user/refresh");

module.exports = {
  sign: (user) => {
    const payload = { id: user.id };

    return jwt.sign(payload, secret, {
      algorithm: "HS256",
      expiresIn: "1h",
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
  refreshVerify: async (token, userId) => {
    try {
      const findToken = Refresh.findOne({ id: userId });
      if (token === findToken) {
        try {
          jwt.verify(token, secret);
          return true;
        } catch (err) {
          return false;
        }
      } else {
        return false;
      }
    } catch (err) {
      return;
    }
  },
};
