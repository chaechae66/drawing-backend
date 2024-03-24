const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
  {
    regDate: {
      type: Date,
      required: true,
    },
    body: {
      type: String,
      require: true,
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
