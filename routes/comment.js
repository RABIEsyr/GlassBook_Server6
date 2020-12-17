const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const db = require("../db/db");

const checkJwt = require("./../middleware/checkAuth");

router.get('/get-comments', checkJwt, (req, res) => {
    let postID = req.headers["postid"];
    let id = req.decoded.user._id
    db.postSchema.findOne({ _id: postID })
        .populate('comments')
        .exec((err, comments) => {
             console.log('comments.js comments 322', comments)
            res.json(comments)
        })
    // console.log('comment.js pstId', postID)
    // console.log('comment.js userId', id)
    
})

module.exports = router;
