const express = require("express");
const validate = require("../../middlewares/validate");
const { auth } = require("../../middlewares/auth");
const { requestController } = require("../../controllers");
const { requestChangesValidation } = require("../../validations");

const router = express.Router();
router
  .route("/post-request-changes")
  .post(
    auth("requestChanges"),
    validate(requestChangesValidation.sendRequest),
    requestController.postRequestChanges
  );
router
  .route("/get-request-changes")
  .get(auth("getRequestChange"), requestController.getRequestChanges);
router
  .route("/get-unseen-requests")
  .get(auth("getUnSeenRequestCount"), requestController.getUnSeenRequestCount);
router
  .route("/delete-request-changes")
  .post(auth("deleteRequest"), requestController.deleteRequestChanges);
router
  .route("/post-request-change")
  .post(auth("requestChange"), requestController.postRequestChange);
router
  .route("/update-seen-notifications")
  .put(
    auth("updateSeenNotifications"),
    requestController.updateSeenNotifications
  );
module.exports = router;
