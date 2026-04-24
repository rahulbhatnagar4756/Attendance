const express = require("express");
const { auth } = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { teamManagementController } = require("../../controllers");
const { teamManagementValidation } = require("../../validations");

const router = express.Router();

router
  .route("/add-members/:leadId")
  .post(
    auth("addTeamMembers"),
    validate(teamManagementValidation.addTeamMembers),
    teamManagementController.addTeam
  );
router
  .route("/get-members/:leadId")
  .post(
    auth("getTeamMembers"),
    validate(teamManagementValidation.getTeamMembers),
    teamManagementController.getTeam
  );
router
  .route("/delete-members/:leadId")
  .delete(
    auth("deleteTeamMemebers"),
    validate(teamManagementValidation.deleteTeamMembers),
    teamManagementController.deleteTeam
  );

module.exports = router;
