const httpStatus = require('http-status');
const moment = require('moment');
const { Leaves, WorkFromHome, ChangeRequests, User, AttendenceEntries, Organisation, DailyStatuses } = require('../models');
const ApiError = require('../utils/ApiError');
// const userService = require("./user.service");
const emailService = require('./email.service');
const attendenceService = require('./attendence.service');
const config = require('../config/config');
const { leaveTemplate } = require('../utils/leaveEmail.template');
const { checkAccess } = require('../common/checkAccess');
const { s3SickLeaveAttachmentUpload } = require('../utils/AWS');
// import checkAccess from '../common/checkAccess';

const findUserById = async (id) => {
  try {
    return User.findById(id);
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const applyForLeave = async (file, body, userId) => {
  try {
    const user = await findUserById(userId);
    if (!body || !user) throw new ApiError(httpStatus.NOT_FOUND);
    let getImagePath;
    if (!file) {
      body;
    } else {
      const Path = {
        file: file.sick_leave_attachment,
      };
      const response = await s3SickLeaveAttachmentUpload(Path);
      if (response) {
        getImagePath = response.Location;
      }
      body['path'] = getImagePath;
    }
    // const user = await findUserById(userId);
    const leave = await Leaves({ ...body, user_id: userId, last_pending_leaves: user.pending_leaves });
    await leave.save();
    const leaveRequest = {
      user_id: userId,
      request_message: `${user.name} has applied for leave`,
      type: 'Leave Request',
    };
    const notification = await ChangeRequests({ ...leaveRequest });
    await notification.save();
    const leaveApprovalManagerDetails = await findUserById(body.approved_by);
    body.approved_by = `${leaveApprovalManagerDetails.name}(${leaveApprovalManagerDetails.emp_id})`
    const to = config.email.to;
    const subject = 'Leave application';
    const text = leaveTemplate(user, body);
    await emailService.sendEmail(to, subject, text);
    return leave;
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, error);
  }
};

// const getUserPendingLeaves = async (userId) => {
//   try {
//     return await Leaves.find({ user_id: userId, status: 'pending' }).sort({ createdAt:-1 });
//   } catch (error) {
//     throw new ApiError(httpStatus.NOT_FOUND, error);
//   }
// };

const getUserPendingLeaves = async (userId) => {
  try {
    const [pendingLeaves, pendingWFH] = await Promise.all([
      Leaves.find({ user_id: userId, status: 'pending' }),
      WorkFromHome.find({ user_id: userId, status: 'pending' })
    ]);

    const mergedData = [...pendingLeaves, ...pendingWFH].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return mergedData;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message || error);
  }
};

// const   getUserLeaves = async (userId, page) => {
//   try {
//     let skip = 0;
//     const limit = 10;
//     skip = page >= 1 ? (page - 1) * limit : skip;
//     const totalItems = await Leaves.find({ user_id: userId }).countDocuments();
//     const requests = await Leaves.find({ user_id: userId }).populate({
//       path: 'approved_by',
//       select: ['name', 'emp_id'],
//     }).sort({ createdAt: -1 }).skip(skip).limit(limit);
//     return {
//       total: totalItems,
//       data: requests,
//     };
//   } catch (error) {
//     throw new ApiError(httpStatus.NOT_FOUND, error);
//   }
// };

const getUserLeaves = async (userId, page = 1, type) => {
  try {
    const limit = 10;
    let skip = 0;
    if(type==="user"){
      skip = page >= 1 ? (page - 1) * limit : skip;
    }else{
      skip = (page - 1) * limit;
    }

    // Fetch leaves and wfh requests
    const [leaves, wfhRequests] = await Promise.all([
      Leaves.find({ user_id: userId })
        .populate({ path: 'approved_by', select: ['name', 'emp_id'] })
        .sort({ createdAt: -1 }),

      WorkFromHome.find({ user_id: userId })
        .populate({ path: 'approved_by', select: ['name', 'emp_id'] })
        .sort({ createdAt: -1 }),
    ]);

    // Combine both arrays
    const combined = [...leaves, ...wfhRequests];

    // Sort combined array by createdAt (latest first)
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate (slice the array to get only the current page records)
    const paginatedData = combined.slice(skip, skip + limit);

    return {
      total: combined.length,
      data: paginatedData,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong');
  }
};

const getLeaveByLeaveId = async (leaveId) => {
  try {
    if (!leaveId) throw new ApiError(httpStatus.NOT_FOUND);
    const leaveData = await Leaves.findOne({ _id: leaveId });
    return leaveData;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getUserApprovedLeaves = async (userId) => {
  try {
    const requests = await Leaves.find({ user_id: userId, status: 'approved' });
    return requests;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getUserDashboardLeaves = async (userId) => {
  try {
    return await Leaves.find({ user_id: userId }).sort({ createdAt: -1 });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getTaggedNotifiedUsers = async (userId) => {
  try {
    // const changeRequests = await ChangeRequests.find({ user_id: userId, type: 'Status Added', isSeen : false}).sort({ createdAt: -1 });
    // const changeRequests = await ChangeRequests.find({ user_id: userId, type: 'Status Added', isUserSeen : false}).sort({ createdAt: -1 });
    const changeRequests = await ChangeRequests.find({ user_id: userId, type: { $in: ['Status Added', 'Project Status Added'] }, isUserSeen : false}).sort({ createdAt: -1 });
    const results = [];

    for (let changeRequest of changeRequests) {
      // Check in DailyStatus where user_id matches with recipients or createdBy
      const dailyStatus = await DailyStatuses.findOne({
        $or: [
          { recipients: userId },
          { createdBy: userId }
        ]
      })
        .sort({ createdAt: -1 })  // Sort by createdAt in descending order
        .limit(1);   
      let user = null;
      if (dailyStatus) {
        // Fetch user details if dailyStatus is found
        user = await User.findById(dailyStatus.user_id);
      } else {
        // Fetch user details directly from changeRequest
        user = await User.findById(changeRequest.user_id);
      }
    
      results.push({
        changeRequest: changeRequest,
        user: user,
        dailyStatus: dailyStatus
      });
    }  
    return results;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
};

const getEmployeesLeaveHistory = async (request) => {
  try {
    let skip = 0;
    const limit = 10;
    skip = request.page >= 1 ? (request.page - 1) * limit : skip;
    const totalItems = await Leaves.find().sort({ createdAt: -1 }).countDocuments();
    let requests = [];
    let searchByInitial = request.alphaTerm ? request.alphaTerm.toLowerCase() : '';
    let searchByText = request.searchText ? request.searchText.toLowerCase() : '';
    let searchByTerm = request.optionTerm ? request.optionTerm.toLowerCase() : '';
    if (request.alphaTerm || request.searchText || request.optionTerm) {
      requests = await Leaves.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_id',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'approved_by',
            foreignField: '_id',
            as: 'approved_by',
          },
        },
        {
          $match: {
            $and: [
              {
                'user_id.name': { $regex: '^' + searchByInitial, $options: 'i' },
              },
              {
                status: { $regex: searchByTerm, $options: 'i' },
              },
            ],
            $or: [
              {
                'user_id.emp_id': { $regex: searchByText, $options: 'i' },
              },
              {
                'user_id.name': { $regex: searchByText, $options: 'i' },
              },
            ],
          },
        },
      ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      requests = await Leaves.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_id',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'approved_by',
            foreignField: '_id',
            as: 'approved_by',
          },
        },
      ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }
    // const leave = await Leaves.find().sort({ createdAt: -1 }).populate('user_id');

    return {
      total: totalItems,
      data: requests,
      // leave: leave,
    };
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getTeamEmployeesLeaveHistory = async (userId) => {
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

      const teamEmployeesId = [];
      for (let empId of childrensId) {
        if (!teamEmployeesId.find((e) => e === empId)) {
          teamEmployeesId.push(empId);
        }
      }

      const absentEmployees = await Leaves.find({
        status: 'pending',
        user_id: { $in: teamEmployeesId },
      }).populate({
        path: 'user_id',
        select: 'name',
      }).sort({ createdAt: -1 });
      return {
        absentEmployees,
      };
    }
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const approveLeave = async (leaveId, userId, body, parentId) => {
  try {
    if (parentId) {
      const res = await Leaves.updateOne({ _id: leaveId }, { $set: body });
      const leave = await Leaves.findById(leaveId);
      const user = await findUserById(leave.user_id);
      let absentsToRemove = await Leaves.find({
        user_id: leave.user_id,
        status: 'absent',
        from: {
          $gte: moment(leave.from),
          $lte: moment(leave.to),
        },
      });
      for (let absent of absentsToRemove) {
        await Leaves.findByIdAndDelete(absent._id);
      }
      if (absentsToRemove.length === 0) {
        // Find leaves based on user_id and status 'absent'
        latestAbsent = await Leaves.find({
          user_id: leave.user_id,
          status: 'absent',
        }).sort({ createdAt: -1 });

        // Delete the latest absent record if found
        if (latestAbsent) {
          const latestAbsentId = latestAbsent[0]._id;
          const filter = { _id: latestAbsentId };
          // Use deleteOne with the filter object
          const deleteResult = await Leaves.deleteOne(filter);
        }
      }

        if (leave.type !== 'Comp Off' && user.pending_leaves) {
          await manageUserLeaves(user, leave);
        }
        return res;
      }
    } catch (err) {
      throw new ApiError(httpStatus.NOT_MODIFIED, err);
    }
  };

  const urgentLeave = async (leaveId, userId, body, parentId) => {
    try {
      const checkData = await checkAccess(parentId, userId, leaveId);
      // if (!checkData) throw new ApiError(httpStatus.UNAUTHORIZED);
      const leave = await Leaves({ ...body, user_id: userId });
      await leave.save();
      await attendenceService.checkOut(userId);
      const user = await findUserById(userId);
      if (body.type !== 'Comp Off' && user.pending_leaves) {
        await manageUserLeaves(user, body);
      }
      const leaveRequest = {
        user_id: userId,
        request_message: `${user.name} has applied for leave`,
        type: 'Leave Request',
      };
      const notification = await ChangeRequests({ ...leaveRequest });
      await notification.save();
      return leave;
    } catch (err) {
      throw new ApiError(httpStatus.NOT_MODIFIED, err);
    }
  };

  const markAbsent = async (userId, body) => {
    try {
      const leave = await Leaves({
        from: moment().format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD'),
        duration: 'Full Day',
        status: 'absent',
        type: 'N/A',
        user_id: userId,
        // approved_by: body.current_user,
        // approved_by: body.type === "cronJobs" ? userId : body.current_user,
        approved_by: body.type === "cronJobs" ? "60f8fdac7aa54454e6b22d1f" : body.current_user,
      });
      await leave.save();
    } catch (err) {
      throw new ApiError(httpStatus.NOT_MODIFIED, err);
    }
  };

  const manageUserLeaves = async (user, leave) => {
    try {
      let remainingLeaves;
      if (leave.duration === 'Full Day') {
        if (moment(leave.from).isSame(moment(leave.to), 'days')) {
          remainingLeaves = user.pending_leaves - 1;
        } else {
          const diff = moment(leave.to).diff(moment(leave.from), 'days') + 1;
          remainingLeaves = user.pending_leaves - diff;
        }
      } else if (leave.duration === 'Half Day') {
        remainingLeaves = user.pending_leaves - 0.5;
      } else if (leave.duration === 'Short Day') {
        remainingLeaves = user.pending_leaves - 0.25;
      }

      user.pending_leaves = remainingLeaves > 0 ? remainingLeaves : 0;
      await user.save();
    } catch (err) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
    }
  };

  const rejectLeave = async (leaveId, userId, body, parentId) => {
    try {
      const leave = await Leaves.findById(leaveId);
      const checkData = await checkAccess(parentId, userId, leaveId);
      let absentsToRemove =   latestAbsent = await Leaves.find({
        user_id:leave.user_id,
        status: 'absent',
      }).sort({ createdAt: -1 });

        // Delete the latest absent record if found
        if (absentsToRemove && absentsToRemove.length > 0) {
          const latestAbsentId = absentsToRemove[0]._id;
          const filter = { _id: latestAbsentId };
          // Use deleteOne with the filter object
          const deleteResult = await Leaves.deleteOne(filter);
        }
      // if (!checkData) throw new ApiError(httpStatus.UNAUTHORIZED);
      const res = await Leaves.updateOne({ _id: leaveId }, { $set: body });
      return res;
    } catch (err) {
      throw new ApiError(httpStatus.NOT_MODIFIED, err);
    }
  };

  const cancelLeave = async (id) => {
    try {
      const body = {
        status: 'cancelled',
      };
      const res = await Leaves.updateOne({ _id: id }, { $set: body });
      return res;
    } catch (err) {
      throw new ApiError(httpStatus.NOT_MODIFIED, err);
    }
  };

  const cancelApprovedLeave = async (id) => {
    try {
      const body = {
        status: 'cancelled',
      };

      const res = await Leaves.updateOne({ _id: id }, { $set: body });
      const leave = await Leaves.findById(id);
      let user = await findUserById(leave.user_id);

      if (user.pending_leaves > 0) {
        let remainingLeaves;
        if (leave.type !== 'Comp Off') {
          if (leave.duration === 'Full Day') {
            if (moment(leave.from).isSame(moment(leave.to), 'days')) {
              remainingLeaves = user.pending_leaves + 1;
            } else {
              const diff = moment(leave.to).diff(moment(leave.from), 'days') + 1;
              remainingLeaves = user.pending_leaves + diff;
            }
          } else if (leave.duration === 'Half Day') {
            remainingLeaves = user.pending_leaves + 0.5;
          } else if (leave.duration === 'Short Day') {
            remainingLeaves = user.pending_leaves + 0.25;
          }
          user.pending_leaves = remainingLeaves;
        }
      } else {
        user.pending_leaves = leave.last_pending_leaves;
      }

      await user.save();
      return res;
    } catch (err) {
      throw new ApiError(httpStatus.NOT_MODIFIED, err);
    }
  };

  //Get today leave count
  const todayLeavesCount = async () => {
    try {
      const attendence = await AttendenceEntries.find({
        entry_date: {
          $gte: moment().startOf('day'),
          $lt: moment().endOf('day'),
        },
      }).populate('user_id');
      const leaves = await Leaves.find({
        // from: {
        //   $gte: moment().subtract(20, 'days'),
        // },
        // to: { $lt: moment().add(20, 'days') },
        from: { $lte: moment().add(20, 'days').endOf('day') }, // Leaves starting before or today + 20 days
        to: { $gte: moment().subtract(20, 'days').startOf('day') }, // Leaves ending after or today - 20 days
        status: 'approved',
      }).populate('user_id');

      const todayLeaveCount = [];
      for (let check of leaves) {
        if (
          !attendence.find((todayAttendence) => check.user_id.id === todayAttendence.user_id.id) ||
          check.duration == 'Half Day' ||
          check.duration == 'Short Day'
        ) {
          const isSameOrAfter = moment(moment().format('MM/DD/YYYY')).isSameOrAfter(
            moment(check.from).format('MM/DD/YYYY'),
            'day'
          );
          const isSameOrBefore = moment(moment().format('MM/DD/YYYY')).isSameOrBefore(
            moment(check.to).format('MM/DD/YYYY'),
            'day'
          );
          if (isSameOrAfter && isSameOrBefore) {
            todayLeaveCount.push(check);
          }
        }
      }

      return todayLeaveCount;
    } catch (error) {
      throw new ApiError(httpStatus.NOT_FOUND, error);
    }
  };
  //to check that user is on leave today or not
  const todayOnLeave = async (user_id) => {
    try {
      const leaves = await Leaves.find({
        from: {
          $gte: moment().subtract(20, 'days'),
        },
        to: { $lt: moment().add(20, 'days') },
        $or: [{ status: 'approved' }, { status: 'absent' }],
        user_id,
      });
      const todayLeaveCount = leaves.filter(
        (l) =>
          moment().isBetween(moment(l.from), moment(l.to)) || (moment().isSame(l.from, 'day') && moment().isSame(l.to, 'day'))
      );
      return todayLeaveCount.length > 0 ? true : false;
    } catch (error) {
      throw new ApiError(httpStatus.NOT_FOUND, error);
    }
  };

  //to check that user is on leave today or not
  //Previous Code
  // const isUserOnLeaveToday = async (user_id) => {
  //   try {
  //     const leaves = await Leaves.find({
  //       from: {
  //         $gte: moment().subtract(20, 'days'),
  //       },
  //       to: { $lt: moment().add(20, 'days') },
  //       $or: [{ status: 'approved' }, { status: 'absent' }],
  //       user_id,
  //     });
  //     const todayLeaveCount = leaves.filter(
  //       (l) =>
  //         moment().isBetween(moment(l.from), moment(l.to)) || (moment().isSame(l.from, 'day') && moment().isSame(l.to, 'day'))
  //     );
  //     return todayLeaveCount.length > 0 ? true : false;
  //   } catch (error) {
  //     throw new ApiError(httpStatus.NOT_FOUND, error);
  //   }
  // };

  // New Code 
  const isUserOnLeaveToday = async (user_id) => {
    try {
      const today = new Date();  
      const leaves = await Leaves.find({
        from: { $lte: today },
        to: { $gte: today },
        status: { $in: ['approved', 'absent'] },
        user_id,
      });

      return leaves.length > 0 ? true : false;
    } catch (error) {
      throw new ApiError(httpStatus.NOT_FOUND, error);
    }
  };  

  const getNotifiedData = async (notificationId) => {
    try {
      const changeRequest = await ChangeRequests.findOneAndUpdate(
        { _id: notificationId },
        { $set: { isUserSeen: true } },
      );
    } catch (error) {
      console.error('Error marking as seen:', error);
    }
  };

  module.exports = {
    applyForLeave,
    getUserLeaves,
    getUserApprovedLeaves,
    getUserPendingLeaves,
    approveLeave,
    urgentLeave,
    rejectLeave,
    getEmployeesLeaveHistory,
    cancelLeave,
    todayLeavesCount,
    findUserById,
    manageUserLeaves,
    cancelApprovedLeave,
    getUserDashboardLeaves,
    markAbsent,
    todayOnLeave,
    isUserOnLeaveToday,
    getTeamEmployeesLeaveHistory,
    getLeaveByLeaveId,
    getTaggedNotifiedUsers,
    getNotifiedData,
  };
