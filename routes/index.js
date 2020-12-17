const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
var fs = require("fs")
const path = require('path')

const db = require('../db/db');
const config = require('../config/config');

// const DIR = "./uploads";
// let storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, DIR);
//     },
//     filename: (req, file, cb) => {
//         cb(null, req.decoded.user._id + ".PNG");
//     },
// });
// let upload = multer({ storage: storage });

router.post('/sign-up', (req, res) => {
    email = req.body.email;
    password = req.body.password
    name = req.body.name;
    gender = req.body.gender

    if (email && password && name && gender) {

        db.userSchema.findOne({ email: email }, (err, doc) => {
            if (err) console.log(err);

            if (doc) {
                res.json(
                    {
                        success: false,
                        message: 'email already exists'
                    }
                );
            } else {
                user = new db.userSchema();
                user.email = email; user.password = password; user.name = name; user.gender = gender;
                user.save((err, result) => {
                    if (err) {
                        res.json(
                            {
                                success: false,
                                message: 'errr in database'
                            }
                        );
                    }
                    var token = jwt.sign(
                        { user: result },
                        config.secret
                    );



                    // let imgSrcString
                    // fs.readFile(`uploads/avatar.png`, (err, data) => {

                    //     //error handle
                    //     if (err) res.status(500).send(err);

                    //     //get image file extension name
                    //     let extensionName = path.extname(`uploads/avatar.png`);

                    //     //convert image file to base64-encoded string
                    //     let base64Image = new Buffer(data, 'binary').toString('base64');

                    //     //combine all strings
                    //     imgSrcString = `data:image/${extensionName.split('.').pop()};base64,${base64Image}`;

                    //     //send image src string into jade compiler
                    //     // console.log('indexjs 987789: ', imgSrcString);

                    //     //var img = "data:image/png;base64," + imgSrcString
                    //     // var data = img.replace(/^data:image\/\w+;base64,/, "");
                    //     // var buf = Buffer.from(data, 'base64')
                    //     fs.writeFile('uploads/111.PNG', imgSrcString, (err, result) => {
                    //         console.log(result)
                    //     });
                    // })

                    fs.readFile(`uploads/avatar.png`, (err, data) => {
                        fs.writeFile('uploads/' + result._id + ".PNG", data, 'base64', function (err) {
                            console.log('index.js 5555', err);
                        });
                    })





                    res.json(
                        {
                            success: true,
                            message: 'successfuly logged in',
                            token: token,
                            userId: result._id
                        }
                    );
                });
            }

        });

    } else {
        res.json({
            success: false,
            message: 'send your credentials'
        });
    }

});

router.post('/sign-in', (req, res) => {
    email = req.body.email;
    password = req.body.password

    if (email && password) {

        db.userSchema.findOne({ email: email }, (err, doc) => {
            if (err) console.log(err);

            if (doc) {
                var token = jwt.sign(
                    { user: doc },
                    config.secret
                );

                res.json(
                    {
                        success: true,
                        message: 'you are logged in',
                        token: token,
                        userId: doc._id
                    }
                );
            } else {
                res.json(
                    {
                        success: false,
                        message: 'email and password not match'
                    }
                )
            }
        });

    } else {
        res.json({
            success: false,
            message: 'send your credentials for login'
        });
    }

});

module.exports = router;