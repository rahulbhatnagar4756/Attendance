const { userService } = require('../services');

const addMonthlyLeaves = async () => {
  const users = await userService.findAllUsers();

  for (let user of users) {
    user.pending_leaves = user.pending_leaves ? user.pending_leaves + 1 : 1;
    await user.save();
  }
};

const updateYearlyAllottedLeaves = async () => {
  const users = await userService.findAllUsers();

  for (let user of users) {
    user.allotted_leaves = 12;
    await user.save();
  }
};

module.exports = {
  addMonthlyLeaves,
  updateYearlyAllottedLeaves
};

//0 1 * *
