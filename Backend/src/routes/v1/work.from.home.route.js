const express = require('express');
const validate = require('../../middlewares/validate');

const { auth } = require('../../middlewares/auth');
const { workFromHomeValidation } = require('../../validations');
const { wfhController } = require('../../controllers');

const router = express.Router();

router.route('/apply').post(auth('applyForWfh'), validate(workFromHomeValidation.applyForWfh), wfhController.applyForWfh);
router.route('/get-user-wfh-requests').get(auth('getUserWfhRequests'), validate(workFromHomeValidation.getWfhRequests), wfhController.getWfhRequests);
router
  .route('/approve/:wfhId')
  .put(auth('approveWfh'), validate(workFromHomeValidation.approveWfhRequest), wfhController.approveWfhRequest);
router
    .route('/reject/:wfhId')
    .put(auth('rejectWfh'), validate(workFromHomeValidation.rejectWfhRequest), wfhController.rejectWfhRequest);
router.route('/cancel-work-from-home/:id').put(auth('cancelWfh'), wfhController.cancelWorkFromHome);
router.route('/get-team-list-employees-on-wfh').get(auth('getWfhTeamListEmployees'), wfhController.getWfhTeamListEmployees);

module.exports = router;