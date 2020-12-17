const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;
var multer = require("multer");
var fs = require("fs");
var path = require("path");

const checkJwt = require("./../middleware/checkAuth");
const db = require("../db/db");
const config = require("../config/config");

const DIR = "./posts";

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    cb(null, 1111 + ".PNG");
  },
});

let upload = multer({ storage: storage });

router.post("/new-post", checkJwt, upload.single("file"), (req, res, next) => {
  const text = req.body.data;

  var newPost = new db.postSchema();
  newPost.text = text;
  newPost.owner = req.decoded.user._id
  newPost.save((err, post) => {
    fs.rename("./posts/1111.PNG", `./posts/${post._id}.PNG`, (err) => {
      db.userSchema.update({ _id: newPost.owner }, { $push: { posts: post._id } })
        .exec()
      if (err) {
        es.json({
          success: false,
        });
      } else {
        res.json({
          success: true,
          post,
        });
      }
    });
  });
});

router.get("/get-posts", checkJwt, (req, res, next) => {
  const id = req.decoded.user._id
  let index = +req.headers["index"];
  console.log('post.js index 233:', index)
  db.userSchema.findOne({ _id: id })
    .populate('posts')
    .exec((err, users) => {
      console.log('index 111', index)
      console.log('posts 111', users.posts)

      //res.send(users.posts.slice(index, index + 3));
      //res.send(users.posts)

      if (index > users.posts.length) {
        res.json({
          success: false,
        });
      } else {
        res.send(users.posts.slice(index, index + 3));
      }
    })



});
router.get('/friends-post', checkJwt, async (req, res) => {
  let index = +req.headers["index2"];

  const id = req.decoded.user._id
  let fs = [];
  let posts = []
  let finalPosts = []

  db.userSchema.findOne({ _id: id })
    .exec((err, frnds) => {
      fs = frnds.friends
      posts = db.postSchema.find()
         .populate('comments')
          .exec()
      posts.then((value) => {
        value.map(p => {

          for (let i = 0; i < value.length; i++) {
            if (p.owner.toString() == fs[i]) {
              finalPosts.push(p)
            }
          }

        })
        res.send(finalPosts.slice(index, index + 2))
      })
    })




  //  db.userSchema.findOne({ _id: id })
  //   .exec( (err, frnds) => {
  //     fs =  frnds.friends

  //   })
  // posts = await db.postSchema.find().exec()
  // let finalPosts = []
  // posts.map( p => {

  //   for (let i = 0; i < fs.length; i++) {
  //     if (p.owner.toString() == fs[i]) {
  //        finalPosts.push(p)
  //     }
  //   }

  // })
  // if (index > finalPosts.length) {
  //   res.json({
  //     success: false,
  //   });
  // } else {
  //    console.log('post.js sss', finalPosts)
  //   res.send(finalPosts)

  // res.json(finalPosts.slice(index, index + 3))






})

const friendsPosts = function () {

}
module.exports = router;
