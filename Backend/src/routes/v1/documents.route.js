const express = require('express');
const { auth } = require('../../middlewares/auth');
const { documentsController } = require("../../controllers");
const router = express.Router();

router.route('/get-user-documents/:userId').get(auth('getAllDocumentsByUserId'), documentsController.getUserDocuements);
router.route('/add-document').post(auth('addDocument'),documentsController.addDocument);
router.route('/get-all-documents').get(auth('getAllDocuments'),documentsController.getAllDocuments);
router.route('/delete-doc').delete(auth('deleteDocumentById'),documentsController.deleteDocumentById);
router.route('/rename-doc/:folderId').patch(auth('renameDocumentById'),documentsController.renameDocumentById);
router.route('/edit-permissions').post(auth('editDocPermissions'),documentsController.editDocPermissions);
// router.route('/get-document-details/:docId').get(auth('getAllDocuments'),documentsController.getDocuementData); // with Authentication
router.route('/get-document-details/:docId').get(documentsController.getDocuementData); // Without Authentication(Public access API)
router.route('/get-folder-details/:folderId').get(documentsController.getFolderData);
router.route('/get-file-details/:fileId').get(documentsController.getFileData);
router.route('/edit-doc-access-permission/:docId').patch(documentsController.editDocumentAccessPermission);
module.exports = router;
