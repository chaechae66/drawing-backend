const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

const likeSchema = new mongoose.Schema(
  {
    userInfo: userSchema,
    user: {
      type: String,
      require: true,
    },
    isLike: {
      type: Boolean,
      require: true,
    },
    articleID: {
      type: Schema.Types.ObjectId,
      ref: "Article",
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Like", likeSchema);
export {};
