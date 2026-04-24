const express = require('express');
const {rolesController}=require('../../controllers')

const router = express.Router();

router.get("/get", rolesController.getAdminRoles)
router.get("/get-user-role", rolesController.getUserRoles)

module.exports = router;
