const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const emailService = require('./email.service');
// const verifyCodeService = require('./verifyCode.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { verificationCode } = require('../models');
// const { forgotPasswordTemplate } = require('../utils/emailTemplate');
const { generateCode } = require('../utils/helpers');
const  rolesService  = require('./roles.service');

/**
 * Login with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (username, password, role, type) => {
  try {
    const roleData = await rolesService.getUserRoleById(role);
    const user = await userService.getUserByUsername(username);
    if (!user || !(await user.isPasswordMatch(password)) || roleData.role!==user.role.role) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect username or password');
    }
    // if (user.role._id != role) {
    if ( type === "user" && roleData.role !== "Employee" && roleData.role !== "Out Source"){
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized for this request');
    }
    if (user.isDeleted) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Account does not exist');
    }
    if (user.isExEmployee) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are no longer with this orgainisation')
    }
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, error);
  }
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }

  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};
const getUserByRefreshToken = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    return await userService.getUserById(refreshTokenDoc.user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};
/**
 * Refresh auth tokens
 * @param {string} email
 * @returns {Promise<Object>}
 */
const forgotPassword = async (email) => {
  try {
    const code = await generateCode();
    const to = email;
    const subject = 'Please reset your password';
    const text = forgotPasswordTemplate(code);
    const tableData = {
      email: email,
      code: code,
    };

    await saveVerificationCode(tableData);
    await emailService.sendEmail(to, subject, text);
  } catch (error) {
    throw new ApiError(httpStatus.FAILED_DEPENDENCY, error);
  }
};
/**
 * Refresh auth tokens
 * @param {string} email
 * @param {string} code
 * @returns {Promise<Object>}
 */
const saveVerificationCode = async (data) => {
  if (await verificationCode.isEmailTaken(data.email)) {
    return verificationCode.updateOne(
      { email: data.email },
      {
        $set: {
          code: data.code,
          isVerified: 'false',
        },
      }
    );
  }
  const user = await verificationCode.create(data);
  return user;
};
/**
 * Refresh auth tokens
 * @param {string} email
 * @param {string} code
 * @param {string} type
 * @returns {Promise<Object>}
 */
const findMailAndMatchCode = async (email, code, type) => {
  const codeObj = await verifyCodeService.getCodeByEmail(email);

  if (!codeObj || !(await codeObj.isCodeMatch(code, type))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'code did not matched');
  }
  if (codeObj.isVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Your code is incorrect or expired');
  }
  await verifyCodeService.updateIsVerified(email);
  return codeObj;
};

/**
 * Refresh auth tokens
 * @param {string} email
 * @param {string } password
 * @returns {Promise<Object>}
 */
const resetPassword = async (email, password) => {
  try {
    let user = await userService.getUserByEmail(email);
    if (user) {
      user.password = password;
      await user.save();
      return user;
    } else {
      throw new Error('Please verify your code first');
    }
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, error);
  }
};
module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  getUserByRefreshToken,
  forgotPassword,
  findMailAndMatchCode,
  resetPassword,
};
