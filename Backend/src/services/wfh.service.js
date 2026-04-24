const httpStatus = require('http-status');
const moment = require('moment');
const { WorkFromHome, AttendenceEntries, ChangeRequests, User, Organisation } = require('../models');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');
const config = require('../config/config');
const { wfhTemplate } = require('../utils/email.template');
const { wfhService } = require('.');


const findUserById = async (id) => {
  try {
    return User.findById(id);
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const applyForWfh = async (file, body, userId) => {
  try {
    const user = await findUserById(userId);
    if (!body || !user) throw new ApiError(httpStatus.NOT_FOUND);
    const wfhDetails = await WorkFromHome({ ...body, user_id: userId });
    await wfhDetails.save();
    const wfhRequest = {
      user_id: userId,
      request_message: `${user.name} has applied for work from home`,
      type: 'WFH Request',
    };
    const notification = await ChangeRequests({ ...wfhRequest });
    await notification.save();
    const wfhApprovalManagerDetails = await findUserById(body.approved_by);
    body.approved_by = `${wfhApprovalManagerDetails.name}(${wfhApprovalManagerDetails.emp_id})`
    const to = config.email.to;
    const subject = 'WFH application';
    const text = wfhTemplate(user, body);
    await emailService.sendEmail(to, subject, text);
    return wfhDetails;
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, error);
  }
};

const getWfhEmployeesCount = async () => {
  try {
    const todayWfhEntries = await AttendenceEntries.find({
      entry_date: {
        $gte: moment().startOf('day').toDate(),
        $lt: moment().endOf('day').toDate(),
      },
      work_from: 'home',
    }).populate({
      path: 'user_id',
      match: { isExEmployee: { $ne: true } },
    });
    return todayWfhEntries;
    console.log({ todayWfhEntries });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message || error);
  }
};

const getWfhRequests = async (userId, page) => {
  try {
    let skip = 0;
    const limit = 10;
    skip = page >= 1 ? (page - 1) * limit : skip;
    const totalItems = await WorkFromHome.find({ user_id: userId }).countDocuments();
    const requests = await WorkFromHome.find({ user_id: userId }).populate({
      path: 'approved_by',
      select: ['name', 'emp_id'],
    }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    return {
      total: totalItems,
      data: requests,
    };
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const approveWfhRequest = async (wfhId, body, parentId) => {
  try {
    if (parentId) {
      return await WorkFromHome.updateOne({ _id: wfhId }, { $set: body });
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_MODIFIED, err);
  }
};

const rejectWfhRequest = async (wfhId, body) => {
  try {
    const res = await WorkFromHome.updateOne({ _id: wfhId }, { $set: body });
    return res;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_MODIFIED, err);
  }
};

const cancelWorkFromHome = async (wfhId) => {
    try {
      const body = {
        status: 'cancelled',
      };
      const res = await WorkFromHome.updateOne({ _id: wfhId }, { $set: body });
      return res;
    } catch (err) {
      throw new ApiError(httpStatus.NOT_MODIFIED, err);
    }
};

const getWfhTeamListEmployees = async (userId) => {
  try {
    let childrensId = [];
    let teamParentId = await Organisation.findOne({ parent: userId });
    if (teamParentId) {
      let parentLevel1 = teamParentId.children;
      childrensId = [...parentLevel1];
      const parentLevel2 = await Organisation.find({ parent: { $in: parentLevel1 } }).select('children');
      for (let child of parentLevel2) {
        childrensId = [...childrensId, ...child.children];
      }
      const childlevel3 = await Organisation.find({ parent: { $in: childrensId } }).select('children');
      for (let child of childlevel3) {
        childrensId = [...childrensId, ...child.children];
      }
      const childlevel4 = await Organisation.find({ parent: { $in: childrensId } }).select('children');
      for (let child of childlevel4) {
        childrensId = [...childrensId, ...child.children];
      }
      const childlevel5 = await Organisation.find({ parent: { $in: childrensId } }).select('children');
      for (let child of childlevel5) {
        childrensId = [...childrensId, ...child.children];
      }

      const teamEmployeesIds = [];
      for (let empId of childrensId) {
        if (!teamEmployeesIds.find((e) => e === empId)) {
          teamEmployeesIds.push(empId);
        }
      }

      const wfhEmployees = await WorkFromHome.find({
        status: 'pending',
        user_id: { $in: teamEmployeesIds },
      }).populate({
        path: 'user_id',
        select: 'name',
      }).sort({ createdAt: -1 });
      return {
        wfhEmployees,
      };
    }
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};


module.exports = {
  applyForWfh,
  getWfhEmployeesCount,
  getWfhRequests,
  approveWfhRequest,
  rejectWfhRequest,
  cancelWorkFromHome,
  getWfhTeamListEmployees
};
