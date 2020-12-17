const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;
const db = require("../db/db");
const checkJwt = require("./../middleware/checkAuth");
var fs = require("fs");

testFolder = "uploads/";

router.post("/search-user", checkJwt, async (req, res, next) => {
  let name = req.body.name;

  db.userSchema.find(
    {
      name: { $regex: `${name}`, $options: "i" },
    },
    (err, users) => {
      if (err) {
        res.json({
          success: false,
        });
      } else {
        if (users) {
          var result = users.map((item) => {
            const contents = fs.readFileSync(testFolder + item._id + ".PNG", {
              encoding: "base64",
            });
            if (contents)
              return { name: item["name"], id: item["_id"], image: contents };
          });

          res.json({
            success: true,
            users: result,
          });
        }
      }
    }
  );
});

module.exports = router;
