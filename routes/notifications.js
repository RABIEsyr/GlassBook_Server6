const express = require("express");
const router = express.Router();
const checkJwt = require("./../middleware/checkAuth");
const db = require("../db/db");

// router.get("", checkJwt, (req, res) => {
//   const notify = {};
//   db.userSchema.findOne({ _id: req.decoded.user._id }).exec((err, user) => {
//     if (user.friendRequest.length > 0 && user.friendRequest !== undefined) {
//       for (let i = 0; i < user.friendRequest.length; i++) {
//         notify.friendReq = user.friendRequest[i];
//         console.log("notification ", notify);
//         res.json({
//           notify,
//         });
//       }
//     }
//   });
// });
module.exports = router;
