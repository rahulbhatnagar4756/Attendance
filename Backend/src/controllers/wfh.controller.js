const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { wfhService } = require('../services');
const { getUserIdToken } = require('../middlewares/auth');

const applyForWfh = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  await wfhService.applyForWfh(req.files, req.body, userId);
  res.status(httpStatus.OK).send({ message: 'Applied Successfully.' });
});

const getWfhRequests = catchAsync(async (req, res) => {
  const getUserWfhRequests = await wfhService.getWfhRequests(req.params.userId, req.query.page);
  res.status(httpStatus.OK).send({ getUserWfhRequests });
});

const approveWfhRequest = catchAsync(async (req, res) => {
  const parentId = await getUserIdToken(req.headers['authorization']);
  await wfhService.approveWfhRequest(req.params.wfhId, req.body, parentId);
  res.status(httpStatus.OK).send({ message: 'Approved Successfully.' });
});

const rejectWfhRequest = catchAsync(async (req, res) => {
  const parentId = await getUserIdToken(req.headers['authorization']);
  await wfhService.rejectWfhRequest(req.params.wfhId, req.body);
  res.status(httpStatus.OK).send({ message: 'Rejected Successfully.' });
});

const cancelWorkFromHome = catchAsync(async (req, res) => {
  await wfhService.cancelWorkFromHome(req.params.id);
  res.status(httpStatus.OK).send({ message: 'Cancelled Successfully.' });
});

const getWfhTeamListEmployees = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const wfhTeamDetails = await wfhService.getWfhTeamListEmployees(userId ,req.query);
  res.status(httpStatus.OK).send({ wfhTeamDetails });
});

module.exports = {
    applyForWfh,
    getWfhRequests,
    approveWfhRequest,
    rejectWfhRequest,
    cancelWorkFromHome,
    getWfhTeamListEmployees,
};
