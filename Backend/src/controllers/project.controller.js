const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { projectService, userService } = require("../services")
const { getUserIdToken } = require('../middlewares/auth');

const addProject = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.addProject(userId, req.body);
    res.status(httpStatus.OK).send({ result });
});

const editProjectDetails = catchAsync(async (req, res) => {
    const { projectId } = req.params;
    const result = await projectService.editProjectDetails(projectId, req.body);
    res.status(httpStatus.OK).send({ result });
});

const deleteProjectRecipients = catchAsync(async (req, res) => {
    const { projectId } = req.params;
    const { deleteUser } = req.body;
    const result = await projectService.deleteProjectRecipients(projectId, deleteUser);
    res.status(httpStatus.OK).send({ result });
});

const archiveProject = catchAsync(async (req, res) => {
    const { projectId } = req.params;
    const { archiveStatus } = req.body;
    const result = await projectService.archiveProject(projectId, archiveStatus);
    res.status(httpStatus.OK).send({ result });
});

const getUserProject = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.getUserProject(userId);
    res.status(httpStatus.OK).send({ result });
});

const getUserProjectforAdmin = catchAsync(async (req, res) => {
    const result = await projectService.getUserProjectforAdmin(req.params.userId);
    res.status(httpStatus.OK).send({ result });
});

const getProject = catchAsync(async (req, res) => {
    const result = await projectService.getProject();
    res.status(httpStatus.OK).send({ result });
});

const getAllArchivedProject = catchAsync(async (req, res) => {
    const result = await projectService.getAllArchivedProject();
    res.status(httpStatus.OK).send({ result });
});

const getProjectDetails = catchAsync(async (req, res) => {
    const result = await projectService.getProjectDetails(req.params.projectId);
    res.status(httpStatus.OK).send({ result });
});

const projectUpdates = catchAsync(async (req, res) => { 
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.projectUpdates(req.body,userId);
    res.status(httpStatus.OK).send({ result });
});

const AddNewProjectSubject = catchAsync(async (req, res) => { 
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.AddNewProjectSubject(req.body, userId);
    res.status(httpStatus.OK).send({ result });
});

const getProjectUpdateDetails = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.getProjectUpdateDetails(userId);
    res.status(httpStatus.OK).send({ result });
});

const getProjectUpdateStatusDetails = catchAsync(async (req, res) => {
    const result = await projectService.getProjectUpdateStatusDetails(req.query.projectId,req.query.from,req.query.to,req.query.page);
    res.status(httpStatus.OK).send({ result });
});

const getProjectSubjectsByProjectId = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.getProjectSubjectsByProjectId(req.query.projectId, userId, req.query.type, req.query.from,req.query.to, req.query.page);
    res.status(httpStatus.OK).send({ result });
});

const updateMessage = catchAsync(async (req, res) => { 
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.updateMessage(req.body, req.params.messageId, userId);
    res.status(httpStatus.OK).send({ result });
});

const updateProjectMessage = catchAsync(async (req, res) => { 
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.updateProjectMessage(req.body, req.params.projectMessageId, userId);
    res.status(httpStatus.OK).send({ result });
});

const getDailyStatus = catchAsync(async (req, res) => {
    const result = await projectService.getDailyStatus(req.query.from,req.query.to,req.query.page,req.query.subjectId);
    res.status(httpStatus.OK).send({ result });
});

const getSalesStatus = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.getSalesStatus(req.query.from,req.query.to,req.query.page,req.query.subjectId, userId);
    res.status(httpStatus.OK).send({ result });
});

const addDailyStatus = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.addDailyStatus(req.body,userId, req.query.subjectId, req.body.createdBy,req.body.message);
    res.status(httpStatus.OK).send({ result });
});

const addDailyStatusInProjectUpdate = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.addDailyStatusInProjectUpdate(req.body, userId, req.query.projectId);
    res.status(httpStatus.OK).send({ result });
});

const sendMailToTaggedUsers = catchAsync(async (req, res) => {
    const {taggedUsers, message, senderName} = req.body;
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.sendMailToTaggedUsers(taggedUsers, message, senderName);
    res.status(httpStatus.OK).send({ result });
});

const getDailyStatusById = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.getDailyStatusById(userId,req.query.from,req.query.to,req.query.page);
    res.status(httpStatus.OK).send({ result });
});

const getGeneralStatusById = catchAsync(async (req, res) => {
    const adminId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.getGeneralStatusById(req.query.userId,req.query.from,req.query.to,req.query.page,adminId);
    res.status(httpStatus.OK).send({ result });
});

const getGeneralStatusOfSingleUser = catchAsync(async (req, res) => {
    const result = await projectService.getGeneralStatusOfSingleUser(req.query.from,req.query.to,req.query.page,req.params.userId);
    res.status(httpStatus.OK).send({ result });
});

const getProjectUpdatesById = catchAsync(async (req, res) => {
    const result = await projectService.getProjectUpdatesById(req.params.userId);
    res.status(httpStatus.OK).send({ result });
});

const getSubjectDetails = catchAsync(async (req, res) => {
    const result = await projectService.getSubjectDetails(req.params.subjectId);
    res.status(httpStatus.OK).send({ result });
});

const getProjectUpdatedDetails = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.getProjectUpdatedDetails(req.params.projectId, req.query.subjectId, req.query.type, userId);
    res.status(httpStatus.OK).send({ result });
});

const deleteMessage = catchAsync(async (req, res) => {
    const result = await projectService.deleteMessage(req.params.messageId);
    res.status(httpStatus.OK).send({ result });
});

const deleteProjectMessage = catchAsync(async (req, res) => {
    const result = await projectService.deleteProjectMessage(req.params.projectMessageId);
    res.status(httpStatus.OK).send({ result });
});

const getTeamProfileImages = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.teamProfileImages(userId);
    res.status(httpStatus.OK).send({ result });
});

const getSalesTeamProfileImages = catchAsync(async (req, res) => {
    const result = await projectService.getSalesTeamProfileImages();
    res.status(httpStatus.OK).send({ result });
});

const getStatusDetailById = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.getStatusDetailById(userId);
    res.status(httpStatus.OK).send({ result });
});

const salesUpdaytesByRecipients = catchAsync(async (req, res) => {
    const userId = await getUserIdToken(req.headers['authorization']);
    const result = await projectService.salesUpdaytesByRecipients(userId,req.query.from,req.query.to,req.query.page);
    res.status(httpStatus.OK).send( result );
});

const getAllEmployeesForSalesUpdate = catchAsync(async (req, res) => {
    const result = await projectService.getAllEmployeesForSalesUpdate();
    res.status(httpStatus.OK).send({ result });
  });

module.exports = {
    addProject,
    getProject,
    getProjectDetails,
    projectUpdates,
    getProjectUpdateDetails,
    getUserProject,
    updateMessage,
    getDailyStatus,
    addDailyStatus,
    getGeneralStatusById,
    getProjectUpdatesById,
    getUserProjectforAdmin,
    getDailyStatusById,
    getProjectUpdateStatusDetails,
    getSubjectDetails,
    deleteMessage,
    getTeamProfileImages,
    getStatusDetailById,
    getSalesTeamProfileImages,
    getSalesStatus,
    getGeneralStatusOfSingleUser,
    salesUpdaytesByRecipients,
    getAllEmployeesForSalesUpdate,
    addDailyStatusInProjectUpdate,
    getProjectUpdatedDetails,
    deleteProjectMessage,
    updateProjectMessage,
    AddNewProjectSubject,
    getProjectSubjectsByProjectId,
    editProjectDetails,
    deleteProjectRecipients,
    archiveProject,
    getAllArchivedProject,
    sendMailToTaggedUsers
}