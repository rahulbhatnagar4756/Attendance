const httpStatus = require('http-status');
const { Thought } = require('../models');
const moment = require('moment');
const { AttendenceEntries, Token } = require('../models');
const ApiError = require('../utils/ApiError');
const rolesService = require('./roles.service');

const addThought = async (body) => {
  try {
    if (body.flag === 1) {
      await Thought.updateOne({ date: moment().format('YYYY-MM-DD'), is_display: true }, { $set: { is_display: false } });
    }
    const add = await Thought({ ...body });
    await add.save();
    return add;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_MODIFIED, err);
  }
};

const listThought = async (page) => {
  try {
    let skip = 0;
    const limit = 10;
    skip = page >= 1 ? (page - 1) * limit : skip;
    const totalItems = await Thought.countDocuments();
    const data = await Thought.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const result = {
      totalItems,
      data,
    };
    return result;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_MODIFIED, err);
  }
};

const getTodayThought = async () => {
  var moment = require('moment');
  try {
    return await Thought.find({ date: moment().format('YYYY-MM-DD'), is_display: true });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_MODIFIED, err);
  }
};

const deleteThought = async (data) => {
  try {
    return await Thought.deleteMany({ _id: data.id });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_MODIFIED, err);
  }
};

const getEditThought = async (id) => {
  try {
    return await Thought.find({ _id: id });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const postEditThought = async (id, body) => {
  try {
    if (body.flag === 1) {
      await Thought.updateOne({ date: moment().format('YYYY-MM-DD'), is_display: true }, { $set: { is_display: false } });
    }
    const thought = await Thought.updateOne({ _id: id }, { $set: body });
    return thought;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

module.exports = {
  addThought,
  listThought,
  deleteThought,
  getEditThought,
  postEditThought,
  getTodayThought,
};
