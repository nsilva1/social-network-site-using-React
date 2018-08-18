const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Load secret key for jwt payload
const keys = require("../../config/keys");

//Load user schema
const User = require("../../models/User");

//@route    GET api/users/test
//@desc     Test Users route
//@access   Public
router.get("/test", (req, res) => {
  res.json({ msg: "Users works" });
});

//@route    POST api/users/register
//@desc     Register User
//@access   Public
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Account already exists." });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "r", //rating
        d: "mm" //Default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route    POST api/users/login
//@desc     Login User and get Web Token to enable access to restricted routes
//@access   Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const passsword = req.body.password;

  //Find user by email
  User.findOne({ email }).then(user => {
    //check for user
    if (!user) {
      return res.status(404).json({ email: "User not Found" });
    }
    //check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //Create jwt payload
        const payload = { id: user.id, name: user.name, avatar: user.avatar };

        //Sign Token
        jwt.sign(payload, keys.secretkey, { expiresIn: 3500 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
      } else {
        return res.status(400).json({ password: "Password Incorrect" });
      }
    });
  });
});

module.exports = router;
