const { verify } = require("../../utils/jwt");

const authJWT = (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split("Bearer ")[1];
      const result = verify(token);

      if (result.success) {
        req.tokenID = result.id;
        next();
      } else {
        res.status(401).send({
          success: false,
          message: result.message,
        });
      }
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
};

module.exports = authJWT;
export {};
