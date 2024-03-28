const express = require("express"),
  router = express.Router(),
  bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken");
const User = require("../../models/user/user");
const {
  sign,
  getExipreAt,
  refresh,
  verify,
  refreshVerify,
} = require("../../utils/jwt");

router.post("/signup", async (req, res, next) => {
  try {
    const { id, password, nickname } = req.body;
    if (!id || !password || !nickname) {
      res.status(400).send({
        success: false,
        message: "아이디, 비밀번호, nickname은 필수 사항입니다.",
      });
      return;
    }

    const findUser = await User.findOne({ id });
    if (findUser) {
      res.status(400).send({
        success: false,
        message: "이미 가입된 아이디가 있습니다.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      id,
      nickname,
      password: hashedPassword,
    });
    await user.save();

    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { id, password } = req.body;
    if (!id || !password) {
      res.status(400).send({
        success: false,
        message: "아이디, 비밀번호는 필수 사항입니다.",
      });
      return;
    }

    const findUser = await User.findOne({ id });
    if (!findUser.id || !findUser.password) {
      res.status(400).send({
        success: false,
        message: "로그인 정보가 일치하지 않습니다.",
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, findUser.password);

    if (!isPasswordCorrect || id !== findUser.id) {
      res.status(400).send({
        success: false,
        message: "로그인 정보가 일치하지 않습니다.",
      });
      return;
    }

    const accessToken = sign(findUser.id);
    const { id: expiredId } = getExipreAt(accessToken);
    const refreshToken = refresh();

    res.json({
      success: true,
      accessToken,
      refreshToken,
      id: findUser.id,
      nickname: findUser.nickname,
      expiredAt: expiredId,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/retoken", async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const authToken = req.headers.authorization.split("Bearer ")[1];
      const refreshToken = req.headers.refreshtoken;
      const authResult = verify(authToken);
      const decoded = jwt.decode(authToken);
      if (decoded === null) {
        res.status(401).send({
          success: false,
          message: "No authorized!",
        });
        return;
      }
      const refreshResult = await refreshVerify(refreshToken);

      if (!authResult.success && authResult.message === "jwt expired") {
        if (!refreshResult) {
          res.status(401).send({
            success: false,
            message: "만료되어 다시 로그인해주세요",
          });
          return;
        } else {
          const newAccessToken = sign(decoded.id);
          const { id: expiredId } = getExipreAt(newAccessToken);
          res.status(200).send({
            success: true,
            data: {
              accessToken: newAccessToken,
              expiredAt: expiredId,
            },
          });
          return;
        }
      }
    } else {
      res.status(400).send({
        success: false,
        message: "Acess token is not expired!",
      });
      return;
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
export {};
