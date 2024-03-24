const express = require("express"),
  multer = require("multer"),
  router = express.Router();
const Article = require("../models/article");
const Like = require("../models/like");
const Comment = require("../models/comment");
const ObjectId = require("mongoose").Types.ObjectId;

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

router.post("/", upload.single("drawingImage"), async (req, res, next) => {
  try {
    const article = new Article({
      data: req.file.buffer.toString("base64"),
      contentType: req.file.mimetype,
      user: JSON.parse(req.body.user),
      regDate: Date.now(),
    });
    await article.save();
    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

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
  async (req, res, next) => {
    try {
      const post = await Article.findById(req.params.imgID);
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

router.delete("/:imgID", async (req, res, next) => {
  try {
    await Promise.all([
      Article.findByIdAndDelete(req.params.imgID),
      Like.deleteMany({ articleID: new ObjectId(req.params.imgID) }),
    ]);
    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:imgID", async (req, res, next) => {
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

router.get("/:imgID/like/:userID", async (req, res, next) => {
  try {
    const { imgID, userID } = req.params;
    const likeUsers = await Like.findOne({
      user: userID,
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

router.post("/:imgID/like/:userID", async (req, res, next) => {
  try {
    const { imgID, userID } = req.params;

    const [article, like] = await Promise.all([
      Article.findById(imgID),
      Like.findOne({ user: userID, articleID: new ObjectId(imgID) }),
    ]);

    if (!like) {
      const newLike = new Like({
        user: userID,
        isLike: true,
        articleID: new ObjectId(imgID),
      });
      article.likeCount++;
      await Promise.all([newLike.save(), article.save()]);
    } else if (like && like.isLike) {
      article.likeCount--;
      await Promise.all([
        Like.deleteOne({ user: userID, articleID: new ObjectId(imgID) }),
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

router.post("/:imgID/comment/:userID", async (req, res, next) => {
  try {
    const { imgID, userID } = req.params;

    const article = await Article.findById(imgID);

    const newComment = new Comment({
      articleID: new ObjectId(imgID),
      user: userID,
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

router.get("/:imgID/comment/:userID", async (req, res, next) => {
  try {
    const { imgID } = req.params;
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

module.exports = router;
export {};
