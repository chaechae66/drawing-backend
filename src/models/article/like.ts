const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
