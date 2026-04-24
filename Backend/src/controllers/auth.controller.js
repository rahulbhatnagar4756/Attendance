const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { authService, userService, tokenService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { username, password, role, type } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(username, password, role, type);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const user = await authService.getUserByRefreshToken(req.body.refreshToken);
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ user, tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const user = await userService.getUserByEmail(req.body.email);

  if (!user || user.isDeleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User with this email does not exist');
  }

  await authService.forgotPassword(req.body.email);
  res.status(httpStatus.OK).send('email sent successfuly');
});

const verifyCode = catchAsync(async (req, res) => {
  const { email, code, type, isVerified } = req.body;
  await authService.findMailAndMatchCode(email, code, type, isVerified);
  res.status(httpStatus.OK).send('code verified successfully');
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  await authService.resetPassword(email, password);
  res.status(httpStatus.OK).send({ message: 'Password Updated Successfully' });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  verifyCode,
  resetPassword,
};
