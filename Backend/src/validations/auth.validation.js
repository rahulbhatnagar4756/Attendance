const Joi = require('@hapi/joi');
const { password, objectId } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().required().custom(objectId),
    type: Joi.string().optional(),
    // deviceToken:Joi.string()
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};
const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().required(),
  }),
};
const verifyCode = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    code: Joi.string().required(),
    type: Joi.string().required(),
  }),
};
const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required().custom(password),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  verifyCode,
  resetPassword,
};
