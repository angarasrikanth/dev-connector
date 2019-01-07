const express = require("express");
const router = express.Router();

// route  GET api/posts/tests
// desc Tests posts route
// public route
router.get("/test", (req, res) => res.json({ msg: "Posts works!!Hurray" }));

module.exports = router;
