const mongoose = require("mongoose");

const refreshSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);
module.exports = mongoose.model("Refresh", refreshSchema);
export {};
