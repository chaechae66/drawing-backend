let mongoose = require("mongoose"),
  express = require("express"),
  bodyParser = require("body-parser"),
  cors = require("cors");

require("dotenv").config();

const article = require("./routes/article");
const user = require("./routes/user/user");

const connection = process.env.mongodbURL;

mongoose
  .connect(connection)
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => console.log(err));

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extends: true,
  })
);
app.use(cors());
app.use("/article", article);
app.use("/user", user);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log("Connected to port " + port);
});
app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
export {};
