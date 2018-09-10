const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

//Load Post schema
const Post = require('../../models/Post');

//Load Post validator
const validatePostInput = require('../../validation/post');

//@route    GET api/posts/test
//@desc     Test posts route
//@access   Public
router.get('/test', (req, res) => {
  res.json({ msg: 'Posts works' });
});

//@route    GET api/posts
//@desc     Get posts
//@access   Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'No posts found.' }));
});

//@route    GET api/posts/:id
//@desc     Get post by id
//@access   Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: 'No post found with that ID' })
    );
});

//@route    POST api/posts
//@desc     Create post.
//@access   Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { erors, isValid } = validatePostInput(req.body);
    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newpost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newpost.save().then(post => res.json(post));
  }
);

module.exports = router;
