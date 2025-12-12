// routes/complaintRoutes.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Complaint route works");
});

module.exports = router;
