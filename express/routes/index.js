var express = require("express");
const path = require("path");
var router = express.Router();
var multer = require("multer");
var upload = multer({ dest: path.resolve(__dirname, "uploads/") });

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/uploadFile", upload.any(), function (req, res, next) {
  res.json(req.files);
});

module.exports = router;
