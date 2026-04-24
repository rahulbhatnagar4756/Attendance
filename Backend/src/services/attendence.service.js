const httpStatus = require('http-status');
const moment = require('moment');
const { data } = require('../config/logger');
const { AttendenceEntries, User, Leaves, Organisation, Subject, DailyStatuses } = require('../models');
const UserLevel = require('../models/user.level.model');
const { ImportantDates } = require('../models');
const { s3CheckoutImageUpload } = require('../utils/AWS');
const ApiError = require('../utils/ApiError');

const getCurrentDate = () => {
  return moment().format();
};

const checkIn = async (userId, body) => {
  try {
    const user = await User.findById(userId);
    const absentEntry = await Leaves.findOne({
      user_id: userId,
      from: {
        $gte: moment().startOf('day'),
        $lt: moment().endOf('day'),
      },
      status: 'absent',
    });
    if (absentEntry) {
      await Leaves.deleteOne({ _id: absentEntry._id });
    }
    const attendence = await AttendenceEntries({
      ...body,
      user_id: userId,
      user_name: user.name,
      emp_id: user.emp_id,
      check_in: moment(),
      entry_date: moment(),
      check_in_location: body.locationData
    });
    await attendence.save();
    return attendence;
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, err);
  }
};

const checkOut = async (userId, body, file) => {
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
      let getImagePath = '';
      if (file) {
        const userImage = {
          file: file.user_image,
        };
        const response = await s3CheckoutImageUpload(userImage);
        if (response) {
          getImagePath = response.Location;
        }
      }
      const res = await AttendenceEntries.updateOne(
        {
          entry_date: {
            $gte: moment().startOf('day'),
            $lt: moment().endOf('day'),
          },
          user_id: userId,
        },
        { $set: { check_out: moment(), location: body, user_image: getImagePath } }
      );
      const leaves = await Leaves.find({ user_id: userId });
      let user = await User.findById(userId);
      const attendence = await getAttendenceOfDay(userId);
      if (attendence) {
        const checkOut = moment(attendence.check_out);

        const checkIn = moment(attendence.check_in);
        const durations = moment.duration(checkOut.diff(checkIn));
        let hours = Math.floor(durations.asHours());
        for (let checkLeaves of leaves) {
          const isSameOrAfter = moment(moment().format('MM/DD/YYYY')).isSameOrAfter(
            moment(checkLeaves.from).format('MM/DD/YYYY'),
            'day'
          );
          const isSameOrBefore = moment(moment().format('MM/DD/YYYY')).isSameOrBefore(
            moment(checkLeaves.to).format('MM/DD/YYYY'),
            'day'
          );
          if (isSameOrAfter && isSameOrBefore) {
            if (checkLeaves.status === 'approved' && attendence.check_out) {
              if (hours >= '4' && hours < '6') {
                user.pending_leaves += 0.5;
              } else if (hours >= '6' && hours < '8') {
                user.pending_leaves += 0.75;
              } else if (hours >= '8') {
                user.pending_leaves += 1;
              }
              user.save();
            }
          }
        }

        if (attendence.check_out) {
          await getTotalWorkingHours(attendence);
        }
      }
      return res;
    } else {
      return false;
    }
  } catch (err) {
    console.trace(err);
    throw new ApiError(httpStatus.FORBIDDEN, err);
  }
};

const updateAttendence = async (body, userId) => {
  const res = await AttendenceEntries.updateOne(
    {
      entry_date: {
        $gte: moment(body.entry_date).startOf('day'),
        $lt: moment(body.entry_date).endOf('day'),
      },
      user_id: userId,
    },
    { $set: body }
  );
  const attendence = await getAttendenceOfSpecificDate(userId, body.entry_date);
  if (attendence.check_out) {
    await getTotalWorkingHours(attendence);
  }
  return res;
};

const addNewAttendence = async (body, userId) => {
  console.log(userId, body);
  try {
    const user = await User.findById(userId);
    const absentEntry = await Leaves.findOne({
      user_id: userId,
      from: {
        $gte: moment(body.check_in).startOf('day'),
        $lt: moment(body.checkIn).endOf('day'),
      },
      status: 'absent',
    });
    if (absentEntry) {
      await Leaves.deleteOne({ _id: absentEntry._id });
    }
    const attendence = await AttendenceEntries({
      ...body,
      user_id: userId,
      user_name: user.name,
      emp_id: user.emp_id,
      on_leave: false,
      check_in: moment(body.check_in),
      check_out: moment(body.check_out),
      entry_date: moment(body.check_in),
    });

    const newattendence = await getTotalWorkingHours(attendence);
    return newattendence;
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, err);
  }
};

const removeTimeout = async (attandenceId) => {
  try {
    await AttendenceEntries.updateOne({ _id: attandenceId }, { $unset: { check_out: '', working_hours: '', location: '', user_image: '' } });
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, err);
  }
};

const breakStart = async (body, userId) => {
  try {
    const entry = await AttendenceEntries.findOne({
      entry_date: { $gte: moment().startOf('day'), $lt: moment().endOf('day') },
      user_id: userId,
    });
    body['start'] = moment();

    entry.breaks.push(body);
    return await entry.save();
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, err);
  }
};

const breakEnd = async (userId) => {
  try {
    const data = await AttendenceEntries.findOne({
      entry_date: { $gte: moment().startOf('day'), $lt: moment().endOf('day') },
      user_id: userId,
    });
    let lastBreak = data.breaks[data.breaks.length - 1];
    lastBreak['end'] = moment();
    return await data.save();
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, err);
  }
};

const presentUserCount = async () => {
  try {
    return await AttendenceEntries.find({
      entry_date: {
        $gte: moment().startOf('day'),
        $lt: moment().endOf('day'),
      },
    }).populate({
      path: 'user_id',
      // match: { isExEmployee: { $ne: true } },
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

//Get today report list
const todayReport = async (request) => {
  try {
    let skip = 0;
    const limit = 10;
    skip = request.page >= 1 ? (request.page - 1) * limit : skip;
    const searchByInitial = request.alphaTerm ? request.alphaTerm.toLowerCase() : '';
    const searchByText = request.searchText ? request.searchText : '';
    const searchByTerm = request.optionTerm ? request.optionTerm.toLowerCase() : '';
    let requests = [];
    let totalItems = 0;
    if (!!request.alphaTerm || !!request.searchText || !!request.optionTerm) {
      totalItems = await AttendenceEntries.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_id',
          },
        },
        {
          $match: {
            entry_date: {
              $gte: new Date(moment().format('YYYY-MM-DD')),
              $lte: new Date(moment().add(1, 'day').format('YYYY-MM-DD')),
            },
            $and: [
              {
                'user_id.name': { $regex: '^' + searchByInitial, $options: 'i' },
              },
              {
                work_from: { $regex: searchByTerm, $options: 'i' },
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
        {
          $count: 'total_items',
        },
      ]);
      if (totalItems.length > 0) {
        totalItems = totalItems[0].total_items;
      } else {
        totalItems = 0;
      }

      requests = await AttendenceEntries.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_id',
          },
        },
        {
          $match: {
            entry_date: {
              $gte: new Date(moment().format('YYYY-MM-DD')),
              $lte: new Date(moment().add(1, 'day').format('YYYY-MM-DD')),
            },
            $and: [
              {
                'user_id.name': { $regex: '^' + searchByInitial, $options: 'i' },
              },
              {
                work_from: { $regex: searchByTerm, $options: 'i' },
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
      totalItems = await AttendenceEntries.find({
        entry_date: {
          $gte: moment().startOf('day'),
          $lt: moment().endOf('day'),
        },
      }).countDocuments();
      requests = await AttendenceEntries.find({
        entry_date: {
          $gte: moment().startOf('day'),
          $lt: moment().endOf('day'),
        },
      })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'user_id',
          // match: { isExEmployee: { $ne: true } },
        });
    }
    return {
      total: totalItems,
      data: requests,
      // totalPages,
    };
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const todayWfhReport = async (request) => {
  try {
    let skip = 0;
    const limit = 10;
    skip = request.page >= 1 ? (request.page - 1) * limit : skip;
    const searchByInitial = request.alphaTerm ? request.alphaTerm.toLowerCase() : '';
    const searchByText = request.searchText ? request.searchText : '';
    let requests = [];
    let totalItems = 0;

    const todayStart = moment().startOf('day').toDate();
    const todayEnd = moment().endOf('day').toDate();

    if (!!request.alphaTerm || !!request.searchText) {
      totalItems = await AttendenceEntries.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_id',
          },
        },
        { $unwind: '$user_id' },
        {
          $match: {
            entry_date: {
              $gte: todayStart,
              $lte: todayEnd,
            },
            work_from: { $regex: '^home$', $options: 'i' },
            $and: [
              {
                'user_id.name': { $regex: '^' + searchByInitial, $options: 'i' },
              },
            ],
            $or: [
              { 'user_id.emp_id': { $regex: searchByText, $options: 'i' } },
              { 'user_id.name': { $regex: searchByText, $options: 'i' } },
            ],
          },
        },
        { $count: 'total_items' },
      ]);
      totalItems = totalItems.length > 0 ? totalItems[0].total_items : 0;

      requests = await AttendenceEntries.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_id',
          },
        },
        { $unwind: '$user_id' },
        {
          $match: {
            entry_date: {
              $gte: todayStart,
              $lte: todayEnd,
            },
            work_from: { $regex: '^home$', $options: 'i' },
            $and: [
              {
                'user_id.name': { $regex: '^' + searchByInitial, $options: 'i' },
              },
            ],
            $or: [
              { 'user_id.emp_id': { $regex: searchByText, $options: 'i' } },
              { 'user_id.name': { $regex: searchByText, $options: 'i' } },
            ],
          },
        },
      ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      totalItems = await AttendenceEntries.find({
        entry_date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
        work_from: 'home',
      }).countDocuments();

      requests = await AttendenceEntries.find({
        entry_date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
        work_from: 'home',
      })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'user_id' });
    }

    return {
      total: totalItems,
      data: requests,
    };
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const todayTeamReport = async (request, userId) => {
  try {
    let skip = 0;
    const limit = 15;
    skip = request.page >= 1 ? (request.page - 1) * limit : skip;
    const searchByInitial = request.alphaTerm ? request.alphaTerm.toLowerCase() : '';
    const searchByText = request.searchText ? request.searchText : '';
    const searchByTerm = request.optionTerm ? request.optionTerm.toLowerCase() : '';
    let requests = [];
    let totalItems = 0;

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
    if (!!request.alphaTerm || !!request.searchText || !!request.optionTerm) {
      totalItems = await AttendenceEntries.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_id',
          },
        },
        {
          $match: {
            entry_date: {
              $gte: new Date(moment().format('YYYY-MM-DD')),
              $lte: new Date(moment().add(1, 'day').format('YYYY-MM-DD')),
            },
            $and: [
              {
                'user_id._id': { $in: childrensId },
              },
              {
                'user_id.name': { $regex: '^' + searchByInitial, $options: 'i' },
              },
              {
                work_from: { $regex: searchByTerm, $options: 'i' },
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
        {
          $count: 'total_items',
        },
      ]);

      if (totalItems.length > 0) {
        totalItems = totalItems[0].total_items;
      } else {
        totalItems = 0;
      }

      requests = await AttendenceEntries.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_id',
          },
        },
        {
          $match: {
            entry_date: {
              $gte: new Date(moment().format('YYYY-MM-DD')),
              $lte: new Date(moment().add(1, 'day').format('YYYY-MM-DD')),
            },
            $and: [
              {
                'user_id._id': { $in: childrensId },
              },
              {
                'user_id.name': { $regex: '^' + searchByInitial, $options: 'i' },
              },
              {
                work_from: { $regex: searchByTerm, $options: 'i' },
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
      totalItems = await AttendenceEntries.find({
        entry_date: {
          $gte: moment().startOf('day'),
          $lt: moment().endOf('day'),
        },
        user_id: { $in: childrensId },
      }).countDocuments();
      requests = await AttendenceEntries.find({
        entry_date: {
          $gte: moment().startOf('day'),
          $lt: moment().endOf('day'),
        },
        user_id: { $in: childrensId },
      })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'user_id',
          // match: { isExEmployee: { $ne: true } },
        });
    }

    return {
      total: totalItems,
      data: requests,
      // totalPages,
    };
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const getAttendenceOfDay = async (userId) => {
  try {
    return await AttendenceEntries.findOne({
      user_id: userId,
      check_in: {
        $gte: moment().startOf('day'),
        $lt: moment().endOf('day'),
      },
    });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const getAttendenceOfSpecificDate = async (userId, date) => {
  try {
    return await AttendenceEntries.findOne({
      user_id: userId,
      entry_date: {
        $gte: moment(date).startOf('day'),
        $lt: moment(date).endOf('day'),
      },
    });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const getCurrentMonthAttendence = async (userId) => {
  try {
    return await AttendenceEntries.find({
      user_id: userId,
      entry_date: {
        $gte: moment().startOf('month'),
        $lt: moment().endOf('month'),
      },
    });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const getSelectedRangeAttendence = async (body, userId) => {
  try {
    return await AttendenceEntries.find({
      user_id: userId,
      entry_date: {
        $gte: moment(body.start).startOf('day'),
        $lt: moment(body.end).endOf('day'),
      },
    });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const getTotalWorkingHours = async (attendence) => {
  try {
    const checkIn = moment(attendence.check_in);
    const checkOut = moment(attendence.check_out);
    const duration = moment.duration(checkOut.diff(checkIn));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const breaks = await calculateBreaks(attendence.breaks);
    const breakHours = breaks.get('h');
    const breakMinutes = breaks.get('m');
    const totalWorkingHours = moment(`${hours}:${minutes}`, 'hh:mm').subtract(breakHours, 'h').subtract(breakMinutes, 'm');
    let totalHours = totalWorkingHours.get('h');

    if (/^\d$/.test(totalHours)) {
      totalHours = `0${totalHours}`;
    }
    let totalMinutes = totalWorkingHours.get('m');

    if (/^\d$/.test(totalMinutes)) {
      totalMinutes = `0${totalMinutes}`;
    }
    attendence['working_hours'] = `${totalHours}:${totalMinutes}`;
    await attendence.save();
    return attendence.working_hours;
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const calculateBreaks = async (breaks) => {
  const breaksTime = moment().utcOffset(0);
  breaksTime.set({ hours: 0, minutes: 0, seconds: 0 });
  breaksTime.toISOString();
  breaksTime.format();
  for (i = 0; i < breaks.length; i++) {
    const start = moment(breaks[i].start);
    const end = moment(breaks[i].end);
    const duration = moment.duration(end.diff(start));
    const a = moment(breaksTime).add(duration.hours(), 'h').add(duration.minutes(), 'm').add(duration.seconds(), 's');
    breaksTime.set({
      hours: a.get('h'),
      minutes: a.get('m'),
      seconds: a.get('s'),
    });
  }
  return breaksTime;
};

const downloadReport = async (from, to) => {
  try {
    const users = await User.find({ isExEmployee: false });
    const entries = await AttendenceEntries.find({
      entry_date: {
        $gte: moment(from).startOf('day').format(),
        $lte: moment(to).endOf('day').format(),
      },
    }).populate({ path: 'user_id' });
    const leaves = await Leaves.find({
      $or: [
        {
          from: {
            $gte: moment(from).startOf('day').format(),
            $lte: moment(to).endOf('day').format(),
          },
        },
        {
          to: {
            $gte: moment(from).startOf('day').format(),
            $lte: moment(to).endOf('day').format(),
          },
        },
      ],
      status: ['approved', 'absent'],
    }).populate({ path: 'user_id' });

    let getPublicHolidaysDate = [];
    const importantDates = await ImportantDates.find({}).select({ date: 1, _id: 0 });
    importantDates.map((dates) => {
      let date = moment(dates.date).format('YYYY-MM-DD');
      getPublicHolidaysDate.push(date);
    });

    return {
      entries,
      leaves,
      users,
      getPublicHolidaysDate,
    };
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const removeBreak = async (id) => {
  try {
    const data = await AttendenceEntries.findOne({ breaks: { $elemMatch: { _id: id } } });
    const breakId = data._id;
    const breakData = await AttendenceEntries.updateOne({ _id: breakId }, { $pull: { breaks: { _id: id } } });
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, err);
  }
};

module.exports = {
  getCurrentDate,
  checkIn,
  checkOut,
  breakStart,
  breakEnd,
  addNewAttendence,
  getAttendenceOfDay,
  getTotalWorkingHours,
  calculateBreaks,
  getAttendenceOfSpecificDate,
  getCurrentMonthAttendence,
  getSelectedRangeAttendence,
  presentUserCount,
  todayReport,
  todayTeamReport,
  updateAttendence,
  removeTimeout,
  downloadReport,
  removeBreak,
  todayWfhReport,
};
