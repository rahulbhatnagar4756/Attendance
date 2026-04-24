const Joi = require('@hapi/joi');
// const { objectId } = require('./custom.validation');

const addProject = {
  body: Joi.object().keys({
    project_name: Joi.string().required(),
    project_description: Joi.string().required(),
    
  })
};


module.exports = {
    addProject,
};