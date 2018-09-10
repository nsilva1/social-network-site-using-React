const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

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
      .populate('user', ['name', 'avatar'])
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

//@route    GET api/profile/handle/:handle
//@desc     Get profile by handle
//@access   Public
router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.json(err));
});

//@route    GET api/profile/user/:user_id
//@desc     Get profile by ID
//@access   Public
router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.json(err));
});

//@route    GET api/profile/all
//@desc     Get all profiles
//@access   Public
router.get('/all', (req, res) => {
  const errors = {};

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = 'There are no profiles';
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.json({ profile: 'There are no profiles' }));
});

//@route    POST api/profile
//@desc     Create and edit user profile
//@access   Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //check validation
    if (!isValid) {
      //Return any errors with 400 ststus
      return res.status(400).json(errors);
    }

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

//@route    POST api/profile/experience
//@desc     Add experience to profile
//@access   Private
router.get(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    //check validation
    if (!isValid) {
      //Return any errors with 400 ststus
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      //Add to experience array
      profile.experience.unshift(newExp);
      //save
      profile.save().then(profile => res.json(profile));
    });
  }
);

//@route    POST api/profile/education
//@desc     Add education to profile
//@access   Private
router.get(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    //check validation
    if (!isValid) {
      //Return any errors with 400 ststus
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldOfStudy: req.body.fieldOfStudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      //Add to experience array
      profile.education.unshift(newEdu);
      //save
      profile.save().then(profile => res.json(profile));
    });
  }
);

//@route    DELETE api/profile/experience/:exp_id
//@desc     Delete experience from profile
//@access   Private
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get Remove Index
        const removeindex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        //Splice out of array
        profile.experience.splice(removeindex, 1);
        //Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route    DELETE api/profile/education/:edu_id
//@desc     Delete education from profile
//@access   Private
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get Remove Index
        const removeindex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        //Splice out of array
        profile.education.splice(removeindex, 1);
        //Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route    DELETE api/profile
//@desc     Delete user and profile
//@access   Private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() => {
        res.json({ success: true });
      });
    });
  }
);

module.exports = router;
