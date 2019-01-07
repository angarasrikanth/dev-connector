const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

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

// route  POST api/profile
// desc post Create or update user profile
// @access private route
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
      profileFields.githubUsername = req.body.githubUsername;
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
    Profile.findOne({ user: req.body.user }).then(profile => {
      if (profile) {
        //update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(res.json(profile));
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

module.exports = router;
