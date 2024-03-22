const express = require("express"),
  multer = require("multer"),
  router = express.Router();
const Article = require("../models/article");

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
  const article = new Article({
    article: {
      data: req.file.buffer.toString("base64"),
      contentType: req.file.mimetype,
      user: JSON.parse(req.body.user),
    },
  });
  await article.save();
  res.json({
    success: true,
  });
});

module.exports = router;
export {};
