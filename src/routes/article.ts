const express = require("express"),
  multer = require("multer"),
  router = express.Router(),
  mongodb = require("mongodb");
const Article = require("../models/article");

const ObjectID = require("mongodb").ObjectID;

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
    const imgList = await Article.find({});
    res.json({
      success: true,
      data: JSON.stringify(imgList),
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

module.exports = router;
export {};
