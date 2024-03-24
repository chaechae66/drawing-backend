const express = require("express"),
  multer = require("multer"),
  router = express.Router();
const Article = require("../models/article");
const Like = require("../models/like");

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
    await Article.findByIdAndDelete(req.params.imgID);
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
    const { userID } = req.params;
    const likeUsers = await Like.findOne({ user: userID }).lean();

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
      Like.findOne({ user: userID }),
    ]);

    if (!like) {
      const newLike = new Like({ user: userID, isLike: true });
      article.likeCount++;
      await Promise.all([newLike.save(), article.save()]);
    } else if (like && !like.isLike) {
      article.likeCount++;
      like.isLike = true;
      await Promise.all([like.save(), article.save()]);
    } else if (like && like.isLike) {
      like.isLike = false;
      article.likeCount--;
      await Promise.all([like.save(), article.save()]);
    }

    res.json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
export {};
