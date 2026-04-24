const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { requestService } = require("../services");

const postRequestChanges = catchAsync(async (req, res) => {
  await requestService.postRequestChanges(req.body);
  res.status(httpStatus.OK).send({
    message: "Request send successfully",
  });
});
const postRequestChange = catchAsync(async (req, res) => {
  await requestService.postRequestChange(req.body);
  res.status(httpStatus.OK).send({
    message: "Request send successfully",
  });
});

const getRequestChanges = catchAsync(async (req, res) => {
  const result = await requestService.getRequestChanges(req.query.page);
  res.status(httpStatus.OK).send({
    result
  });
});

const deleteRequestChanges = catchAsync(async (req, res) => {
  await requestService.deleteRequestChanges(req.body);
  res.status(httpStatus.OK).send({ message: "Request Removed Successfully" });
});
const updateSeenNotifications = catchAsync(async (req, res) => {
  await requestService.updateSeenNotifications();
  res.status(httpStatus.OK).send({ message: "Updated Successfully" });
});
const getUnSeenRequestCount = catchAsync(async (req, res) => {
  const requests = await requestService.getUnSeenRequestCount();
  res.status(httpStatus.OK).send({ requests });
});

module.exports = {
  postRequestChanges,
  postRequestChange,
  getRequestChanges,
  deleteRequestChanges,
  updateSeenNotifications,
  getUnSeenRequestCount,
};
