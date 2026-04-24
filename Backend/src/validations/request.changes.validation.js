const Joi = require('@hapi/joi');

const sendRequest = {
  body: Joi.object().keys({
    user_id: Joi.string().required(),
    attendence_id: Joi.string(),
    date: Joi.date().required(),
    request_message: Joi.string().required(),
    type: Joi.string().required().valid('Leave Request', 'Change Request'),
  }),
};

module.exports = {
  sendRequest,
};
