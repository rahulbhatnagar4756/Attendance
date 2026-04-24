const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { documentsService } = require('../services');
const { getUserIdToken } = require('../middlewares/auth');

const addDocument = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const result = await documentsService.addDocument(req.body, req.files, userId);
  res.status(httpStatus.OK).send({ result });
});

const getAllDocuments = catchAsync(async (req, res) => {
  const result = await documentsService.getAllDocuments();
  res.status(httpStatus.OK).send({ result });
});

const deleteDocumentById = catchAsync(async (req, res) => {
  const docIds = req.body;
  const result = await documentsService.deleteDocumentById(docIds);
  res.status(httpStatus.OK).send({ result });
});

const renameDocumentById = catchAsync(async (req, res) => {
  const { folderId } = req.params;
  const { docName } = req.body;
  const result = await documentsService.renameDocumentById(folderId, docName);
  res.status(httpStatus.OK).send({ result });
});

const editDocPermissions = catchAsync(async (req, res) => {
  const { permittedUsers, documentIds } = req.body;
  const result = await documentsService.editDocPermissions(documentIds, permittedUsers);
  res.status(httpStatus.OK).send({ result });
});

const getUserDocuements = catchAsync(async (req, res) => {
  const userId = await getUserIdToken(req.headers['authorization']);
  const result = await documentsService.getAllDocumentsByUserId(userId);
  res.status(httpStatus.OK).send({ result });
});

const getDocuementData = catchAsync(async (req, res) => {
  const { docId } = req.params;
  const result = await documentsService.getDocumentDataById(docId);
  res.status(httpStatus.OK).send({ result });
});

const getFolderData = catchAsync(async (req, res) => {
  const { folderId } = req.params;
  const result = await documentsService.getFolderDataById(folderId);
  res.status(httpStatus.OK).send({ result });
});

const getFileData = catchAsync(async (req, res) => {
  const { fileId } = req.params;
  const result = await documentsService.getFileDataById(fileId);
  res.status(httpStatus.OK).send({ result });
});

const editDocumentAccessPermission = catchAsync(async (req, res) => {
  const { docId } = req.params;
  const { accessMode } = req.body;
  const result = await documentsService.editDocumentAccessPermission(docId, accessMode);
  res.status(httpStatus.OK).send({ result });
});

module.exports = {
  addDocument,
  getAllDocuments,
  deleteDocumentById,
  renameDocumentById,
  editDocPermissions,
  getUserDocuements,
  getDocuementData,
  getFolderData,
  editDocumentAccessPermission,
  getFileData
};
