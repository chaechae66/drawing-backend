const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
});

const articleSchema = new mongoose.Schema(
  {
    data: {
      type: String,
      required: true,
    },
    contentType: { type: String, required: true },
    user: {
      type: String,
    },
    userInfo: userSchema,
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
