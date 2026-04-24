const express = require('express');
const { auth } = require('../../middlewares/auth');
const { formsController } = require("../../controllers");
const router = express.Router();

router.route('/create-form').post(auth('createForm'),formsController.createForm);
router.route('/get-all-forms').get(auth('getAllForms'), formsController.getAllForms);
router.route('/get-form-by-id/:formId').get(auth('getFormById'), formsController.getFormById);
router.route('/create-form-template-by-userId').post(auth('createFormTemplateByUserId'),formsController.createFormTemplateByUserId);
router.route('/get-form-by-user-id/:userId').get(auth('getFormByUserId'), formsController.getFormByUserId);
router.route('/submit-user-form').patch(auth('saveFormDetails'), formsController.saveFormDetails);
router.route('/get-user-form-data-by-form-id/:formId').get(auth('getUserFormDataByFormId'), formsController.getUserFormDataByFormId);
router.route('/get-all-generated-forms').get(auth('getAllGeneratedForms'), formsController.getAllGeneratedForms);
router.route('/delete-form-by-id/:id').delete(auth('deleteFormById'), formsController.deleteFormById);
router.route('/update-form-manager-by-form-id/:id').patch(auth('updateManagerByFormId'), formsController.updateManagerByFormId);
router.route('/get-pending-relieving-form-list').get(auth('getAllPendingRelievingFormEntries'), formsController.getAllPendingRelievingFormEntries);
router.route('/update-user-relieving-form-status-by-form-id/:formId').patch(auth('updateRelievingFormStatusByManager'), formsController.updateRelievingFormStatusByManager);
router.route('/update-user-relieving-form-status-through-hr-by-form-id/:formId').patch(auth('updateRelievingFormStatusByHr'), formsController.updateRelievingFormStatusByHr);
router.route('/re-assigned-form').patch(auth('reAssignedFormToEmployee'), formsController.reAssignedFormToEmployee);

module.exports = router;