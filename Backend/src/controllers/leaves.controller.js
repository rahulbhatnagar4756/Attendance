const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { leavesService } = require('../services');
const { getUserIdToken } = require('../middlewares/auth');

const applyForLeave = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  await leavesService.applyForLeave(req.files, req.body, userId);
  res.status(httpStatus.OK).send({ message: 'Applied Successfully.' });
});

const userLeaves = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const leaves = await leavesService.getUserLeaves(userId, req.query.page, type="user");
  res.status(httpStatus.OK).send({ leaves });
});

const getLeaveByLeaveId = catchAsync(async (req, res) => {
  const { leaveId } = req.params;
  const result = await leavesService.getLeaveByLeaveId(leaveId);
  res.status(httpStatus.OK).send({ result });
});

const getUserPendingLeaves = catchAsync(async (req, res) => {
  const leaves = await leavesService.getUserPendingLeaves(req.params.userId);
  res.status(httpStatus.OK).send(leaves);
});

const getUserLeaves = catchAsync(async (req, res) => {
  const leaves = await leavesService.getUserLeaves(req.params.userId, req.query.page, type="admin");
  res.status(httpStatus.OK).send({ leaves });
});

const getUserApprovedLeaves = catchAsync(async (req, res) => {
  const leaves = await leavesService.getUserApprovedLeaves(req.params.userId, req.query.page);
  res.status(httpStatus.OK).send({ leaves });
});

const getUserDashboardLeaves = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const leaves = await leavesService.getUserDashboardLeaves(userId, req.params.userId);
  res.status(httpStatus.OK).send(leaves);
});

const getEmployeesLeaveHistory = catchAsync(async (req, res) => {
  const leaves = await leavesService.getEmployeesLeaveHistory(req.query);
  res.status(httpStatus.OK).send({ leaves });
});

const getTaggedNotifiedUsers = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const leaves = await leavesService.getTaggedNotifiedUsers(userId,req.query);
  res.status(httpStatus.OK).send({ leaves });
});

const getTeamEmployeesLeaveHistory = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const leaves = await leavesService.getTeamEmployeesLeaveHistory(userId ,req.query);
  res.status(httpStatus.OK).send({ leaves });
});
const approveLeave = catchAsync(async (req, res) => {
  const parentId = await getUserIdToken(req.headers['authorization']);
  await leavesService.approveLeave(req.params.leaveId,req.params.userId, req.body, parentId);
  res.status(httpStatus.OK).send({ message: 'Approved Successfully.' });
});

const urgentLeave = catchAsync(async (req, res) => {
  const parentId = await getUserIdToken(req.headers['authorization']);
  await leavesService.urgentLeave(req.params.leaveId, req.params.userId,  req.body, parentId);
  res.status(httpStatus.OK).send({ message: 'Approved Successfully.' });
});

const rejectLeave = catchAsync(async (req, res) => {
  const parentId = await getUserIdToken(req.headers['authorization']);
  await leavesService.rejectLeave(req.params.leaveId,req.params.userId, req.body, parentId);
  res.status(httpStatus.OK).send({ message: 'Rejected Successfully.' });
});

const cancelLeave = catchAsync(async (req, res) => {
  await leavesService.cancelLeave(req.params.id);
  res.status(httpStatus.OK).send({ message: 'Cancelled Successfully.' });
});

const cancelApprovedLeave = catchAsync(async (req, res) => {
  await leavesService.cancelApprovedLeave(req.params.leaveId);
  res.status(httpStatus.OK).send({ message: 'Cancelled Successfully.' });
});

const todayLeavesCount = catchAsync(async (req, res) => {
  const usersLeaveCount = await leavesService.todayLeavesCount();
  res.status(httpStatus.OK).send({ usersLeaveCount });
});

const markAbsent = catchAsync(async (req, res) => {
  await leavesService.markAbsent(req.params.userId, req.body);
  res.status(httpStatus.OK).send({ message: 'Marked Absent Successfully.' });
});

const todayOnLeave = catchAsync(async (req, res) => {
  const onLeave = await leavesService.todayOnLeave(req.params.userId);
  res.status(httpStatus.OK).send({ onLeave });
});

const getNotifiedData = catchAsync(async (req, res) => {
  const leaves = await leavesService.getNotifiedData(req.params.notificationId);
  res.status(httpStatus.OK).send({ leaves });
});

module.exports = {
  applyForLeave,
  userLeaves,
  getUserPendingLeaves,
  getUserApprovedLeaves,
  getUserLeaves,
  getUserDashboardLeaves,
  approveLeave,
  urgentLeave,
  rejectLeave,
  getEmployeesLeaveHistory,
  cancelLeave,
  todayLeavesCount,
  cancelApprovedLeave,
  markAbsent,
  todayOnLeave,
  getTeamEmployeesLeaveHistory,
  getLeaveByLeaveId,
  getTaggedNotifiedUsers,
  getNotifiedData,
};
