const express = require("express");
const router = express.Router();

router.get("/stripe-key", (req, res) => {
  res.status(200).json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

module.exports = router;