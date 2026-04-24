const { userService, leavesService } = require('../services');
const { AttendenceEntries, ImportantDates } = require('../models');
const moment = require('moment');

const markAbsentForNotCheckedInUsers = async () => {
  // first check if Weekends off
  if (new Date().getDay() > 0 && new Date().getDay() < 6) {
    const users = await userService.findAllUserIds();

    const todaysEntries = await AttendenceEntries.find({
      entry_date: {
        $gte: moment().startOf('day'),
        $lt: moment().endOf('day'),
      },
    }).select(['_id', 'user_id']);

    const absentUserIds = [];
    for (let user of users) {
      const entryExist = await todaysEntries.find((entry) => entry.user_id.toString() === user._id.toString());
      if (!entryExist) {
        absentUserIds.push(user._id);
      }
    }
    console.log({ users: users.length });
    console.log({ absentUserIds: absentUserIds.length });

    const isTodayHoliday = await ImportantDates.find({
      date: {
        $gte: moment().startOf('day'),
        $lt: moment().endOf('day'),
      },
    });

    // Check public holiday
    if (isTodayHoliday.length === 0) {
      for (let userId of absentUserIds) {
        const isOnLeaveToday = await leavesService.isUserOnLeaveToday(userId);
        if (!isOnLeaveToday) {
          leavesService.markAbsent(userId, body = {type:"cronJobs"});
        }
      }
    }
  }
};

module.exports = {
  markAbsentForNotCheckedInUsers,
};
