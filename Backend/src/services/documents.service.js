const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Documents } = require('../models');
const { s3Upload } = require('../utils/AWS_DOCS');

const addDocument = async (body, file,userId) => {
  body['createdBy'] = userId;
  if (body.type === 'File') {
    // body['createdBy'] = userId;
    body["fileSize"] = file.path.size;
    body.permittedUsers = JSON.parse(body.permittedUsers);
  }
  try {
    if (!body) throw new ApiError(httpStatus.NOT_FOUND);
    let getImagePath;
    if (!file) {
      body;
    } else {
      const Path = {
        file: file.path,
      };
      const response = await s3Upload(Path);
      if (response) {
        getImagePath = response.Location;
      }
      body['path'] = getImagePath;
    }
    const rootFolder = await Documents.findOne();
    if(body.parentFolder!==rootFolder._id){
      body['parentFolderForUser'] = rootFolder._id
    }
    return await Documents.create(body);
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getAllDocuments = async () => {
  try {
    let allDocs = await Documents.find().populate([{
      path: 'permittedUsers.user_id',
      select: ['name', 'emp_id']
    },{
     path:'createdBy',
     select: 'name',
    }
    ]);
    allDocs = JSON.parse(JSON.stringify(allDocs));

    const formateDocs = (data, currentChild) => {
      let child = currentChild;
      child.children = [];
      const currentChildren = data.filter((item) => item.parentFolder === child._id);
      if (currentChildren.length > 0) {
        currentChildren.forEach((item) => {
          child.children.push(formateDocs(data, item));
        });
      }
      return child;
    };

    const getFomattedData = formateDocs(
      allDocs,
      allDocs.filter((childrenDoc) => {
        if (!childrenDoc.parentFolder) {
          return childrenDoc;
        }
      })
    );

    return {
      getFomattedData,
    };
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const deleteDocumentById = async (documentIds) => {
  try {
    if (!documentIds) throw new ApiError(httpStatus.NOT_FOUND);
    await Documents.deleteMany({ _id: { $in:documentIds } });
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const renameDocumentById = async (documentId, docName) => {
  try {
    if (!documentId) throw new ApiError(httpStatus.NOT_FOUND);
    await Documents.updateOne({ _id: documentId }, { $set: { name: docName } });
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const editDocPermissions = async (documentIds, permittedUsers) => {
  try {
    if (!documentIds) throw new ApiError(httpStatus.NOT_FOUND);
    // await Documents.findOneAndUpdate({ _id: id }, { $set: { permittedUsers: permittedUsers } })
    const rootFolder = await Documents.findOne();
    await Documents.findOneAndUpdate({ _id: documentIds[0] }, { parentFolderForUser: rootFolder._id })
    await Documents.updateMany({ _id: { $in:documentIds } }, { $set: { permittedUsers: permittedUsers } })
  }
  catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
}

const getAllDocumentsByUserId = async (userId) => {
  try {
    // const documentFolder = await Documents.findOne()
    // let allDocs = await Documents.find({ permittedUsers: { $elemMatch: { user_id: userId } } }).populate([{
    let allDocs = await Documents.find({$or:[{ permittedUsers: { $elemMatch: { user_id: userId } } }, {name:"Documents"}, {isPublic:true}]}).populate([{
      path: 'permittedUsers.user_id',
      select: ['name', 'emp_id']
    },{
     path:'createdBy',
     select: 'name',
    }]);

    // let allDocs = [...[documentFolder], ...userDocs];
    // console.log({allDocs});
    allDocs = JSON.parse(JSON.stringify(allDocs));

    const formateDocs =  (data, currentChild) => {
      // console.log({data}, {currentChild})
      let child = currentChild;
      child.children = [];
      const currentChildren = data.filter((item) =>{
        // console.log({item})
        if(item.parentFolder === child._id){
          return item;
        }
        // if(item.parentFolderForUser === child._id && item.parentFolder!==child._id){
        //   return item
        // }else if(item.parentFolder === child._id && item.isPublic===false){
        //   return item;
        // }
      });
      if (currentChildren.length > 0) {
        currentChildren.forEach((item) => {
          // const res = await formateDocs(data, item)
          // child.children.push(formateDocs(data, item));
          child.children.push(formateDocs(data, item));
        });
      }
      return child;
    };

    const getFomattedData = await formateDocs(
      allDocs,
      allDocs.filter((childrenDoc) => {
        if (!childrenDoc.parentFolder) {
          return childrenDoc;
        }
      })
    );
    // const result = allDocs.filter(item => item.name !== "Documents" && !allDocs.some(otherItem => item._id !== otherItem._id && item.parentFolder === otherItem._id));
    // getFomattedData[0].children.push(...result);
    return {
      getFomattedData,
    };
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getDocumentDataById = async (documentId) => {
  try {
    if (!documentId) throw new ApiError(httpStatus.NOT_FOUND);
    const documentData = await Documents.findOne({ _id: documentId });
    return documentData;
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getFolderDataById = async (folderId) => {
  try {
    if (!folderId) throw new ApiError(httpStatus.NOT_FOUND);

    // Fetch the root document
    const rootDoc = await Documents.findById(folderId).populate([
      {
        path: 'permittedUsers.user_id',
        select: ['name', 'emp_id']
      },
      {
        path: 'createdBy',
        select: 'name'
      }
    ]);

    if (!rootDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Root folder not found.');
    }else if(rootDoc.accessMode==="private"){
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authorization failed.');
    }

    // Convert Mongoose document to plain JSON
    const rootDocJSON = JSON.parse(JSON.stringify(rootDoc));

    // Recursive function to fetch children of a document
    const fetchChildren = async (parentDoc) => {
      // Fetch child documents where the parentFolder matches the current document's _id
      const childrenDocs = await Documents.find({ parentFolder: parentDoc._id }).populate([
        {
          path: 'permittedUsers.user_id',
          select: ['name', 'emp_id']
        },
        {
          path: 'createdBy',
          select: 'name'
        }
      ]);

      // If no children are found, return an empty array
      if (childrenDocs.length === 0) {
        parentDoc.children = [];
        return parentDoc;
      }

      // For each child, fetch its own children recursively
      const childPromises = childrenDocs.map(async (childDoc) => {
        const childDocJSON = JSON.parse(JSON.stringify(childDoc));
        return await fetchChildren(childDocJSON); // Recursively fetch children of each child
      });

      // Resolve all child promises and attach the resulting children to the current document
      parentDoc.children = await Promise.all(childPromises);

      return parentDoc;
    };

    // Start fetching children from the root document
    const formattedData = await fetchChildren(rootDocJSON);

    return {
      getFomattedData: formattedData
    };
  } catch (err) {
    console.log(err);
    if (err instanceof ApiError) {
      throw err;
    }
    // Otherwise, throw a generic internal server error
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message || 'An error occurred.');
  }
};

const getFileDataById = async (fileId) => {
  try {
    if (!fileId) throw new ApiError(httpStatus.NOT_FOUND);

    // Fetch the root document
    const rootDoc = await Documents.findById(fileId);

    if (!rootDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Root folder not found.');
    }else if(rootDoc.accessMode==="private"){
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authorization failed.');
    }

    return rootDoc;

  } catch (err) {
    console.log(err);
    if (err instanceof ApiError) {
      throw err;
    }
    // Otherwise, throw a generic internal server error
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message || 'An error occurred.');
  }
};

const editDocumentAccessPermission = async (documentId, accessMode) => {
  try {
    if (!documentId) throw new ApiError(httpStatus.NOT_FOUND);
    await Documents.findOneAndUpdate({ _id: documentId }, { accessMode: accessMode });
  }
  catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
}

module.exports = {
  addDocument,
  getAllDocuments,
  deleteDocumentById,
  renameDocumentById,
  editDocPermissions,
  getAllDocumentsByUserId,
  getDocumentDataById,
  getFolderDataById,
  editDocumentAccessPermission,
  getFileDataById
};
