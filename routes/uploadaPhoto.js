var express = require("express");
var router = express.Router();
var multer = require("multer");
const path = require("path");
const DIR = "./uploads";
const checkJwt = require("./../middleware/checkAuth");
var glob = require("glob");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);

var fs = require("fs"),
  request = require("request");

// var download = function (uri, filename, callback) {
//   request.head(uri, function (err, res, body) {
//     request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
//   });
// };

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    cb(null, req.decoded.user._id + ".PNG");
  },
});

let upload = multer({ storage: storage });

router.post("", checkJwt, upload.single("file"), function (req, res) {
  fs.readdirSync(testFolder).forEach((file) => {
    if (
      req.decoded.user._id + ".png" === file ||
      req.decoded.user._id + ".jpg" === file ||
      req.decoded.user._id + ".PNG" === file
    ) {
      fs.readFile(
        "./uploads/" + req.decoded.user._id + ".PNG",
        "base64",
        (err, base64Image) => {
          const dataUrl = `data:image/png;base64, ${base64Image}`;
          res.json(dataUrl);
        }
      );
    }
  });

});

testFolder = "uploads/";

router.get("/get-pic", checkJwt, (req, res) => {
  fs.readdirSync(testFolder).forEach((file) => {
    if (
      req.decoded.user._id + ".png" === file ||
      req.decoded.user._id + ".jpg" === file ||
      req.decoded.user._id + ".PNG" === file
    ) {
      fs.readFile(
        "./uploads/" + req.decoded.user._id + ".PNG",
        "base64",
        (err, base64Image) => {
          const dataUrl = `data:image/png;base64, ${base64Image}`;
          res.json(dataUrl);
        }
      );
    }
  });
});
router.post("/get-search-user-pic", checkJwt, (req, res) => {
  fs.readFile(
    "./uploads/" + req.body.id + ".PNG",
    "base64",
    (err, base64Image) => {
      const dataUrl = `data:image/png;base64, ${base64Image}`;
      res.json(dataUrl);
    }
  );
});

module.exports = router;
