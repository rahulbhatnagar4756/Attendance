const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { Roles } = require('../models');

const getAdminRoles = async () => {
  try {
    return await Roles.find({role:{$ne:"Employee"}});
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getUserRoles = async () => {
  try {
    return await Roles.find({role:{$ne:"Super Admin"}});
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getUsersRoles = async () => {
  try {
    return await Roles.find();
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getUserRoleById = async (roleId) => {
  try {
    return await Roles.findById({_id:roleId});
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};



module.exports = {
  getAdminRoles,
  getUserRoles,
  getUsersRoles,
  getUserRoleById
};
