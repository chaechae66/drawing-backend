const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  article: {
    data: {
      type: String,
      required: true,
    },
    contentType: { type: String, required: true },
    user: {
      type: String,
      required: true,
    },
  },
});
module.exports = mongoose.model("Article", articleSchema);
