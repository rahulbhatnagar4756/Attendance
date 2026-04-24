const Joi = require("@hapi/joi");
const { objectId } = require("./custom.validation");

const addTeamMembers = {
  params: Joi.object().keys({
    leadId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    team_members: Joi.array().required().custom(objectId),
  }),
};

const getTeamMembers = {
  params: Joi.object().keys({
    leadId: Joi.string().required().custom(objectId),
  }),
};

const deleteTeamMembers = {
  params: Joi.object().keys({
    leadId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    team_members: Joi.array().required().custom(objectId),
  }),
};

module.exports = {
  addTeamMembers,
  getTeamMembers,
  deleteTeamMembers,
};
