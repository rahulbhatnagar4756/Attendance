const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { formsService } = require("../services");
const { getUserIdToken } = require('../middlewares/auth');

const createForm = catchAsync(async (req, res) => {
  const response = await formsService.createForm(req.body);
  res.status(httpStatus.OK).send({ response });
});

const getAllForms = catchAsync(async (req, res) => {
  const response = await formsService.getAllForms();
  res.status(httpStatus.OK).send({ response });
});

const createFormTemplateByUserId = catchAsync(async (req, res) => {
  const response = await formsService.createFormTemplateByUserId(req.body);
  res.status(httpStatus.OK).send({ response });
});

const getFormByUserId = catchAsync(async (req, res) => {
  const response = await formsService.getFormByUserId(req.params.userId);
  res.status(httpStatus.OK).send({ response });
});

const saveFormDetails = catchAsync(async (req, res) => {
  const { formDocId } = req.query;
  const response = await formsService.saveFormDetails(req.body, formDocId );
  res.status(httpStatus.OK).send({ response });
});

const getUserFormDataByFormId = catchAsync(async (req, res) => {
  const response = await formsService.getUserFormDataByFormId(req.params.formId);
  res.status(httpStatus.OK).send({ response });
});

const getAllGeneratedForms = catchAsync(async (req, res) => {
  const { filter, alphaTerm } = req.query;
  const response = await formsService.getAllGeneratedForms(filter, alphaTerm);
  res.status(httpStatus.OK).send({ response });
});

const deleteFormById = catchAsync(async (req, res) => {
  const { id } = req.params
  const response = await formsService.deleteFormById(id);
  res.status(httpStatus.OK).send({ response });
});

const getFormById = catchAsync(async (req, res) => {
  const response = await formsService.getFormById(req.params.formId);
  res.status(httpStatus.OK).send({ response });
});

const updateManagerByFormId = catchAsync(async (req, res) => {
  const response = await formsService.updateManagerByFormId(req.params.id, req.query.managerId);
  res.status(httpStatus.OK).send({ response });
});

const getAllPendingRelievingFormEntries = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const leaves = await formsService.getAllPendingRelievingFormEntries(userId);
  res.status(httpStatus.OK).send({ leaves });
});

const updateRelievingFormStatusByManager = catchAsync(async (req, res) => {
  const response = await formsService.updateRelievingFormStatusByManager(req.params.formId, req.body.managerApproval);
  res.status(httpStatus.OK).send({ response });
});

const updateRelievingFormStatusByHr = catchAsync(async (req, res) => {
  const response = await formsService.updateRelievingFormStatusByHr(req.params.formId, req.body.hrResponse);
  res.status(httpStatus.OK).send({ response });
});

const reAssignedFormToEmployee = catchAsync(async (req, res) => {
  const { formId, formName} = req.body.data;
  const response = await formsService.reAssignedFormToEmployee(formId, formName);
  res.status(httpStatus.OK).send({ response });
});

module.exports = {
  createForm,
  getAllForms,
  createFormTemplateByUserId,
  getFormByUserId,
  saveFormDetails,
  getUserFormDataByFormId,
  getAllGeneratedForms,
  deleteFormById,
  getFormById,
  updateManagerByFormId,
  getAllPendingRelievingFormEntries,
  updateRelievingFormStatusByManager,
  updateRelievingFormStatusByHr,
  reAssignedFormToEmployee
};