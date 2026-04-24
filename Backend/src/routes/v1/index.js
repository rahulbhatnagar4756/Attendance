const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const attendenceRoute = require('./attendence.route');
const importantDatesRoute = require('./important.dates.route');
const requestChangesRoute = require('./request.changes.route');
const rolesRoute = require('./roles.route');
const leavesRoute = require('./leaves.route');
const workFromHomeRoute = require('./work.from.home.route');
const thoughtRoute = require('./thought.route');
const teamRoute = require('./team.management.route');
const adminRoute = require('./admin.route');
const candidateRoute = require("./candidate.route");
const projectRoute = require("./project.route");
const documentsRoute = require("./documents.route");
const formRoutes = require("./forms.route")
const router = express.Router();

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/docs', docsRoute); 
router.use('/attendence', attendenceRoute);
router.use('/important-dates', importantDatesRoute);
router.use('/request-changes', requestChangesRoute);
router.use('/roles', rolesRoute);
router.use('/leaves', leavesRoute);
router.use('/work-from-home', workFromHomeRoute);
router.use('/thought', thoughtRoute);
router.use('/team-management', teamRoute);
router.use('/admin', adminRoute);
router.use('/candidate', candidateRoute);
router.use('/project', projectRoute);
router.use('/documents',documentsRoute);
router.use('/forms',formRoutes);

module.exports = router;
