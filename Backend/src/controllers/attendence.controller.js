const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { attendenceService } = require('../services');
const { getUserIdToken } = require('../middlewares/auth');

const getCurrentDate = catchAsync(async (req, res) => {
  const date = await attendenceService.getCurrentDate();
  res.status(httpStatus.OK).send(date);
});

const checkIn = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  await attendenceService.checkIn(userId, req.body);
  res.status(httpStatus.OK).send({
    message: 'check in successfully',
  });
});

const checkOut = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const response = await attendenceService.checkOut(userId, req.body,  req.files);
  if (response) {
    res.status(httpStatus.OK).send({
      message: 'check out successfully',
      statusUpdated: true,
    });
  } else {
    res.status(httpStatus.OK).send({
      message: 'check out not successfull',
      statusUpdated: false
    });
  }
});

const breakStart = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  await attendenceService.breakStart(req.body, userId);
  res.status(httpStatus.OK).send({
    message: 'break started',
  });
});

const breakEnd = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  await attendenceService.breakEnd(userId);
  res.status(httpStatus.OK).send({
    message: 'break ended',
  });
});
//-----for user
const getAttendenceOfDay = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const result = await attendenceService.getAttendenceOfDay(userId);
  res.status(httpStatus.OK).send({
    result,
  });
});
//-----for admin

const getUserCurrentSession = catchAsync(async (req, res) => {
  const result = await attendenceService.getAttendenceOfDay(req.params.userId);
  res.status(httpStatus.OK).send({
    result,
  });
});

const getCurrentMonthAttendence = catchAsync(async (req, res) => {
  const result = await attendenceService.getCurrentMonthAttendence(req.params.userId);
  res.status(httpStatus.OK).send({
    result,
  });
});

const getSelectedRangeAttendence = catchAsync(async (req, res) => {
  const result = await attendenceService.getSelectedRangeAttendence(req.body, req.params.userId);
  res.status(httpStatus.OK).send({
    result,
  });
});

const getAttendenceOfSpecificDate = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const result = await attendenceService.getAttendenceOfSpecificDate(userId, req.query.date);
  res.status(httpStatus.OK).send({
    result,
  });
});

const presentUserCount = catchAsync(async (req, res) => {
  const usersCount = await attendenceService.presentUserCount();
  res.status(httpStatus.OK).send({ usersCount });
});

const todayReport = catchAsync(async (req, res) => {
  const usersCount = await attendenceService.todayReport(req.query);
  res.status(httpStatus.OK).send({ usersCount });
});

const todayWfhReport = catchAsync(async (req, res) => {
  const wfhUsersCount = await attendenceService.todayWfhReport(req.query);
  res.status(httpStatus.OK).send({ wfhUsersCount });
});

const todayTeamReport = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const usersCount = await attendenceService.todayTeamReport(req.query, userId);
  res.status(httpStatus.OK).send({ usersCount });
});

const addNewAttendence = catchAsync(async (req, res) => {
  await attendenceService.addNewAttendence(req.body, req.params.userId);
  res.status(httpStatus.OK).send({ message: 'Addedd Successfully' });
});

const updateAttendence = catchAsync(async (req, res) => {
  await attendenceService.updateAttendence(req.body, req.params.userId);
  res.status(httpStatus.OK).send({ message: 'Updated Successfully' });
});

const removeTimeout = catchAsync(async (req, res) => {
  await attendenceService.removeTimeout(req.params.attandenceId);
  res.status(httpStatus.OK).send({ message: 'Updated Successfully' });
});

const removeBreak = catchAsync(async (req, res) => {
  await attendenceService.removeBreak(req.params.id);
  res.status(httpStatus.OK).send({ message: 'Updated Successfully' });
});

const downloadReport = catchAsync(async (req, res) => {
  const { from, to } = req.body;
  const data = await attendenceService.downloadReport(from, to);
  res.status(httpStatus.OK).send({ data, message: 'Downloaded Successfully' });
});

module.exports = {
  getCurrentDate,
  checkIn,
  checkOut,
  breakStart,
  breakEnd,
  getAttendenceOfDay,
  getUserCurrentSession,
  getCurrentMonthAttendence,
  getSelectedRangeAttendence,
  getAttendenceOfSpecificDate,
  presentUserCount,
  todayReport,
  todayTeamReport,
  addNewAttendence,
  updateAttendence,
  removeTimeout,
  downloadReport,
  removeBreak,
  todayWfhReport,
};
