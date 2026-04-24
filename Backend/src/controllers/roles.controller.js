const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {rolesService}=require('../services')

const getAdminRoles = catchAsync(async (req, res) => {
 const roles=await rolesService.getAdminRoles()
 res.status(httpStatus.OK).send(roles)
});

const getUserRoles = catchAsync(async (req, res) => {
  const roles=await rolesService.getUserRoles()
  res.status(httpStatus.OK).send(roles)
 });

module.exports = {
  getAdminRoles,
  getUserRoles,
};
