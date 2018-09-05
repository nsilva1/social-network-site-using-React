const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load Profile Model
const Profile = require('../../models/Profile');

//Load User Model
const User = require('../../models/User');

//@route    GET api/profile/test
//@desc     Test Profile route
//@access   Public
router.get('/test', (req, res) => {
  res.json({ msg: 'Profile works' });
});

//@route    GET api/profile
//@desc     Get current users profile
//@access   Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noprofile = 'There is no profile for this user';
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route    POST api/profile
//@desc     Create and edit user profile
//@access   Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    //Get Fields
    const ProfileFields = {};
    ProfileFields.user = req.body.id;
    if (req.body.handle) ProfileFields.handle = req.body.handle;
    if (req.body.company) ProfileFields.company = req.body.company;
    if (req.body.website) ProfileFields.website = req.body.website;
    if (req.body.location) ProfileFields.location = req.body.location;
    if (req.body.status) ProfileFields.status = req.body.status;
    if (req.body.bio) ProfileFields.bio = req.body.bio;
    if (req.body.githubusername)
      ProfileFields.githubusername = req.body.githubusername;

    //Skills - split into array
    if (typeof req.body.skills !== 'undefined') {
      ProfileFields.skills = req.body.skills.split(',');
    }

    //Social
    ProfileFields.social = {};
    if (req.body.youtube) ProfileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) ProfileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) ProfileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) ProfileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) ProfileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.body.id }).then(profile => {
      if (profile) {
        //Update
        profile
          .findOneAndUpdate(
            { user: req.user.id },
            { $set: ProfileFields },
            { new: true }
          )
          .then(profile => res.json(profile));
      } else {
        //Create

        //Check if handle exists
        Profile.findOne({ handle: ProfileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = 'Handle Already Exists';
            res.status(400).json(errors);
          }

          //Save Profile
          new Profile(ProfileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

module.exports = router;
