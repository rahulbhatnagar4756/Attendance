const httpStatus = require('http-status');
const { ImportantDates } = require('../models');
const ApiError = require('../utils/ApiError');

const addDates = async (data) => {
  try {
    const event = await ImportantDates.create(data);
    return event;
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, error);
  }
};

const getDates = async () => {
  try {
    return await ImportantDates.find();
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

module.exports = {
  addDates,
  getDates,
};
