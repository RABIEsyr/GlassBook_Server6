var jwt = require("jsonwebtoken");
const db = require("../db/db");
const checkJwt = require("./../middleware/checkAuth");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = function (io) {
  var array_of_connection = [];
  let senderTokent;
  let sessionID = {};
  let id;

  io.use(function (socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, "lol", function (err, decoded) {
        if (err) return next(new Error("Authentication error"));
        socket.decoded = decoded;
        senderTokent = decoded;
        sessionID[id] = senderTokent.user._id;

        next();
      });
    } else {
      next(new Error("Authentication error"));
    }
  }).on("connection", function (socket) {
    array_of_connection.push(socket);

    socket._id = senderTokent.user._id;
    const sessionMap = {};

    socket.on("msg", function (message) {
      let id = message.id;
      sessionMap[message._id] = socket.id;

      //     db.userSchema.find({isAdmin: true}, function(err, admins) {
      //       const newMessage = new db.chatSchema();

      //       newMessage.from = message._id;

      //       for (let admin of admins) {
      //           newMessage.to.push(admin._id)
      //       }

      //       newMessage.content = message.message;

      //       newMessage.save();

      for (let i = 0; i < array_of_connection.length; i++) {
        if (array_of_connection[i]._id == id) {
          array_of_connection[i].emit("msg", message);
        }
      }
    });
    socket.on("new-post", (post) => {
      db.userSchema
        .findOne({ _id: socket._id })
        .populate("friends")
        .exec((err, users) => {
          for (let i = 0; i < array_of_connection.length; i++) {
            for (let j = 0; j < users.friends.length; j++) {
              if (array_of_connection[i]._id == users.friends[j]._id) {
                array_of_connection[i].emit("new-post", post);
              }
            }
          }
        });
      socket.emit("new-post", post);
    });

    socket.on("new-fr-req", (id) => {
      for (let i = 0; i < array_of_connection.length; i++) {
        if (array_of_connection[i]._id == id) {
          db.userSchema.findOne({ _id: id }).exec((err, result) => {
            array_of_connection[i].emit("new-fr-req", result);
          });
        }
      }
    });

    socket.on("new-fr-req", (id) => {
      for (let i = 0; i < array_of_connection.length; i++) {
        if (array_of_connection[i]._id == id) {
          db.userSchema.findOne({ _id: id }).exec((err, result) => {
            array_of_connection[i].emit("new-fr-req", result);
            array_of_connection[i].emit("get-fr-req-data", "111111111");
          });
        }
      }
    });

    socket.on("new-comment", async(msg) => {
      // console.log('chat.js new-comment', msg, ', user id:', socket._id)
      let connectionsSet = new Set(array_of_connection)
      let newComment = new db.commentSchema();
      console.log("sender id", socket._id)
      newComment.content = msg.comment;
      (newComment.post = msg.postID), (newComment.user = socket._id);
      newComment.save((err, comment) => {
        db.postSchema
          .updateOne({ _id: msg.postID }, { $push: { comments: comment._id } })
          .exec(() => {
            db.postSchema
              .findOne({ _id: comment.post })
              .populate("owner")
              .exec((err, post) => {
                let friendList = post.owner.friends
                for (let conn of array_of_connection) {
                  if (friendList.indexOf(conn._id) !== -1) {
                    io.to(conn.id).emit("new-comment-posted", comment)
                  }
                }               
              });
          })
      });
    });
    // socket.on('get-fr-req-data', (id) => {
    //   for (let i = 0; i < array_of_connection.length; i++) {
    //     if (array_of_connection[i]._id == id) {
    //       console.log('cha.js', id)

    //       db.userSchema.findOne({ _id: id })
    //         .exec((err, result) => {
    //           array_of_connection[i].emit('get-fr-req-data', '111111111')
    //         })

    //     }
    //   }
    // })
  });
};
