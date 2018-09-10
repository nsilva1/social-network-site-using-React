const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

//Load Post schema
const Post = require('../../models/Post');
//Load Profile model
const Profile = require('../../models/Profile');

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

//@route    DELETE api/posts/:id
//@desc     Delete post by ID.
//@access   Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //Check for Post Owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: 'User not authorized' });
          }
          //Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No Post found' }));
    });
  }
);

//@route    POST api/posts/like/:id
//@desc     Like post.
//@access   Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //Check for Post Owner
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(401)
              .json({ alreadyliked: 'User already liked this post' });
          }
          //add user id to likes array
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No Post found' }));
    });
  }
);

//@route    POST api/posts/unlike/:id
//@desc     Unlike post.
//@access   Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //Check for Post Owner
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: 'You have not yet liked this post' });
          }
          //Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //splice out of array
          post.likes.splice(removeIndex, 1);

          //save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No Post found' }));
    });
  }
);

//@route    POST api/posts/comment/:id
//@desc     Comment on a post.
//@access   Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { erors, isValid } = validatePostInput(req.body);
    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        //Add comments to array
        post.comments.unshift(newComment);
        //Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(400).json({ nopostfound: 'No Post found' }));
  }
);

//@route    DELETE api/posts/comment/:id/:comment_id
//@desc     Delete Comment from a post.
//@access   Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        //Check to see if comment exist
        if (
          posts.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentdoesnotexist: 'Comment does not exists.' });
        }
        //Get remove Index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        //Splice out of array
        post.comments.splice(removeIndex, 1);

        //Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(400).json({ nopostfound: 'No Post found' }));
  }
);

module.exports = router;
