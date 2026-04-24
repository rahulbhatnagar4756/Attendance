const Joi = require('@hapi/joi');
const { objectId } = require('./custom.validation');

const addCandidate = {
  body: Joi.object().keys({
    candidate_name: Joi.string().required(),
    phone: Joi.number().required(),
    email: Joi.string().required().email(),
    dob: Joi.date(),
    current_company: Joi.string().required(),
    experience: Joi.string().required(),
    current_ctc: Joi.string().required(),
    expected_ctc: Joi.string().required(),
    notice_period: Joi.number().required(),
    current_location: Joi.string().required(),
    source_of_hiring: Joi.string().required(),
    qualification: Joi.string().required(),
    category: Joi.string().required().custom(objectId),
    candidate_cv_fileName: Joi.string(),
    candidate_cv_URL: Joi.string(),
  })
};


const deleteCandidate = {
  body: Joi.object().keys({
    userId: Joi.array().required().custom(objectId),
  }),
};

module.exports = {
  addCandidate,
  deleteCandidate,
};