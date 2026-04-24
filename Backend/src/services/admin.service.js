const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Organisation, UserLevels, Levels, User } = require('../models');
const userService = require('./user.service');
const leavesService = require('./leaves.service');
const attendenceService = require('./attendence.service');
const rolesService = require('./roles.service');
const wfhService = require('./wfh.service');

const getCount = async () => {
  try {
    const totalUsers = await userService.getUsersCount();
    const presentUsers = await attendenceService.presentUserCount();
    const onLeaveEmployees = await leavesService.todayLeavesCount();
    const uncheckedEmployees = await userService.getUnCheckedEmployees();
    const wfhEmployees = await wfhService.getWfhEmployeesCount();

    return {
      total: totalUsers,
      present: presentUsers.length,
      onLeave: onLeaveEmployees.length,
      unChecked: uncheckedEmployees.length,
      workFromHome: wfhEmployees.length,
    };
  } catch (err) {
    throw new ApiError(httpStatus.INTNERAL_SERVER_ERROR, err);
  }
};

const getUsers = async () => {
  try {
    return await UserLevels.find()
      .populate({ path: 'user_id', select: ['name'] })
      .populate({
        path: 'level',
        select: ['level'],
      });
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const organizeUsersHierarchy = async (data) => {
  try {
    const { parent, children } = data;
    let childArray = [];
    if (children) {
      childArray = children.map((child) => child.value);
    }
    const userLevel = await UserLevels.findOne({ user_id: parent.value }).populate({
      path: 'level',
      select: ['level'],
    });

    const entry = await Organisation.findOne({ parent: parent.value });
    if (parseInt(userLevel.level.level) <= 1 && !entry) {
      const admin = await User.findOne({ name: 'Super Admin' }).select(['name']);
      const entry = await Organisation.findOne({ parent: admin.id });
      const child_array = [...entry.children, parent.value];
      await Organisation.updateOne({ parent: admin.id }, { $set: { children: child_array } });
      await Organisation.create({
        parent: parent.value,
        children: childArray,
      });
    } else {
      if (entry) {
        // for (let child of childArray) {
        //   if (entry.children.includes(child)) {
        //     throw new ApiError(httpStatus.FOUND, 'Entries already exist!');
        //   }
        // }
        // const child_array = [...entry.children, childArray];

        await Organisation.updateOne({ parent: parent.value }, { $set: { children: childArray } });
      } else {
        await Organisation.create({
          parent: parent.value,
          children: childArray,
        });
      }
    }
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getOrganisationData = async () => {
  try {
    const org_data = await Organisation.find()
      .populate({
        path: 'children',
        select: ['name', 'profile_image', 'designation'],
      })
      .populate({
        path: 'parent',
        select: ['name', 'profile_image', 'designation'],
      });
    const userLevels = await UserLevels.find().populate({
      path: 'level',
      select: ['level'],
    });
    return {
      org_data,
      userLevels,
    };
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};
const addLevel = async (body) => {
  try {
    return await Levels.create(body);
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getLevels = async () => {
  try {
    const levelsData = await Levels.find();
    const levels = levelsData.filter((item) => item.level !== '0');
    return levels;
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const addUserLevel = async (body) => {
  const { user, level } = body;
  try {
    const userInfo = await UserLevels.findOne({ user_id: user.value })
    if (userInfo)
      return await UserLevels.updateOne({ user_id: user.value }, { $set: { level: level.value } });
    else
      return await UserLevels.create({ user_id: user.value, level: level.value });
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getAllEmployees = async (request) => {
  try {
    const roles = await rolesService.getUsersRoles();
    const role = roles.filter((r) => r.role === 'Super Admin');
    return await User.find({
      role: { $ne: role[0]._id },
      isExEmployee: { $ne: true },
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

module.exports = {
  getCount,
  getUsers,
  organizeUsersHierarchy,
  getOrganisationData,
  addLevel,
  getLevels,
  addUserLevel,
  getAllEmployees,
};
