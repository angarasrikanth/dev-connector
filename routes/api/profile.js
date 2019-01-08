const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

//Load profile model
const Profile = require("../../routes/models/Profile");
const User = require("../../routes/models/User");

// route  GET api/profile/tests
// desc Tests profile route
// public route
router.get("/test", (req, res) => res.json({ msg: "Profile works!!Hurray" }));

// route  GET api/profile
// desc get current user profile
// @access private route
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noProfile = "There is no profile for this user";
          return res.status(400).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// route  POST api/profile/all
// desc   GET profile by all
// @access public route

router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noProfiles = "There is no profiles";
        return res.status(400).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(400).json({ profile: "There is no profiles" }));
});

// route  POST api/profile/handle/:handle
// desc   GET profile by handle
// @access public route

router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There is no profile for this user";
        return res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(400).json({ profile: "There is no profile for this user" })
    );
});

// route  POST api/profile/user/:user_id
// desc   GET profile by user_id
// @access public route

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There is no profile for this user";
        return res.status(400).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(400).json({ profile: "There is no profile for this user" })
    );
});

// route  POST api/profile
// desc post Create or update user profile
// @access private route
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    //GET fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    //skills split into array
    if (req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }
    //Social
    profileFields.social = {};

    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.LinkedIn) profileFields.social.LinkedIn = req.body.LinkedIn;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.Instagram) profileFields.social.Instagram = req.body.Instagram;
    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        //create
        //check if there is any handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "This Handle already exists";
            res.status(400).json(errors);
          }
          //create and save profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// route  POST api/profile/experience
// desc   Add experience to profile
// @access private route
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    //Check validation
    if (!isValid) {
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

      //Add to exp array
      profile.experience.unshift(newExp);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// route  POST api/profile/education
// desc   Add education to profile
// @access private route
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEducation = {
        school: req.body.school,
        degree: req.body.degree,
        fieldOfStudy: req.body.fieldOfStudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //Add to exp array
      profile.education.unshift(newEducation);
      profile.save().then(profile => res.json(profile));
    });
  }
);
module.exports = router;
