const Joi = require('@hapi/joi');

const addDates = {
  body: Joi.object().keys({
    date: Joi.date().required(),
    event: Joi.string().required(),
  }),
};

module.exports = {
  addDates,
};
