const express = require('express');
const validate = require('../../middlewares/validate');
const { auth } = require('../../middlewares/auth');
const { candidateController } = require("../../controllers");
const { candidateValidation } = require('../../validations');
const router = express.Router();


router.route('/get-candidate').get(auth('getAllCandidate'), candidateController.getAllCandidate);

router.route('/add-candidate').post(auth('addCandidate'),validate(candidateValidation.addCandidate), candidateController.addCandidate);

router.route('/get-category').get(auth('getCategory'), candidateController.getCategory);

router.route('/add-category').post(auth('addCategory'), candidateController.addCategory);

router.route('/get-candidate-detail/:candidateId').get(auth('getCandidateDetails'),candidateController.getCandidateDetails);

router.route('/delete-candidate/:candidateId').delete(auth('deleteCandidate'), candidateController.deleteCandidate);

router.route('/update-candidate/:candidateId').put(auth('updateCandidate'),candidateController.updateCandidate);

router.route('/add-result-status').post(auth('addResult'), candidateController.addResult);

router.route('/get-result-status').get(auth('getResult'), candidateController.getResult);


module.exports = router;