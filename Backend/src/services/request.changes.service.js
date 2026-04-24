const { request } = require("express");
const httpStatus = require("http-status");
const { ChangeRequests } = require("../models");
const ApiError = require("../utils/ApiError");

const postRequestChanges = async (body) => {
  try {
    const request = await ChangeRequests.create(body);
    await request.save();
    return request;
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, err);
  }
};

const postRequestChange = async (body) => {
  try {
    const request = await ChangeRequests.create(body);
    await request.save();
    return request;
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, err);
  }
};

const getRequestChanges = async (page) => {
  try {
    let skip = 0;
    const limit = 10;
    skip = page >= 1 ? (page - 1) * limit : skip;
    // return await ChangeRequests.find().sort({"createdAt": -1}).populate('user_id');
    const totalItems = await ChangeRequests.find({
      status: false,
    }).countDocuments();
    const requests = await ChangeRequests.find({ status: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user_id");
    const data = {
      total: totalItems,
      data: requests,
    };
    return data;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getUnSeenRequestCount = async () => {
  try {
    return await ChangeRequests.find({ isSeen: false }).sort({ createdAt: -1 }).populate("user_id");
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const deleteRequestChanges = async (data) => {
  try {
    const request = await ChangeRequests.findById(data.id);
    if (!request) {
      throw new ApiError(httpStatus.NOT_FOUND, "Request not found");
    }
    data.status = true;
    Object.assign(request, data);
    await request.save();
    return request;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};
const updateSeenNotifications = async () => {
  try {
    return await ChangeRequests.updateMany({ $set: { isSeen: true } });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

module.exports = {
  postRequestChanges,
  postRequestChange,
  getRequestChanges,
  deleteRequestChanges,
  updateSeenNotifications,
  getUnSeenRequestCount,
};
