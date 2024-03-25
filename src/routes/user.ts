const express = require("express"),
  router = express.Router();
const User = require("../models/user/user");

router.post("/signup", async (req, res, next) => {
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

  const user = new User({
    id,
    nickname,
  });

  await user.save();
  try {
    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
export {};
