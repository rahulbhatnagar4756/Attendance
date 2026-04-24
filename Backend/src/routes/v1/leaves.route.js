const express = require('express');
const validate = require('../../middlewares/validate');

const { auth } = require('../../middlewares/auth');
const { leavesValidation } = require('../../validations');
const { leavesController } = require('../../controllers');

const router = express.Router();

router.route('/apply').post(auth('applyForLeave'), validate(leavesValidation.applyForLeave), leavesController.applyForLeave);
router.route('/my-leaves').get(auth('applyForLeave'), leavesController.userLeaves);
router.route('/get-leave-details/:leaveId').get(auth('getLeaveByLeaveId'), leavesController.getLeaveByLeaveId);
router.route('/my-dashboard-leaves').get(auth('userDashboardLeaves'), leavesController.getUserDashboardLeaves);
router.route('/cancel-leave/:id').post(auth('cancelLeave'), leavesController.cancelLeave);
router
  .route('/get-user-pending-leaves/:userId')
  .get(auth('getUserPendingLeaves'), validate(leavesValidation.getUserPendingLeaves), leavesController.getUserPendingLeaves);
router
  .route('/get-user-leaves/:userId')
  .get(auth('getUserLeaves'), validate(leavesValidation.getUserLeaves), leavesController.getUserLeaves);

router
  .route('/get-user-approved-leaves/:userId')
  .get(auth('getUserLeaves'), validate(leavesValidation.getUserLeaves), leavesController.getUserApprovedLeaves);

router.route('/get-employees-leave').get(auth('getEmployeesLeaveHistory'), leavesController.getEmployeesLeaveHistory);

router.route('/get-team-employees-leave').get(auth('getTeamEmployeesLeaveHistory'), leavesController.getTeamEmployeesLeaveHistory);
router.route('/get-tagged-notified-users').get(auth('getTaggedNotifiedUsers'), leavesController.getTaggedNotifiedUsers);
router.route('/get-notified-data/:notificationId').get(auth('getNotifiedData'), leavesController.getNotifiedData);
router
  .route('/approve/:leaveId')
  .put(auth('approveLeave'), validate(leavesValidation.approveLeave), leavesController.approveLeave);
router.route('/urgent_leave/:userId').post(auth('urgentLeave'), leavesController.urgentLeave);
router
  .route('/reject/:leaveId')
  .put(auth('rejectLeave'), validate(leavesValidation.rejectLeave), leavesController.rejectLeave);
router.route('/today-leave-count').get(leavesController.todayLeavesCount);
router
  .route('/today-on-leave/:userId')
  .get(auth('todayOnLeave'), validate(leavesValidation.todayOnLeave), leavesController.todayOnLeave);

module.exports = router;

// auth("getTodayLeavesCount"),
