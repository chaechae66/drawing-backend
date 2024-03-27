const express = require("express"),
  router = express.Router(),
  bcrypt = require("bcrypt");
const User = require("../models/user/user");
const jwt = require("../utils/jwt");
const Refresh = require("../models/user/refresh");

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

    const accessToken = jwt.sign(findUser);
    const { id: expiredId } = jwt.getExipreAt(accessToken);
    const refreshToken = jwt.refresh();

    const refresh = new Refresh({
      id: findUser.id,
      refreshToken,
    });

    await refresh.save();

    res.json({
      success: true,
      accessToken,
      id: findUser.id,
      nickname: findUser.nickname,
      expireAt: expiredId,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
export {};
