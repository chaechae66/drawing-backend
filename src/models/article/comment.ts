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
const commentSchema = new mongoose.Schema(
  {
    regDate: {
      type: Date,
      required: true,
    },
    userInfo: userSchema,
    body: {
      type: String,
    },
    user: {
      type: String,
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

module.exports = mongoose.model("Comment", commentSchema);
export {};
