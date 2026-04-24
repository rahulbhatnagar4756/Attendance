const httpStatus = require('http-status');
const { User, Subject } = require('../models');
const { ChangeRequests } = require('../models');
const { Organisation } = require('../models');
const UserLevel = require('../models/user.level.model');
const SalarySlip = require('../models/salary.slip.model');
const EmployeeVerification = require('../models/employee.verification.model');
const moment = require('moment');
const { AttendenceEntries, Token, Leaves, UserLevels, DailyStatuses } = require('../models');
const ApiError = require('../utils/ApiError');
const { addEmployeeTemplate } = require('../utils/email.template');
const rolesService = require('./roles.service');
const attendenceService = require('./attendence.service');
const leavesService = require('./leaves.service');
const { ImportantDates } = require('../models');
const { s3Upload, s3DocumentVerificationImageUpload } = require('../utils/AWS');
// const AWS = require('aws-sdk');
// const fs = require('fs');
// const path = require('path');
// const { ACCESS_KEY_ID,SECRET_ACCESS_KEY, REGION, BUCKET_NAME} = process.env
/**
 * Get user by username
 * @param {string} username
 * @returns {Promise<User>}
 */
const getUserByUsername = async (username) => {
  return User.findOne({ emp_id: username }).populate('role');
};

const getUserByEmail = async (email) => {
  return User.findOne({ email: email });
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */


// before salary slip functionality only you can add not edit at the time of addEmployee

// const createUser = async (userBody) => {
//   try {
//     const findEmail = await User.findOne({ email: userBody.email });
//     if (findEmail) {
//       throw new ApiError(httpStatus.OK, 'Email already exist!');
//     }
//     const findEmpId = await User.findOne({ emp_id: userBody.emp_id });
//     if (findEmpId) {
//       throw new ApiError(httpStatus.OK, 'Employee ID already exist!');
//     }
//     // userBody['pending_leaves'] = userBody.allotted_leaves;
//     // userBody['pending_leaves'] = 1;
//     const getDate =  moment(userBody.doj).date();
//     if(getDate > 15){
//       userBody['pending_leaves'] = 0;
//     }else{
//       userBody['pending_leaves'] = 1;
//     }
//     const user = await User.create(userBody);
//     const userData = await User.findOne({ emp_id: userBody.emp_id });
//     const userId = userData._id;
//     if(userBody.salarySlipValues && Object.values(userBody.salarySlipValues).some(value => value !== '')){
//       userBody.salarySlipValues['userId'] = userId;
//       await SalarySlip.create(userBody.salarySlipValues);
//     }
//     await UserLevels.create({ level: userBody.level, user_id: userId });
//     const to = userBody.email;
//     const subject = 'Regsiter email';
//     const text = addEmployeeTemplate(userBody.name, userBody.emp_id, userBody.password);

//     // await emailService.sendEmail(to, subject, text);
//     return user;
//   } catch (error) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
//   }
// };

//After salary slip functionality add and edit both 

const createUser = async (userBody) => {
  console.log({userBody});
  try {
    const getDate =  moment(userBody.doj).date();
    if(getDate > 15){
      userBody['pending_leaves'] = 0; 
    }else{
      userBody['pending_leaves'] = 1;
    }
    if(userBody.userId) {
      const {userId, ...restOfUserData} = userBody;
      const user = await getUserById(userId);
      Object.assign(user, restOfUserData);
      await user.save();
      // const user = await User.findOneAndUpdate({_id:userBody.userId}, restOfUserData);
      const userData = await User.findOne({ emp_id: userBody.emp_id });
      await UserLevels.findOneAndUpdate({ user_id: userData._id }, {level: userBody.level});
      return userData;
    }
    const findEmail = await User.findOne({ email: userBody.email });
    if (findEmail) {
      throw new ApiError(httpStatus.OK, 'Email already exist!');
    }
    const findEmpId = await User.findOne({ emp_id: userBody.emp_id });
    if (findEmpId) {
      throw new ApiError(httpStatus.OK, 'Employee ID already exist!');
    }
    // userBody['pending_leaves'] = userBody.allotted_leaves;
    // userBody['pending_leaves'] = 1;

    // const getDate =  moment(userBody.doj).date();
    // if(getDate > 15){
    //   userBody['pending_leaves'] = 0; 
    // }else{
    //   userBody['pending_leaves'] = 1;
    // }

      const user = await User.create(userBody);
      const userData = await User.findOne({ emp_id: userBody.emp_id });
      const userId = userData._id;
      await UserLevels.create({ level: userBody.level, user_id: userId });
      const to = userBody.email;
      const subject = 'Regsiter email';
      const text = addEmployeeTemplate(userBody.name, userBody.emp_id, userBody.password);
  
      // await emailService.sendEmail(to, subject, text);
      return user;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const addEmployeePersonalDetails = async (bodyData) => {
  const data = { bodyData };
  const { userId, ...restOfUserData } = data.bodyData;
  const user = await getUserById(userId);
  try{
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }else{
      return await User.findByIdAndUpdate({_id:userId}, restOfUserData);
    }
  }catch(error){
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};


const addEmployeeSalary = async (salaryData) => {
  try {
      if (!salaryData) throw new ApiError(httpStatus.NOT_FOUND);
      const isAlreadyExist = await SalarySlip.findOne({userId:salaryData.userId});
      if(isAlreadyExist) {
        return await SalarySlip.findOneAndUpdate({userId:salaryData.userId}, salaryData);
      }
      else {
        if(salaryData && Object.values(salaryData).some(value => value !== '')){
          return await SalarySlip.create(salaryData);
        }
      }
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};


const addEmployeeVerification = async (body, file) => {
  try {
      if (!body) throw new ApiError(httpStatus.NOT_FOUND);
      let getImagePath;
      if (!file) {
        body;
      } else {
        const Path = {
          file: file.document_image,
        };
        const response = await s3DocumentVerificationImageUpload(Path);
        if (response) {
          getImagePath = response.Location;
        }
        body['document_image'] = getImagePath;
      }
      const isAlreadyExist = await EmployeeVerification.findOne({userId:body.userId});
      if(isAlreadyExist){
        return await EmployeeVerification.findOneAndUpdate({userId:body.userId}, body);
      }else{
        return await EmployeeVerification.create(body);
      } 
  } catch (error) {
    console.log({error});
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

//get all except admin
const getAllEmployees = async (request) => {
  try {
    let skip = 0;
    const limit = 10;
    skip = request.page >= 1 ? (request.page - 1) * limit : skip;
    const roles = await rolesService.getUsersRoles();
    const role = roles.filter((r) => r.role === 'Super Admin');
    const totalItems = await User.find({
      role: { $ne: role[0]._id },
      isExEmployee: { $ne: true },
    }).countDocuments();
    let requests = [];
    let searchByInitial = request.alphaTerm ? request.alphaTerm.toLowerCase() : '';
    let searchByText = request.searchText ? request.searchText.toLowerCase() : '';

    if (request.alphaTerm || request.searchText) {
      requests = await User.find({
        role: { $ne: role[0]._id },
        isExEmployee: { $ne: true },
        $and: [{ name: { $regex: '^' + searchByInitial, $options: 'i' } }],
        $or: [{ name: { $regex: searchByText, $options: 'i' } }, { emp_id: { $regex: searchByText, $options: 'i' } }],
      })
        .skip(skip)
        .limit(limit)
        .populate('role');
    } else {
      requests = await User.find({
        role: { $ne: role[0]._id },
        isExEmployee: { $ne: true },
      })
        .skip(skip)
        .limit(limit)
        .populate('role');
    }

    return {
      total: totalItems,
      data: requests,
      // userData: datas,
    };
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getAllEmployeesForTeamList = async (request, userId) => {
  try {
    let skip = 0;
    const limit = 15;
    skip = request.page >= 1 ? (request.page - 1) * limit : skip;
    const roles = await rolesService.getUsersRoles();
    const role = roles.filter((r) => r.role === 'Super Admin');

    if (!userId) throw new ApiError(httpStatus.UNAUTHORIZED);
    let childrensId = [];
    let teamParentId = await Organisation.findOne({ parent: userId });
    let parentLevel1 = teamParentId.children;
    childrensId = [...parentLevel1];

    if (parentLevel1) {
      const parentLevel2 = await Organisation.find({ parent: { $in: parentLevel1 } }).select('children');
      for (let child of parentLevel2) {
        childrensId = [...childrensId, ...child.children];
      }
      if (childrensId) {
        const childlevel3 = await Organisation.find({ parent: { $in: childrensId } }).select('children');
        for (let child of childlevel3) {
          childrensId = [...childrensId, ...child.children];
        }
      }
      if (childrensId) {
        const childlevel4 = await Organisation.find({ parent: { $in: childrensId } }).select('children');
        for (let child of childlevel4) {
          childrensId = [...childrensId, ...child.children];
        }
      }
      if (childrensId) {
        const childlevel5 = await Organisation.find({ parent: { $in: childrensId } }).select('children');
        for (let child of childlevel5) {
          childrensId = [...childrensId, ...child.children];
        }
      }
    }
    if (!childrensId) throw new ApiError(httpStatus.UNAUTHORIZED);

    const totalItems = await User.find({
      role: { $ne: role[0]._id },
      isExEmployee: { $ne: true },
      _id: { $in: childrensId },
    }).countDocuments();
    let requests = [];
    let searchByInitial = request.alphaTerm ? request.alphaTerm.toLowerCase() : '';
    let searchByText = request.searchText ? request.searchText.toLowerCase() : '';
    if (request.alphaTerm || request.searchText) {
      requests = await User.find({
        role: { $ne: role[0]._id },
        isExEmployee: { $ne: true },
        _id: { $in: childrensId },
        $and: [{ name: { $regex: '^' + searchByInitial, $options: 'i' } }],
        $or: [{ name: { $regex: searchByText, $options: 'i' } }, { emp_id: { $regex: searchByText, $options: 'i' } }],
      })
        .skip(skip)
        .limit(limit)
        .populate('role');
    } else {
      requests = await User.find({
        role: { $ne: role[0]._id },
        isExEmployee: { $ne: true },
        _id: { $in: childrensId },
      })
        .skip(skip)
        .limit(limit)
        .populate('role');
    }
    return {
      total: totalItems,
      data: requests,
      // userData: datas,
    };
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const findAllUsers = async () => {
  try {
    const roles = await rolesService.getUsersRoles();
    const role = roles.find((r) => r.role === 'Employee');
    const user = await User.find({
      role: role._id,
      isExEmployee: { $ne: true },
    });
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const findAllUserIds = async () => {
  try {
    const roles = await rolesService.getUsersRoles();
    const role = roles.find((r) => r.role === 'Employee');
    const user = await User.find({
      role: role._id,
      isExEmployee: { $ne: true },
    }).select(['_id']);
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

//get only whose role is employee
const getUnCheckedEmployees = async () => {
  try {
    const roles = await rolesService.getUsersRoles();
    const role = roles.find((r) => r.role === 'Employee');
    const total = await User.find({
      role: role._id,
      isExEmployee: { $ne: true },
    }).populate('role');
    const presentUsers = await attendenceService.presentUserCount();
    const onLeaveUsers = await leavesService.todayLeavesCount();
    //  const filter_present_users= presentUsers.filter((user) => user.user_id)
    let unchecked = [];
    for (let emp of total) {
      if (!presentUsers.find((usr) => emp.id == usr.user_id._id) && !onLeaveUsers.find((usr) => emp.id == usr.user_id._id)) {
        unchecked.push(emp);
      }
    }
    return unchecked;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

// Get total employee
const getUsersCount = async () => {
  try {
    const roles = await rolesService.getUsersRoles();
    const role = roles.filter((r) => r.role === 'Super Admin');

    return await User.countDocuments({
      role: { $ne: role[0]._id },
      isExEmployee: { $ne: true },
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */

const getUserById = async (id) => {
  try {
    return User.findById(id).populate('role');
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getUserWithLevelById = async (id) => {
  try {
    const userLevel = await UserLevels.findOne({user_id:id}).populate({
      path:'level',
      select: 'level'
    });
    const user = await User.findById(id);
    return {user, userLevel};
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

// old way implementation getting 6 latest salaries with sorting record 
// const getSalaryByUserId = async (userId) => {
//   try {
//     const salaries = await SalarySlip.find({userId}).sort({ createdAt: -1 }).limit(6);
//     // Sort the records based on the latest year and corresponding latest month
//     const sortedSalaries = salaries.sort((a, b) => {
//       const yearComparison = b.year.localeCompare(a.year);
      
//       if (yearComparison !== 0) {
//         return yearComparison;
//       } else {
//         // If the years are the same, compare months
//         const monthOrder = [
//           'January', 'February', 'March', 'April', 'May', 'June',
//           'July', 'August', 'September', 'October', 'November', 'December'
//         ];
        
//         return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
//       }
//     });
//     return sortedSalaries;
//   } catch (error) {
//     throw new ApiError(httpStatus.NOT_FOUND, error);
//   }
// };

// New way fetching only one salary record that is required to bind intially most latest and then based on filter
const getSalaryByUserId = async (userId, year, month) => {
  try {
    const salaries = await SalarySlip.findOne({userId, year, month});
    return salaries;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getVerificationDetailsByUserId = async (userId) => {
  try {
    const getVerificationData = await EmployeeVerification.findOne({userId});
    return getVerificationData;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getLevelById = async (userId) => {
  try {
    const organisationData = await Organisation.findOne({ parent: userId });
    const userLevel = await UserLevels.findOne({ user_id: userId }).populate({
      path: 'level',
      select: 'level',
    });
    return {
      organisationData,
      userLevel,
    };
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */

const updateUserById = async (userId, bodyData, file) => {
  const { role, ...restBody } = bodyData;
  const updateBody = bodyData.editType ? bodyData : { ...restBody };
  let getImagePath;
  if (!file) {
    updateBody;
  } else {
    const profileImage = {
      file: file.profile_image,
    };
    const response = await s3Upload(profileImage);
    if (response) {
      getImagePath = response.Location;
    }
    updateBody['profile_image'] = getImagePath;
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const findEmpId = await User.findOne({
    _id: userId,
    emp_id: updateBody.emp_id,
  });
  const findEmp = await User.findOne({ emp_id: updateBody.emp_id });
  if (findEmpId) {
    Object.assign(user, updateBody);
  } else if (findEmp) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Employee ID already exist!');
  } else {
    Object.assign(user, updateBody);
  }
  await user.save();
  if(updateBody.editType === 'editEmployeeDetailsFromAdmin'){
    await UserLevels.findOneAndUpdate({ user_id: userId }, {level: updateBody.level});
  }
  return user;
};

const updateUserSalary = async (userId, salaryData) => {
  try {
    if (!salaryData) throw new ApiError(httpStatus.NOT_FOUND);
    const salaryDetails  = await SalarySlip.findOne({userId, month : salaryData.month, year : salaryData.year});
    if(!salaryDetails){
      const { _id, createdAt, updatedAt, __v, ...restOfSalaryData } = salaryData;
      if(restOfSalaryData && Object.values(restOfSalaryData).some(value => value !== '')){
        return await SalarySlip.create(restOfSalaryData);
      }
    }else{
      return await SalarySlip.findOneAndUpdate({userId, month : salaryData.month, year : salaryData.year}, salaryData);
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const updateUserVerificationDetails = async (userId, body, file) => {
  try {
    if (!body){
      throw new ApiError(httpStatus.NOT_FOUND);
    }else{
      let getImagePath;
      if (!file) {
        body;
      } else {
        const Path = {
          file: file.document_image,
        };
        const response = await s3DocumentVerificationImageUpload(Path);
        if (response) {
          getImagePath = response.Location;
        }
        body['document_image'] = getImagePath;
      }
      const verificationDetails  = await EmployeeVerification.findOne({userId});
      if(!verificationDetails){
        return await EmployeeVerification.create(body);
      }else{
        return await EmployeeVerification.findOneAndUpdate({userId}, body);
      }
    } 
  } catch (error) {
    console.log({error});
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Change password
 * @param {string} oldPassword
 * @param {string } newPassword
 */

const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (!user || !(await user.isPasswordMatch(oldPassword))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect old password');
    }
    user.password = newPassword;
    await user.save();
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, error);
  }
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {string} password
 * @returns {Promise<User>}
 */
const matchPassword = async (userId, password) => {
  try {
    const user = await getUserById(userId);
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect  password');
    }
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, error);
  }
};

/**
 * Update user by id
 * @param {array} data
 * @returns {Promise<User>}
 */
const deleteUser = async (data) => {
  try {
    if (!data.userId) throw new ApiError(httpStatus.NOT_FOUND, 'User ID not found');
    const userData = await User.findById({ _id: data.userId });
    const userParentId = await Organisation.find({ children: { $in: data.userId } }).select('parent');
    if (userParentId.length) {
      let userParentData = userParentId.map((item) => item.parent);
      if (!userData.isExEmployee) {
        const isParent = await Organisation.findOne({ parent: data.userId }).select('children');
        if (isParent && isParent.children.length) {
          let childArray = isParent.children;
          await Organisation.updateMany(
            { parent: { $in: userParentData } },
            { $addToSet: { children: { $each: childArray } } }
          );
        }
        await Organisation.updateMany({ parent: { $in: userParentData } }, { $pull: { children: { $in: data.userId } } });
        await Organisation.deleteMany({ parent: data.userId });
      }
    }
    const userLevel = UserLevels.find({ user_id: data.userId });
    if (userLevel) {
      await UserLevels.deleteOne({ user_id: data.userId });
    }

    await User.deleteMany({ _id: { $in: data.userId } });
    await AttendenceEntries.deleteMany({ user_id: data.userId });
    await Token.deleteMany({ user: data.userId });
    await ChangeRequests.deleteMany({ user_id: data.userId });
    await Leaves.deleteMany({ user_id: data.userId });
    const userSubjectId = await Subject.find({ createdBy: data.userId });
    const subjectId = userSubjectId.map((d) => d._id);
    await DailyStatuses.deleteMany({ subject_id: { $in: subjectId } });
    await Subject.deleteMany({ createdBy: data.userId });
    await DailyStatuses.deleteMany({ user_id: data.userId });
    await DailyStatuses.updateMany({ recipients: { $in: data.userId } }, { $pull: { recipients: { $in: data.userId } } });
    // await attendenceService.checkOut(data.userId);
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

/**
 * Update user by id
 * @param {array} data
 * @returns {Promise<User>}
 */

const deactivateEmployee = async (data) => {
  try {
    const user = await getUserById(data.userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (user.isExEmployee) {
      await User.findOneAndUpdate({ _id: data.userId }, { $set: data });
      return user;
    }
    data.isExEmployee = true;
    Object.assign(user, data);
    const parent = await Organisation.findOne({ children: { $in: data.userId } }).select('parent');
    if(!parent){
      throw new ApiError(httpStatus.NOT_FOUND, 'parent not found, please contact to Admin');
    }else{
      const parentId = parent.parent;
      const children = await Organisation.find({ parent: data.userId }).select('children');
      let childrensId;
      for (let child of children) {
        childrensId = child.children;
      }
  
      if (!children) {
        await Organisation.deleteMany({ parent: data.userId });
      } else {
        await Organisation.updateOne({ parent: parentId }, { $push: { children: childrensId } });
        await Organisation.deleteMany({ parent: data.userId });
        await Organisation.updateMany({ parent: parentId }, { $pull: { children: { $in: data.userId } } });
      }
      await UserLevels.deleteOne({ user_id: data.userId });
      await user.save();
      return user;
    }
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getDeactivatedEmployees = async (request) => {
  try {
    let skip = 0;
    const limit = 10;
    skip = request.page >= 1 ? (request.page - 1) * limit : skip;
    const roles = await rolesService.getUsersRoles();
    const role = roles.filter((r) => r.role === 'Super Admin');
    const totalItems = await User.find({
      role: { $ne: role[0]._id },
      isExEmployee: true,
    }).countDocuments();
    let requests = [];
    let searchByInitial = request.alphaTerm ? request.alphaTerm.toLowerCase() : '';
    let searchByText = request.searchText ? request.searchText.toLowerCase() : '';
    if (request.alphaTerm || request.searchText) {
      requests = await User.find({
        role: { $ne: role[0]._id },
        isExEmployee: true,
        $and: [{ name: { $regex: '^' + searchByInitial, $options: 'i' } }],
        $or: [{ name: { $regex: searchByText, $options: 'i' } }, { emp_id: { $regex: searchByText, $options: 'i' } }],
      })
        .skip(skip)
        .limit(limit)
        .populate('role')
        .sort({releving_date:-1})
    } else {
      requests = await User.find({
        role: { $ne: role[0]._id },
        isExEmployee: true,
      })
        .skip(skip)
        .limit(limit)
        .populate('role')
        .sort({releving_date:-1});
    }
    return {
      total: totalItems,
      data: requests,
    };
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getAllBday = async () => {
  try {
    return await User.find({ isExEmployee: false });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_MODIFIED, err);
  }
};

const getTodaysStatus = async (userId) => {
  try {
    const statusDetail = await DailyStatuses.find({
      user_id: userId,
      createdAt: { $gte: moment().startOf('day') },
    }).select('subject_id');

    const SubjectId = statusDetail.map((d) => d.subject_id);

    const SubjectDetail = await Subject.find({
      createdBy: userId,
      _id: { $in: SubjectId },
      createdAt: { $gte: moment().startOf('day') },
    });

    const Level = await UserLevel.findOne({ user_id: userId }).populate({
      path: 'level',
      select: 'level',
    });
    const userLevel = Level.level.level;

    if (SubjectDetail.length > 0 || userLevel === '1' || userLevel === '2') {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const leaveReport = async (from, to) => {
  try {
    const roles = await rolesService.getUsersRoles();
    const role = roles.find((r) => r.role === 'Employee');
    const totalUsers = await User.find({
      $and: [
        { role: role._id },
        { doj: { $lte: moment(to).endOf('month').format('YYYY-MM-DD') } },
        {
          $or: [
            { isExEmployee: { $ne: true } },
            { releving_date: { $gte: moment(to).endOf('month').format('YYYY-MM-DD') } },
          ],
        },
      ],
    }).populate('role');

    console.log({ from, to });
    const leaves = await Leaves.find({
      $or: [
        {
          from: {
            $gte: moment(from),
            $lte: moment(to),
          },
        },
        {
          to: {
            $gte: moment(from),
            $lte: moment(to),
          },
        },
      ],
      status: ['absent', 'approved'],
    }).populate({ path: 'user_id', select: ['emp_id', 'name'] });

    const closestLeaves = await Leaves.find({
      from: {
        $gte: moment().subtract(20, 'days'),
      },
      to: { $lt: moment().add(20, 'days') },
      status: ['approved', 'absent'],
    });

    const approvedTodaysLeaves = [];
    for (let check of closestLeaves) {
      const isSameOrAfter = moment(moment().format('MM/DD/YYYY')).isSameOrAfter(
        moment(check.from).format('MM/DD/YYYY'),
        'day'
      );
      const isSameOrBefore = moment(moment().format('MM/DD/YYYY')).isSameOrBefore(
        moment(check.to).format('MM/DD/YYYY'),
        'day'
      );
      if (isSameOrAfter && isSameOrBefore) {
        approvedTodaysLeaves.push(check);
      }
    }

    console.log({ approvedTodaysLeaves });

    const entryDate = await AttendenceEntries.find({
      entry_date: {
        $gte: moment().startOf('day'),
        $lt: moment().endOf('day'),
      },
    });

    let getPublicHolidaysDate = [];
    const importantDates = await ImportantDates.find({}).select({ date: 1, _id: 0 });
    importantDates.map((dates) => {
      let date = moment(dates.date).format('YYYY-MM-DD');
      getPublicHolidaysDate.push(date);
    });

    return {
      totalUsers,
      leaves,
      entryDate,
      getPublicHolidaysDate,
      approvedTodaysLeaves,
    };
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getSalarySlipByUserId = async (userId, selectedDate) => {
  const getMonthAndYear = selectedDate.split(',');
  try {
    const salaryDetails = await SalarySlip.findOne({userId:userId, month:getMonthAndYear[0], year:getMonthAndYear[1]}).populate({
      path: "userId",
    });
    return salaryDetails;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getAllSalarySlipOfAUser = async (userId) => {
  try {
    const allSalariesOfAUser = await SalarySlip.find({userId:userId.userId}).populate({
      path: "userId",
    });
    // Sort the records based on the latest year and corresponding latest month
    const sortedSalaries = allSalariesOfAUser.sort((a, b) => {
      const yearComparison = b.year.localeCompare(a.year);
      
      if (yearComparison !== 0) {
        return yearComparison;
      } else {
        // If the years are the same, compare months
        const monthOrder = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
      }
    });  
    return sortedSalaries;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};



module.exports = {
  createUser,
  getUnCheckedEmployees,
  getAllEmployees,
  queryUsers,
  getUserById,
  getUserByEmail,
  getDeactivatedEmployees,
  getUserByUsername,
  updateUserById,
  changePassword,
  matchPassword,
  deactivateEmployee,
  deleteUser,
  getUsersCount,
  getLevelById,
  getAllBday,
  leaveReport,
  findAllUsers,
  findAllUserIds,
  getAllEmployeesForTeamList,
  getTodaysStatus,
  getSalarySlipByUserId,
  addEmployeeSalary,
  addEmployeeVerification,
  addEmployeePersonalDetails,
  getSalaryByUserId,
  getVerificationDetailsByUserId,
  updateUserVerificationDetails,
  updateUserSalary,
  getAllSalarySlipOfAUser,
  getUserWithLevelById
};
