const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Post = require("../../routes/models/Post");
const Profile = require("../../routes/models/Profile");

//validation
const validatePostInput = require("../../validation/post");

// route  GET api/posts/tests
// desc Tests posts route
// public route
router.get("/test", (req, res) => res.json({ msg: "Posts works!!Hurray" }));

// route  GET api/post
// desc get posts route
// @access public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ noPostsFound: "No pots found" }));
});

// route  GET api/post/:id
// desc get posts route by id
// @access public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ noPostFound: "No posts found with that ID" })
    );
});
// route  POST api/post
// desc create posts route
// @access private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// route DELETE api/post/:id
// desc  delete posts route
// @access private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        //Check for post owner
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notAuthorized: "User not authorized" });
        }
        //Delete
        post
          .remove()
          .then(() => res.json({ success: true }))
          .catch(err =>
            res.status(404).json({ postNotFound: "No post found" })
          );
      });
    });
  }
);

// route POST api/posts/like/:id
// desc  post posts route
// @access private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        console.log(req.user.id + " user id");
        //Check its id is already there(already liked)
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
        ) {
          return res
            .status(400)
            .json({ alreadyLiked: "User already liked this post" });
        }
        //Add user id to likes array
        post.likes.unshift({ user: req.user.id });
        post
          .save()
          .then(post => res.json(post))
          .catch(err => json.status(400).json(err));
      });
    });
  }
);

// route POST api/posts/unlike/:id
// desc  unlike post route
// @access private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        //Check its id is already there(already liked)
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
        ) {
          return res
            .status(400)
            .json({ notLiked: "You have not liked this post" });
        }
        //Get remove index
        const removeIndex = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);

        //Splice out of array
        post.likes.splice(removeIndex, 1);

        //Save
        post.save().then(post => res.json(post));
      });
    });
  }
);

// route POST api/posts/comment/:id
// desc  Add comment post route
// @access private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id).then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      };

      //Add to comments array
      post.comments.unshift(newComment);
      post
        .save()
        .then(post => res.json(post))
        .catch(err => res.status(404).json({ postNotFound: "No post found" }));
    });
  }
);

// route DELETE api/posts/comment/:id/:commentId
// desc  Delete comment post route
// @access private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id).then(post => {
      //Check if comment exists
      if (
        post.comments.filter(
          comment => comment._id.toString() === req.params.comment_id
        ).length === 0
      ) {
        return res
          .status(404)
          .json({ commentNotExist: "Comment does not exist" });
      }

      //removeIndex
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      //splice out of array
      post.comments.splice(removeIndex, 1);
      //save
      post.save().then(post => res.json(post));
    });
  }
);
module.exports = router;
