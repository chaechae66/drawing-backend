const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    nickname: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);
module.exports = mongoose.model("User", userSchema);
export {};
