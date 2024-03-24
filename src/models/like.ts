const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      require: true,
    },
    isLike: {
      type: Boolean,
      require: true,
    },
    articleID: {
      type: mongoose.Types.ObjectId,
      ref: "Article",
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Like", likeSchema);
export {};
