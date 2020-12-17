const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var waterfall = require('async-waterfall');

const checkJwt = require("./../middleware/checkAuth");
const db = require("../db/db");
var fs = require("fs");

testFolder = "uploads/";

router.post("/new-request", checkJwt, (req, res) => {
  const id = req.decoded.user._id;
  const requestId = req.body.id;
  let isExist = false;
  db.userSchema.findOne({ _id: requestId }).exec(function (err, user) {
    for (let i = 0; i < user.friendRequest.length; i++) {
      if (user.friendRequest[i] == id) {
        isExist = true;
      } else {
        isExist = false;
      }
    }
    for (let i = 0; i < user.friends.length; i++) {
      if (user.friends[i] == id) {
        isExist = true;
      } else {
        isExist = false;
      }
    }
    if (!isExist) {
      user.friendRequest.push(id);
      user.save();
      res.json({
        success: true,
      });
    } else {
      res.json({
        success: true,
      });
    }


  });

});

router.get("/get-friend-requests-length", checkJwt, (req, res) => {
  let id = req.decoded.user._id;

  db.userSchema.findOne({ _id: id }).exec((err, user) => {
    if (user) {
      if (user.friendRequest.length > 0) {
        res.json({
          length: user.friendRequest.length,
        });
      }
    }

  });
});

router.get("/get-friend-requests", checkJwt, (req, res) => {
  let id = req.decoded.user._id;
  let result;
  let nm;
  db.userSchema
    .findOne({ _id: id })
    .populate("friendRequest")
    .exec((err, users) => {
      if (users.friendRequest.length > 0) {
        result = users.friendRequest.map((item) => {
          const contents = fs.readFileSync(testFolder + item._id + ".PNG", {
            encoding: "base64",
          });
          if (contents) {
            db.userSchema.findOne({ _id: item }).exec((err, r) => {
              nm = r.name;
            });
            if (users.friendRequest) {
              users.friendRequest.map((u) => {
                if (u._id == item._id) {
                  nm = u.name;
                }
              });
            }
            return {
              name: nm,
              id: item["_id"],
              image: contents,
            };
          }
        });
      }

      res.json({
        result,
      });
    });
});

router.post("/submit-friend-request", checkJwt, (req, res) => {
  let id = req.decoded.user._id;
  let requestId = req.body.id;
  db.userSchema
    .findOne({ _id: id }, (err, user) => {
      user.friendRequest.map((item) => {
        if (item == requestId) {
          user.friends.push(requestId);
          user.friendRequest.splice(user.friendRequest.indexOf(requestId), 1);
          user.save();
        }
      });
    })
    .then(() => {
      db.userSchema.findOne({ _id: requestId }, (err, user2) => {
        user2.friends.push(id);
        user2.save();

        res.json({
          success: true,
        });
      });
    });
});

router.get("/get-friends", checkJwt, (req, res) => {
  let id = req.decoded.user._id;
  let result;
  db.userSchema
    .findOne({ _id: id })
    .populate("friends")
    .exec((err, user) => {
      result = user.friends.map((item) => {
        const contents = fs.readFileSync(testFolder + item._id + ".PNG", {
          encoding: "base64",
        });
        return {
          name: item.name,
          id: item._id,
          image: contents,
        };
      });
      res.json({
        result,
      });
    });
});

router.post('/remove-submitted-user', checkJwt, (req, res) => {
  let exist = false
  db.userSchema.findOne({ _id: req.decoded.user._id })
    //.populate('friends')
    .exec((err, user) => {
      if (user) {
        for (let i = 0; i < user.friends.length; i++) {
          if (user.friends[i] == req.body.id) {
            exist = true
          }

        }
        res.json({
          success: exist
        })
      } else {
        res.json({
          success: exist
        })
      }
    })

})
router.post('/request-pending', checkJwt, (req, res) => {
  let id = req.body.id

  db.userSchema.findOne({ _id: id })
    .exec((err, user) => {
      user.friendRequest.forEach(item => {

        if (item == req.decoded.user._id) {
          res.write('true')


        }
      })
      res.end()
    })

});
router.post('/remove-request-user-one', checkJwt, (req, res) => {
  // console.log('friendRequest.js id', req.body.id)
  // db.userSchema.findOne({ _id: req.decoded.user._id })
  //   .exec((err, user) => {
  //     console.log('friendRequest.js', user)
  //     res.json({
  //       success: true
  //     })
  //   })
  db.userSchema.updateOne({ _id: req.decoded.user._id }, { $pull: { friendRequest: req.body.id } })
    .exec((err, result) => {
      if (err) {
        res.json({
          success: false
        })
      } else {
        res.json({
          success: true
        })
      }
    })

})
module.exports = router;
