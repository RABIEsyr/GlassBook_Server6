const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = function (req, res, next) {
    let token = req.headers["authorization"];

    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                res.json({
                    success: false,
                    message: 'not authenticated'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });

    } else {
        res.status(403).json({
            success: false,
            message: 'no token provided'
        });
    }
}