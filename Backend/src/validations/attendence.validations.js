const Joi = require('@hapi/joi');
const { objectId } = require('./custom.validation');

const checkIn = {
  body: Joi.object().keys({
    on_leave: Joi.boolean().required(),
    work_from: Joi.string().required(),
    locationData:Joi.object().keys({
        formatted_address: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
    }),
  }),
};

const checkOut = {
  body: Joi.object().keys({
    formatted_address: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    user_image: Joi.string().optional(),
  }),
};

const breakStart = {
  body: Joi.object().keys({
    reason: Joi.string().required(),
  }),
};

const getCurrentMonthAttendence = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  checkIn,
  checkOut,
  breakStart,
  getCurrentMonthAttendence,
};
