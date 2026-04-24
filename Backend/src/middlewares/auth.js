const passport = require('passport');
const httpStatus = require('http-status');
const JWT = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const config = require('../config/config');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  const getRole = !req.headers['role'] ? req.headers['role'] : req.headers['role'].toString();
  if(user.isExEmployee){
    return reject(new ApiError(httpStatus.MISDIRECTED_REQUEST,  'You are not authorized for this request'));
  }
  if (err || info || !user) {
    if(info.expiredAt){
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Session expired, please login again'));
    }else{
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
  }
  if(getRole && user && getRole !== user.role.role){
    return reject(new ApiError(httpStatus.TEMPORARY_REDIRECT,  'Your role has been changed, please login again'))
  }
  req.user = user;
  if (requiredRights.length) {
    const userRights = roleRights.get(user.role.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth = (...requiredRights) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
  })
    .then(() => {
      next();
    })
    .catch((err) => next(err));
};

const getUserIdToken = async (bearerToken) => {
  const token = bearerToken.split(' ');
  const Token = token[1];
  let userId = '';
  await JWT.verify(Token, config.jwt.secret, (err, payload) => {
    if (err) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect');
    }
    userId = payload.sub;
  });
  return userId;
};

module.exports = { auth, getUserIdToken };
