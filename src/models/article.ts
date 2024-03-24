const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    data: {
      type: String,
      required: true,
    },
    contentType: { type: String, required: true },
    user: {
      type: String,
      required: true,
    },
    regDate: {
      type: Date,
      required: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  }
);
module.exports = mongoose.model("Article", articleSchema);
export {};
