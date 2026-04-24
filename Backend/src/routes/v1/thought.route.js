const express = require('express');
const validate = require('../../middlewares/validate');

const { auth } = require('../../middlewares/auth');
const { thoughtController } = require('../../controllers');
const { userValidation } = require('../../validations');

const router = express.Router();

router.route('/add-thought').post(auth('addThought'), thoughtController.addThought);
router.route('/list-thought').get(auth('listThought'), thoughtController.listThought);
router.route('/get-today-thought').get(auth('getTodayThought'), thoughtController.getTodayThought);
router.route('/get-edit-thought/:id').get(auth('getThought'), thoughtController.getEditThought);
router.route('/post-edit-thought/:id').post(auth('postThought'), thoughtController.postEditThought);
router.route('/delete-thought/').delete( thoughtController.deleteThought);

module.exports = router;