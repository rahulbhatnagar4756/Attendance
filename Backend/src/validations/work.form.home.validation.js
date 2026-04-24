const Joi = require('@hapi/joi');
const { objectId } = require('./custom.validation');

const applyForWfh = {
  body: Joi.object().keys({
    from: Joi.date().required(),
    to: Joi.date().required(),
    wfh_reason: Joi.string().required(),
    approved_by: Joi.string().required(),
  }),
};

const getWfhRequests = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
  }),
};

const approveWfhRequest = {
  params: Joi.object().keys({
    wfhId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().required().valid('approved'),
  }),
};

const rejectWfhRequest = {
  params: Joi.object().keys({
    wfhId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().required().valid('rejected'),
    reject_reason: Joi.string().required(),
  }),
};


module.exports = {
    applyForWfh,
    getWfhRequests,
    approveWfhRequest,
    rejectWfhRequest
};