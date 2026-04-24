const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService, imageUploadService, tokenService } = require('../services');
const { getUserIdToken } = require('../middlewares/auth');
const { claculateNetSalary, convertToWords } = require('../utils/calculateNetSalary');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
var html_to_pdf = require('html-pdf-node');
const ApiError = require('../utils/ApiError');

const templatePath = path.join(__dirname, '..', 'views', 'user');

const addEmployee = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send({ user });
});

const addEmployeePersonalDetails = catchAsync(async (req, res) => {
  const personalDetails = await userService.addEmployeePersonalDetails(req.body);
  res.status(httpStatus.OK).send({ personalDetails });
});

const addEmployeeSalary = catchAsync(async (req, res) => {
  const userSalary = await userService.addEmployeeSalary(req.body);
  res.status(httpStatus.CREATED).send({ userSalary });
});

const addEmployeeVerification = catchAsync(async (req, res) => {
  const userVerification = await userService.addEmployeeVerification(req.body, req.files);
  res.status(httpStatus.CREATED).send({ userVerification });
});

const getAllEmployees = catchAsync(async (req, res) => {
  const user = await userService.getAllEmployees(req.query);
  res.status(httpStatus.OK).send({ user });
});

const getAllTeamList = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const user = await userService.getAllEmployeesForTeamList(req.query, userId);
  res.status(httpStatus.OK).send({ user });
});

const getUnCheckedEmployees = catchAsync(async (req, res) => {
  const user = await userService.getUnCheckedEmployees();
  res.status(httpStatus.OK).send({ user });
});

const getUsersCount = catchAsync(async (req, res) => {
  const usersCount = await userService.getUsersCount();
  res.status(httpStatus.OK).send({ users: usersCount });
});

const deleteEmployee = catchAsync(async (req, res) => {
  await userService.deleteUser(req.body);
  res.status(httpStatus.OK).send({ message: 'Deleted Successfully' });
});

const deactivateEmployee = catchAsync(async (req, res) => {
  await userService.deactivateEmployee(req.body);
  res.status(httpStatus.OK).send({ message: 'Employee Deactivated Successfully' });
});

//for admin
const getUser = catchAsync(async (req, res) => {
  const result = await userService.getUserById(req.params.userId);
  // const result = await userService.getUserByIdForEditUser(req.params.userId);
  res.status(httpStatus.OK).send({ user: result });
});

const getUserWithLevel = catchAsync(async (req, res) => {
  const result = await userService.getUserWithLevelById(req.params.userId);
  res.status(httpStatus.OK).send({ user: result.user, userLevel:  result.userLevel});
});

const getVerificationDetailsByUserId = catchAsync(async (req, res) => {
  const result = await userService.getVerificationDetailsByUserId(req.params.userId);
  res.status(httpStatus.OK).send({ verificationDetails: result });
});

const getSalaryByUserId = catchAsync(async (req, res) => {
  const result = await userService.getSalaryByUserId(req.params.userId, req.query.year, req.query.month);
  res.status(httpStatus.OK).send({ salary: result });
});

//for user
const getUserByToken = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const user = await userService.getUserById(userId);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const getUserByEmpId = catchAsync(async (req, res) => {
  const result = await userService.getUserByUsername(req.body.empId);
  res.status(httpStatus.OK).send({ user: result });
});

const getUserLevelData = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const userLevelData = await userService.getLevelById(userId);
  res.send({ userId, userLevelData });
});

const getUserTodayStatus = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const status = await userService.getTodaysStatus(userId);
  res.send(status);
});

const updateUser = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  // await userService.updateUserById(userId, req.body);
  const user = await userService.updateUserById(userId, req.body);
  // res.status(httpStatus.OK).send({ message: 'Updated Successfully' });
  res.status(httpStatus.OK).send({ user });
});

const updateSingleUser = catchAsync(async (req, res) => {
  // await userService.updateUserById(req.params.userId, req.body, req.files);
  const user = await userService.updateUserById(req.params.userId, req.body, req.files);
  // res.status(httpStatus.OK).send({ message: 'Updated Successfully' });
  res.status(httpStatus.OK).send({ user });
});

const updateUserVerificationDetails = catchAsync(async (req, res) => {
  const updatedVerificationDetails = await userService.updateUserVerificationDetails(req.params.userId, req.body, req.files);
  res.status(httpStatus.OK).send({ updatedVerificationDetails });
});

const updateUserSalary = catchAsync(async (req, res) => {
  const updatedSalaryDetails = await userService.updateUserSalary(req.params.userId, req.body);
  res.status(httpStatus.OK).send({ updatedSalaryDetails });
});

const uploadImage = catchAsync(async (req, res) => {
  await imageUploadService.uploadImage(req);
  res.status(httpStatus.OK).send({ message: 'Updated Successfully' });
});

const getDeactivatedEmployees = catchAsync(async (req, res) => {
  const user = await userService.getDeactivatedEmployees(req.query);
  res.status(httpStatus.OK).send({ user });
});

const getAllBday = catchAsync(async (req, res) => {
  const bday = await userService.getAllBday();
  res.status(httpStatus.OK).send({ bday });
});

const leaveReport = catchAsync(async (req, res) => {
  const { from, to } = req.body;
  const leaveCount = await userService.leaveReport(from, to);
  res.status(httpStatus.OK).send({ users: leaveCount });
});

//for user salary

const getAllSalarySlipOfAUser = catchAsync(async (req, res) => {
  const salaries = await userService.getAllSalarySlipOfAUser(req.params);
  res.status(httpStatus.OK).send({ salaries });
});

const getSalarySlipByUserId = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.body.authorization);
  if(!userId){
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please Authenticate first!');
  }else{
    let salary = await userService.getSalarySlipByUserId(userId, req.body.selectedDate);
    if (!salary) {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, "You can't generate salary slip. Please contact to HR department");
    } else {
      const fileName = req.body.selectedDate + '_' + salary._id + '.pdf';
  
      // Initialize variables for earnings , deductions and netSalary
      let netSalary = '';
      if (salary) {
        netSalary = claculateNetSalary(salary);
        if(!netSalary){
          throw new ApiError(httpStatus.NOT_ACCEPTABLE, "You can't generate salary slip. Please contact to HR department");
        }else{
          try {
            const netSalaryInWords = convertToWords(netSalary);
            const content = fs.readFileSync(`${templatePath}/salary.ejs`).toString();
            const html = ejs.render(content, { salaryDetails: salary, net_salary: netSalary, netSalaryInWords });
      
            let options = { format: 'A4', preferCSSPageSize :true, printBackground:true, name:fileName };
            let file = { content: html };
      
            html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
              const pdf = pdfBuffer.toString('base64'); //PDF WORKS
              //res.setHeader('Content-Type', 'application/pdf');
              //res.setHeader("Content-Disposition","attachment; Abc.pdf");
              res.status(200).send(pdf);
            });
          } catch (err) {
            console.log({ err });
            res.status(httpStatus.INTERNAL_SERVER_ERROR).send(err);
          }
        }
      }
    }
  }
});

module.exports = {
  addEmployee,
  getUnCheckedEmployees,
  updateSingleUser,
  getAllEmployees,
  deleteEmployee,
  getUser,
  updateUser,
  uploadImage,
  deactivateEmployee,
  getUsersCount,
  getDeactivatedEmployees,
  getUserByToken,
  getUserLevelData,
  getAllBday,
  leaveReport,
  getAllTeamList,
  getUserTodayStatus,
  getSalarySlipByUserId,
  addEmployeeVerification,
  addEmployeeSalary,
  addEmployeePersonalDetails,
  getSalaryByUserId,
  getVerificationDetailsByUserId,
  updateUserVerificationDetails,
  updateUserSalary,
  getAllSalarySlipOfAUser,
  getUserWithLevel,
  getUserByEmpId
};
