const express = require("express");
const router = express.Router();
const webpush = require("web-push");

router.post("/notifications/subscribe", async (req, res) => {
  console.log(req.body);
  const payload = JSON.stringify({
    title: req.body.title,
    description: req.body.description,
    icon: req.body.icon,
  });
  console.log(req.body.subscription);
  webpush
    .sendNotification(req.body.subscription, payload)
    .then((result) => console.log())
    .catch((e) => console.log(e.stack));
  res.status(200).json({ success: true });
});
module.exports = router;
