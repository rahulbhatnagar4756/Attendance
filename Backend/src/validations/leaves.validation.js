const Joi = require('@hapi/joi');
const { objectId } = require('./custom.validation');

const applyForLeave = {
  body: Joi.object().keys({
    from: Joi.date().required(),
    to: Joi.date().required(),
    leave_reason: Joi.string().required(),
    duration: Joi.string().required().valid('Short Day', 'Half Day', 'Full Day'),
    type: Joi.string().required().valid('Leave', 'Sick Leave', 'Comp Off', 'Maternity Leave'),
    start_time: Joi.string(),
    end_time: Joi.string(),
    comp_off_date: Joi.date(),
    approved_by: Joi.string().required(),
    file_name: Joi.string().optional(),
    sick_leave_attachment: Joi.string().optional() // Allow null and empty string
  }),
};

const getUserPendingLeaves = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
  }),
};
const getUserLeaves = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
  }),
};
const approveLeave = {
  params: Joi.object().keys({
    leaveId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().required().valid('approved'),
  }),
};
const rejectLeave = {
  params: Joi.object().keys({
    leaveId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().required().valid('rejected'),
    reject_reason: Joi.string().required(),
  }),
};
const cancelLeave = {
  params: Joi.object().keys({
    leaveId: Joi.string().required().custom(objectId),
  }),
};

const markAbsent = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
  }),
};
const todayOnLeave = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  applyForLeave,
  getUserPendingLeaves,
  getUserLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
  markAbsent,
  todayOnLeave,
};
