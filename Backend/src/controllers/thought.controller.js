const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { thoughtService } = require('../services');
const { getUserIdToken } = require('../middlewares/auth');

const addThought = catchAsync(async (req, res) => {
  const addThought = await thoughtService.addThought(req.body);
  res.status(httpStatus.OK).send({ addThought });
});

const listThought = catchAsync(async (req, res) => {
  const listThought = await thoughtService.listThought(req.query.page);
  res.status(httpStatus.OK).send({ listThought });
});

const getTodayThought = catchAsync(async (req, res) => {
  const listThought = await thoughtService.getTodayThought();
  res.status(httpStatus.OK).send({ listThought });
});

const deleteThought = catchAsync(async (req, res) => {
  const deleteThought = await thoughtService.deleteThought(req.body);
  res.status(httpStatus.OK).send({ deleteThought });
});

const getEditThought = catchAsync(async (req, res) => {
  const leaves = await thoughtService.getEditThought(req.params.id);
  res.status(httpStatus.OK).send(leaves);
});

const postEditThought = catchAsync(async (req, res) => {
  const leaves = await thoughtService.postEditThought(req.params.id, req.body);
  res.status(httpStatus.OK).send(leaves);
});

module.exports = {
  addThought,
  listThought,
  deleteThought,
  getEditThought,
  postEditThought,
  getTodayThought,
};
