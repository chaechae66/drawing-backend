const express = require("express"),
  multer = require("multer"),
  router = express.Router();
const Article = require("../models/article/article");
const Like = require("../models/article/like");
const Comment = require("../models/article/comment");
const User = require("../models/user/user");
const ObjectId = require("mongoose").Types.ObjectId;
const authJWT = require("../routes/user/authJWT");

const upload = multer({
  storage: multer.memoryStorage(),
  filefilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimtype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png .jpg and .jpeg format allowed!'"));
    }
  },
});

router.post(
  "/",
  upload.single("drawingImage"),
  authJWT,
  async (req, res, next) => {
    const userUUID = JSON.parse(req.body.user);
    const userID = req.tokenID;
    if (!userUUID) {
      res.status(400).send({
        success: false,
        message: "UUID가 존재하지 않습니다.",
      });
      return;
    }
    if (!req.file.buffer || !req.file.mimetype) {
      res.status(400).send({
        success: false,
        message: "들어온 파일이 없습니다.",
      });
      return;
    }
    if (!Buffer.isBuffer(req.file.buffer)) {
      res.status(400).send({
        success: false,
        message: "유효하지 않는 파일이 들어왔습니다.",
      });
      return;
    }
    try {
      const userInfo = await User.findOne({ id: userID });
      if (userID && !userInfo) {
        res.status(401).send({
          success: false,
          message: "유저 정보가 일치하지 않습니다.",
        });
        return;
      }
      const article = new Article({
        data: req.file.buffer.toString("base64"),
        contentType: req.file.mimetype,
        user: !userID ? userUUID : null,
        userInfo: userInfo && {
          id: userInfo.id,
          nickname: userInfo.nickname,
        },
        regDate: Date.now(),
      });
      await article.save();
      res.json({
        success: true,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const imgList = await Article.find({}).lean();
    res.json({
      success: true,
      data: imgList,
    });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/:imgID",
  upload.single("drawingImage"),
  authJWT,
  async (req, res, next) => {
    const loginID = req.tokenID;
    const uuid = req.headers.uuid;
    if (!uuid) {
      res.status(400).send({
        success: false,
        message: "UUID가 존재하지 않습니다.",
      });
      return;
    }
    if (!req.file.buffer || !req.file.mimetype) {
      res.status(400).send({
        success: false,
        message: "들어온 파일이 없습니다.",
      });
      return;
    }
    if (!req.params.imgID) {
      res.status(400).send({
        success: false,
        message: "들어온 이미지 ID가 없습니다.",
      });
      return;
    }
    if (!Buffer.isBuffer(req.file.buffer)) {
      res.status(400).send({
        success: false,
        message: "유효하지 않는 파일이 들어왔습니다.",
      });
      return;
    }
    try {
      const post = await Article.findById(req.params.imgID);

      if (post.user ? post.user !== uuid : post.userInfo.id !== loginID) {
        res.status(401).send({
          success: false,
          message: "권한이 없습니다.",
        });
        return;
      }
      post.data = req.file.buffer.toString("base64");
      post.contentType = req.file.mimetype;
      await post.save();
      res.json({
        success: true,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.delete("/:imgID", authJWT, async (req, res, next) => {
  const loginID = req.tokenID;
  const uuid = req.headers.uuid;
  if (!uuid) {
    res.status(400).send({
      success: false,
      message: "UUID가 존재하지 않습니다.",
    });
    return;
  }
  if (!req.params.imgID) {
    res.status(400).send({
      success: false,
      message: "들어온 이미지 ID가 없습니다.",
    });
    return;
  }
  try {
    const post = await Article.findById(req.params.imgID);

    if (post.user ? post.user !== uuid : post.userInfo.id !== loginID) {
      res.status(401).send({
        success: false,
        message: "권한이 없습니다.",
      });
      return;
    }
    await Promise.all([
      Article.findByIdAndDelete(req.params.imgID),
      Like.deleteMany({ articleID: new ObjectId(req.params.imgID) }),
      Comment.deleteMany({ articleID: new ObjectId(req.params.imgID) }),
    ]);
    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:imgID", async (req, res, next) => {
  if (!req.params.imgID) {
    res.status(400).send({
      success: false,
      message: "들어온 이미지 ID가 없습니다.",
    });
    return;
  }
  try {
    const detail = await Article.findById(req.params.imgID).lean();
    res.json({
      success: true,
      data: detail,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:imgID/like", authJWT, async (req, res, next) => {
  const loginID = req.tokenID;
  const uuid = req.headers.uuid;
  if (!uuid) {
    res.status(400).send({
      success: false,
      message: "UUID가 존재하지 않습니다.",
    });
    return;
  }
  if (!req.params.imgID) {
    res.status(400).send({
      success: false,
      message: "들어온 이미지 ID가 없습니다.",
    });
    return;
  }
  try {
    const { imgID } = req.params;

    const userInfo = await User.findOne({ id: loginID });
    if (loginID && !userInfo) {
      res.status(401).send({
        success: false,
        message: "유저 정보가 일치하지 않습니다.",
      });
      return;
    }

    const likeUsers = await Like.findOne({
      user: loginID ? loginID : uuid,
      articleID: new ObjectId(imgID),
    }).lean();

    res.json({
      success: true,
      data: likeUsers,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/:imgID/like", authJWT, async (req, res, next) => {
  const loginID = req.tokenID;
  const uuid = req.headers.uuid;
  if (!uuid) {
    res.status(400).send({
      success: false,
      message: "UUID가 존재하지 않습니다.",
    });
    return;
  }
  if (!req.params.imgID) {
    res.status(400).send({
      success: false,
      message: "들어온 이미지 ID가 없습니다.",
    });
    return;
  }
  try {
    const { imgID } = req.params;

    const userInfo = await User.findOne({ id: loginID });
    if (loginID && !userInfo) {
      res.status(401).send({
        success: false,
        message: "유저 정보가 일치하지 않습니다.",
      });
      return;
    }

    const article = await Article.findById(imgID);

    const like = await Like.findOne({
      user: loginID ? loginID : uuid,
      articleID: new ObjectId(imgID),
    });

    if (!like) {
      const newLike = new Like({
        user: loginID ? loginID : uuid,
        isLike: true,
        articleID: new ObjectId(imgID),
      });
      article.likeCount++;
      await Promise.all([newLike.save(), article.save()]);
    } else if (like && like.isLike) {
      article.likeCount--;
      await Promise.all([
        Like.deleteOne({
          user: loginID ? loginID : uuid,
          articleID: new ObjectId(imgID),
        }),
        article.save(),
      ]);
    }

    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/:imgID/comment", authJWT, async (req, res, next) => {
  const { imgID } = req.params;
  const loginID = req.tokenID;
  const uuid = req.headers.uuid;

  if (!uuid) {
    res.status(400).send({
      success: false,
      message: "UUID가 존재하지 않습니다.",
    });
    return;
  }
  if (!imgID) {
    res.status(400).send({
      success: false,
      message: "들어온 이미지 ID가 없습니다.",
    });
    return;
  }
  try {
    const userInfo = await User.findOne({ id: loginID });
    if (loginID && !userInfo) {
      res.status(401).send({
        success: false,
        message: "유저 정보가 일치하지 않습니다.",
      });
      return;
    }
    const article = await Article.findById(imgID);

    const newComment = new Comment({
      articleID: new ObjectId(imgID),
      user: !loginID ? uuid : null,
      userInfo: loginID ? userInfo : null,
      body: req.body.comment,
      regDate: Date.now(),
    });

    article.commentCount++;

    await Promise.all([newComment.save(), article.save()]);

    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:imgID/comment", async (req, res, next) => {
  const { imgID } = req.params;
  if (!imgID) {
    res.status(400).send({
      success: false,
      message: "들어온 이미지 ID가 없습니다.",
    });
    return;
  }
  try {
    const commentsByArticleID = await Comment.find({
      articleID: new ObjectId(imgID),
    }).lean();

    res.json({
      success: true,
      data: commentsByArticleID,
    });
  } catch (e) {
    next(e);
  }
});

router.put("/comment/:commentID", authJWT, async (req, res, next) => {
  const loginID = req.tokenID;
  const uuid = req.headers.uuid;
  if (!uuid) {
    res.status(400).send({
      success: false,
      message: "UUID가 존재하지 않습니다.",
    });
    return;
  }
  if (!req.params.commentID) {
    res.status(400).send({
      success: false,
      message: "들어온 코멘트 ID가 없습니다.",
    });
    return;
  }
  try {
    const comment = await Comment.findById(req.params.commentID);
    const userInfo = await User.findOne({ id: loginID });
    if (loginID && !userInfo) {
      res.status(401).send({
        success: false,
        message: "유저 정보가 일치하지 않습니다.",
      });
      return;
    }
    if (
      comment.user ? comment.user !== uuid : comment.userInfo.id !== loginID
    ) {
      res.status(401).send({
        success: false,
        message: "권한이 없습니다.",
      });
      return;
    }
    comment.body = req.body.comment;
    await comment.save();

    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

router.delete("/:imgID/comment/:commentID", authJWT, async (req, res, next) => {
  const loginID = req.tokenID;
  const uuid = req.headers.uuid;
  if (!uuid) {
    res.status(400).send({
      success: false,
      message: "UUID가 존재하지 않습니다.",
    });
    return;
  }
  if (!req.params.commentID) {
    res.status(400).send({
      success: false,
      message: "들어온 코멘트 ID가 없습니다.",
    });
    return;
  }
  try {
    const comment = await Comment.findById(req.params.commentID);
    const userInfo = await User.findOne({ id: loginID });
    if (loginID && !userInfo) {
      res.status(401).send({
        success: false,
        message: "유저 정보가 일치하지 않습니다.",
      });
      return;
    }
    if (
      comment.user ? comment.user !== uuid : comment.userInfo.id !== loginID
    ) {
      res.status(401).send({
        success: false,
        message: "권한이 없습니다.",
      });
      return;
    }

    const article = await Article.findById(req.params.imgID);
    article.commentCount--;
    await Promise.all([
      article.save(),
      Comment.findByIdAndDelete(req.params.commentID),
    ]);

    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
export {};
