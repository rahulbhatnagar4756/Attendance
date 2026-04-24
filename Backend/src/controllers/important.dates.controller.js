const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { importantDatesService } = require('../services');

const addDates = catchAsync(async (req, res) => {
  await importantDatesService.addDates(req.body);
  res.status(httpStatus.OK).send({ message: 'added successfully' });
});

const getDates = catchAsync(async (req, res) => {
  const event = await importantDatesService.getDates();
  res.status(httpStatus.OK).send(event);
});

module.exports = {
  addDates,
  getDates,
};
