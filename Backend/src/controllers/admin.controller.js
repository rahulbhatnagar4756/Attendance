const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { adminService, userService } = require('../services');

const getCount = catchAsync(async (req, res) => {
  const result = await adminService.getCount();
  res.status(httpStatus.OK).send({ result });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await adminService.getUsers();
  res.status(httpStatus.OK).send({ result });
});

const organizeUsersHierarchy = catchAsync(async (req, res) => {
  const result = await adminService.organizeUsersHierarchy(req.body);
  res.status(httpStatus.OK).send({ result });
});

const getOrganisationData = catchAsync(async (req, res) => {
  const result = await adminService.getOrganisationData();
  res.status(httpStatus.OK).send({ result });
});

const getLevels = catchAsync(async (req, res) => {
  const result = await adminService.getLevels();
  res.status(httpStatus.OK).send({ result });
});

const addLevel = catchAsync(async (req, res) => {
  const result = await adminService.addLevel(req.body);
  res.status(httpStatus.OK).send({ result });
});

const addUserLevel = catchAsync(async (req, res) => {
  const result = await adminService.addUserLevel(req.body);
  res.status(httpStatus.OK).send({ result });
});

const getAllEmployees = catchAsync(async (req, res) => {
  const result = await adminService.getAllEmployees();
  res.status(httpStatus.OK).send({ result });
});
module.exports = {
  getCount,
  getAllUsers,
  organizeUsersHierarchy,
  getOrganisationData,
  addLevel,
  getLevels,
  addUserLevel,
  getAllEmployees
};
