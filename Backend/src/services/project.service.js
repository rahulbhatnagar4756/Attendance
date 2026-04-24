const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Projects, ChangeRequests, Organisation } = require('../models');
const ProjectUpdates = require('../models/project.updates.model');
const ProjectSubjects = require('../models/project.subject.model');
const DailyStatuses = require('../models/daily.status.update.model');
const Subject = require('../models/subject.model');
const User = require('../models/user.model')
const rolesService = require('./roles.service');
const { taggedEmployeeTemplate } = require('../utils/email.template');
const { stripHtmlTags } = require('../utils/helpers');
const emailService = require('./email.service');
const moment = require('moment');
const Roles = require('../models/roles.model');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const addProject = async (userId, body) => {
  try {
    if (!body) throw new ApiError(httpStatus.NOT_FOUND);
    body['createdBy'] = userId;
    return await Projects.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const editProjectDetails = async (projectId, body) => {
  try {
    if (!body) throw new ApiError(httpStatus.NOT_FOUND);
    return await Projects.findByIdAndUpdate({ _id: projectId }, body);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const deleteProjectRecipients = async (projectId, deleteUser) => {
  try {
    if (!deleteUser || !projectId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User ID or Project ID not found');
    }

    const updatedProject = await Projects.findByIdAndUpdate(
      { _id: projectId },
      // { $pull: { users: deleteUser } }, // Removes the user from the users array
      { $pull: { users: { $in: deleteUser } } }, // Removes all userIds in deleteUser array from users
      { new: true } // Returns the updated document
    );

    if (!updatedProject) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Project not found or no changes made');
    }

    return updatedProject;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Internal Server Error');
  }

};

const archiveProject = async (projectId, archiveStatus) => {
  try {
    if (!projectId) throw new ApiError(httpStatus.NOT_FOUND);
    return await Projects.findByIdAndUpdate({ _id: projectId }, { archive_status: archiveStatus });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getProject = async () => {
  try {
    const projects = await Projects.find({
      $or: [
        { archive_status: 1 },
        { archive_status: { $exists: false } }
      ]
    }).populate({
      path: "users",
      select: ["profile_image"]
    });

    return projects;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getAllArchivedProject = async () => {
  try {
    const allArchivedProjects = await Projects.find({ archive_status: 0 }).populate({
      path: "users",
      select: ["profile_image"]
    });
    return allArchivedProjects;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getUserProject = async (userId) => {
  try {
    const projects = await Projects.find({
      'users': { $in: userId },
      $or: [
        { archive_status: { $exists: false } }, // Include records where archive_status doesn't exist
        { archive_status: 1 } // Include records where archive_status is 1
      ]
    }).populate({
      path: "users",
      select: ['name', 'profile_image']
    });
    return projects;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getUserProjectforAdmin = async (userId) => {
  try {
    const projects = await Projects.find({
      'users': { $in: userId }
    }).populate({
      path: "users",
      select: ['name', 'profile_image']
    });
    return projects;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getProjectDetails = async (id) => {
  try {
    if (!id) throw new ApiError(httpStatus.NOT_FOUND);
    return await Projects.findById(id);
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const projectUpdates = async (body, userId) => {
  try {
    body["user_id"] = userId;
    return await ProjectUpdates.create(body);
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const AddNewProjectSubject = async (body, userId) => {
  try {
    body["user_id"] = userId;
    const getNewlyAddedSubject = await ProjectSubjects.create(body);
    body['subject_id'] = getNewlyAddedSubject._id;
    await ProjectUpdates.create(body);
    return getNewlyAddedSubject
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getProjectUpdateDetails = async (userId) => {
  try {
    if (!userId) throw new ApiError(httpStatus.NOT_FOUND);
    return await ProjectUpdates.find({ user_id: userId }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    },
      {
        path: "subject_id"
      })
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const getProjectUpdateStatusDetails = async (projectId) => {
  try {
    if (!projectId) throw new ApiError(httpStatus.NOT_FOUND);
    return await ProjectUpdates.find({ project_id: projectId, subject: { $ne: null } }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    })
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const getProjectSubjectsByProjectId = async (projectId, userId, type, fromDate, toDate, page) => {
  try {
    if (!projectId) throw new ApiError(httpStatus.NOT_FOUND);

    let query = { project_id: projectId };

    // Apply type-specific conditions to query
    if (type === "user") {
      query.$or = [
        { "recipients": userId },
        { "user_id": userId }
      ];
    }

    // Apply date range condition to query
    if (fromDate && toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: new Date(fromDate), $lte: endDate };
    }

    // Count total documents matching query
    const totalDocuments = await ProjectSubjects.countDocuments(query);

    // Fetch all subjects matching query without pagination
    let subjects = await ProjectSubjects.find(query)
      .populate({
        path: "user_id",
        select: ["name", "profile_image"]
      })
      .populate({
        path: "subject_id",
        select: "subject"
      })
      .sort({ createdAt: -1 }); // Sort all subjects based on createdAt in descending order

    // Fetch the latest project update for each subject
    for (let subject of subjects) {
      let latestUpdate = await ProjectUpdates.findOne({ subject_id: subject._id })
        .populate({
          path: "user_id",
          select: ["name", "profile_image"]
        })
        .populate({
          path: "subject_id",
          select: "subject"
        })
        .sort({ createdAt: -1 });

      // If a latest update is found, update subject's message, createdAt, and user_id
      if (latestUpdate) {
        subject.latestUpdate = latestUpdate; // Store the latest update
        subject.message = latestUpdate.message;
        subject.createdAt = latestUpdate.createdAt;
        subject.user_id = latestUpdate.user_id;
      }
    }

    // Sort subjects based on the latest update createdAt timestamp
    subjects.sort((a, b) => {
      if (a.latestUpdate && b.latestUpdate) {
        return b.latestUpdate.createdAt - a.latestUpdate.createdAt;
      } else if (a.latestUpdate) {
        return -1;
      } else if (b.latestUpdate) {
        return 1;
      } else {
        return 0;
      }
    });

    // Paginate subjects based on the specified page and limit
    const limit = 10;
    const skip = page >= 1 ? (page - 1) * limit : 0;
    subjects = subjects.slice(skip, skip + limit);

    return { totalDocuments, subjects };
  } catch (err) {
    console.error({ err });
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const updateMessage = async (body, messageId) => {
  try {
    const empId = extractKISDataFromMessage(body.message);
    const notifieduser_names = await findUserByEmpId(empId);
    const loggedIn_Id = await findUserById(body.userId);
    if (!messageId) throw new ApiError(httpStatus.NOT_FOUND);
    const message = await DailyStatuses.findOneAndUpdate({ _id: messageId }, { $set: body })
    // Send notifications to all found users
    if (empId) {
      if (notifieduser_names && notifieduser_names.length > 0) {
        const notificationPromises = notifieduser_names.map(async notifieduser_name => {
          const Daily_Status_Request = {
            user_id: notifieduser_name._id,
            request_message: `${loggedIn_Id.name} has added status for you`,
            type: 'Status Added',
            statusSubject_id: body.subject_id,
            //  isUserSeen: true
          };
          const notification = new ChangeRequests({ ...Daily_Status_Request });
          await notification.save();
        });
        // Wait for all notifications to be sent
        await Promise.all(notificationPromises);
        if (notifieduser_names.length > 0) {
          const emailData = {
            taggedUsers: notifieduser_names,
            message: body.message,
            senderName: loggedIn_Id.name
          }
          return {
            isuserTagged: true,
            emailData
          }
        }
        // return message;
      }
    }
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const updateProjectMessage = async (body, projectMessageId, userId) => {
  try {
    const empId = extractKISDataFromMessage(body.message);
    const notifieduser_names = await findUserByEmpId(empId);
    const loggedIn_Id = await findUserById(userId);
    if (!projectMessageId) throw new ApiError(httpStatus.NOT_FOUND);
    const message = await ProjectUpdates.findOneAndUpdate({ _id: projectMessageId }, { $set: body })
    // Send notifications to all found users
    if (empId) {
      if (notifieduser_names && notifieduser_names.length > 0) {
        const notificationPromises = notifieduser_names.map(async notifieduser_name => {
          const Daily_Status_Request = {
            user_id: notifieduser_name._id,
            request_message: `${loggedIn_Id.name} has added project status for you`,
            type: 'Project Status Added',
            statusSubject_id: body.subject_id,
            project_id: body.projectId
            //  isUserSeen: true
          };
          const notification = new ChangeRequests({ ...Daily_Status_Request });
          await notification.save();
        });
        // Wait for all notifications to be sent
        await Promise.all(notificationPromises);
        // return message;
        if (notifieduser_names.length > 0) {
          const emailData = {
            taggedUsers: notifieduser_names,
            message: body.message,
            senderName: loggedIn_Id.name
          }
          return {
            isuserTagged: true,
            emailData
          }
        }
      }
    } else {
      return message;
    }
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const findUserByEmpId = async (empIds) => {
  try {
    // Split the empIds string into an array of individual IDs
    const empIdArray = empIds.split(',').map(id => id.trim());

    // Map over each empId asynchronously and find the user
    const promises = empIdArray.map(async empId => {
      return await User.findOne({ emp_id: empId });
    });

    // Execute all promises concurrently and filter out null results
    const results = (await Promise.all(promises)).filter(user => user !== null)

    // Return the results array containing user data for each empId
    return results;
  } catch (error) {
    throw new Error(`Error finding user: ${error.message}`);
  }
};
const findUserById = async (id) => {
  try {
    return User.findById(id);
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const addDailyStatus = async (body, userId, subjectId, createdBy, message) => {
  const empId = extractKISDataFromMessage(message);
  try {
    // Find all users based on empId
    const notifieduser_names = await findUserByEmpId(empId);
    const loggedIn_Id = await findUserById(userId);
    body["user_id"] = userId;

    if (subjectId) {
      body["subject_id"] = subjectId;
    } else {
      if (!body) throw new ApiError(httpStatus.NOT_FOUND);

      body['createdBy'] = body.type === "sales_status" ? createdBy : userId;
      const newSubject = await Subject.create(body);
      body["subject_id"] = newSubject._id;
    }
    // Send notifications to all found users
    if (empId) {
      if (notifieduser_names && notifieduser_names.length > 0) {
        const notificationPromises = notifieduser_names.map(async notifieduser_name => {
          const Daily_Status_Request = {
            user_id: notifieduser_name._id,
            request_message: `${loggedIn_Id.name} has added status for you`,
            type: 'Status Added',
            statusSubject_id: subjectId,
            //  isUserSeen: true
          };
          const notification = new ChangeRequests({ ...Daily_Status_Request });
          await notification.save();
        });
        // Wait for all notifications to be sent
        await Promise.all(notificationPromises);
      }
    }
    // Create daily status entry
    await DailyStatuses.create(body);
    if (notifieduser_names.length > 0) {
      const emailData = {
        taggedUsers: notifieduser_names,
        message: body.message,
        senderName: loggedIn_Id.name
      }
      return {
        isuserTagged: true,
        emailData
      }
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const sendMailToTaggedUsers = async (taggedUsers, message, senderName) => {
  try {
    if (taggedUsers.length > 0) {
      for (const user of taggedUsers) {
        if (user.email) { // Ensure email exists
          const to = user.email;
          const subject = `${senderName} has tagged you in a message`;
          const plainTextMessage = stripHtmlTags(message); // Convert HTML to plain text
          const text = taggedEmployeeTemplate(user.name, plainTextMessage); // Pass user name
          await emailService.sendEmail(to, subject, text);
        }
      }
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const extractKISDataFromMessage = (htmlString) => {
  // Decode the HTML entities
  const decodedString = htmlString
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' '); // Decode non-breaking space

  // Use a regular expression to find all KIS patterns
  const regex = /KIS\/EMP\/\d+\/\d+/gi;
  let matches = decodedString.match(regex);

  // Remove duplicates
  if (matches) {
    matches = [...new Set(matches)];
  }

  // Ensure it's returned as a comma-separated string
  return matches ? matches.join(', ') : '';
};

const addDailyStatusInProjectUpdate = async (body, userId, projectId) => {
  try {
    const empId = extractKISDataFromMessage(body.message);
    // Find all users based on empId
    const notifieduser_names = await findUserByEmpId(empId);
    const loggedIn_Id = await findUserById(userId);
    body["user_id"] = userId;
    if (!body) throw new ApiError(httpStatus.NOT_FOUND);
    if (!projectId) throw new ApiError(httpStatus.NOT_FOUND);
    else {
      const getSubject = await ProjectSubjects.findOne({ _id: body.subject_id });
      if (!getSubject) {
        throw new ApiError(httpStatus.NOT_FOUND, "No thread found for this");
      } else {
        const getAlreadyAssignedRecipient = getSubject.recipients || [];

        // Check if recipients from body already exist in getAlreadyAssignedRecipient
        const newRecipients = body.recipients.filter(recipient => !getAlreadyAssignedRecipient.includes(recipient));
        // Merge the existing recipients with the new recipients
        const updatedRecipients = [...getAlreadyAssignedRecipient, ...newRecipients];

        // Update recipients array in ProjectSubjects table
        await ProjectSubjects.findOneAndUpdate({ _id: body.subject_id }, { recipients: updatedRecipients });

        body["project_id"] = projectId;

        // Send notifications to all found users
        if (empId) {
          if (notifieduser_names && notifieduser_names.length > 0) {
            const notificationPromises = notifieduser_names.map(async notifieduser_name => {
              const Daily_Status_Request = {
                user_id: notifieduser_name._id,
                request_message: `${loggedIn_Id.name} has added project status for you`,
                type: 'Project Status Added',
                statusSubject_id: body.subject_id,
                project_id: projectId
                //  isUserSeen: true
              };
              const notification = new ChangeRequests({ ...Daily_Status_Request });
              await notification.save();
            });
            // Wait for all notifications to be sent
            await Promise.all(notificationPromises);
          }
        }
        await ProjectUpdates.create(body);
        if (notifieduser_names.length > 0) {
          const emailData = {
            taggedUsers: notifieduser_names,
            message: body.message,
            senderName: loggedIn_Id.name
          }
          return {
            isuserTagged: true,
            emailData
          }
        }
      }
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getDailyStatus = async (from, to, page) => {
  try {
    let skip = 0;
    const limit = 10;
    skip = page >= 1 ? (page - 1) * limit : skip;

    const projects = await DailyStatuses.find({
      $or: [{
        type: "daily_status",
        createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format()
        }
      }, {
        type: { $ne: "sales_status" }, createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format()
        }
      }]
    }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    }).populate({
      path: "subject_id",
      select: "subject"
    }).skip(skip)
      .limit(limit).sort({ createdAt: -1 });

    const total = await DailyStatuses.find({
      $or: [{
        type: "daily_status",
        createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format()
        }
      }, {
        type: { $ne: "sales_status" }, createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format()
        }
      }]
    }).countDocuments();
    return {
      total,
      projects,
    }
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

// 15 latest record

// const getSalesStatus = async (from, to, page) => {
//   try {
//     let skip = 0;
//     const limit = 15;
//     skip = page >= 1 ? (page - 1) * limit : skip;

//     const aggregationPipeline = [
//       {
//         $match: {
//           type: "sales_status",
//           ...(from && to
//             ? {
//               createdAt: {
//                 $gte: moment(from).startOf("day").toDate(),
//                 $lt: moment(to).endOf("day").toDate(),
//               },
//             }
//             : {}),
//         },
//       },
//       {
//         $sort: { createdAt: -1 },
//       },
//       {
//         $group: {
//           _id: "$subject_id",
//           latestRecord: { $first: "$$ROOT" },
//         },
//       },
//       {
//         $replaceRoot: { newRoot: "$latestRecord" },
//       },
//       {
//         $sort: { createdAt: -1 }, // Add this $sort stage
//       },
//       {
//         $skip: skip,
//       },
//       {
//         $limit: limit,
//       },
//     ];

//     const latestSalesStatuses = await DailyStatuses.aggregate(aggregationPipeline);

//     // Extract subject_id values for population
//     const subjectIds = latestSalesStatuses.map((status) => status.subject_id);

//     // Populate user_id and subject_id fields
//     const populatedStatuses = await DailyStatuses.populate(latestSalesStatuses, [
//       {
//         path: "user_id",
//         select: ["name", "profile_image"],
//       },
//       {
//         path: "subject_id",
//         select: "subject",
//       },
//     ]);

//     // Count total documents based on the provided date range
//     const countPipeline = [
//       {
//         $match: {
//           type: "sales_status",
//           ...(from && to
//             ? {
//               createdAt: {
//                 $gte: moment(from).startOf("day").toDate(),
//                 $lt: moment(to).endOf("day").toDate(),
//               },
//             }
//             : {}),
//         },
//       },
//       {
//         $group: {
//           _id: "$subject_id",
//         },
//       },
//       {
//         $count: "total",
//       },
//     ];

//     const [totalResult] = await DailyStatuses.aggregate(countPipeline);

//     const total = totalResult ? totalResult.total : 0;
//     return {
//       total,
//       projects: populatedStatuses,
//     };
//   } catch (error) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
//   }
// };

const getSalesStatus = async (from, to, page, subjectId, loggedInUserId) => {
  try {
    let skip = 0;
    const limit = 15;
    skip = page >= 1 ? (page - 1) * limit : skip;

    // Convert loggedInUserId to ObjectId
    const loggedInUserObjectId = mongoose.Types.ObjectId(loggedInUserId);
    const matchConditions = {
      type: "sales_status",
      ...(from && to
        ? {
            createdAt: {
              $gte: moment(from).startOf("day").toDate(),
              $lt: moment(to).endOf("day").toDate(),
            },
          }
        : {}),
      ...(loggedInUserId === "612b2be6ad492d16a25d1b04"
        ? {
            $or: [
              { recipients: { $in: [loggedInUserObjectId] } },
              { createdBy: loggedInUserObjectId },
            ],
          }
        : {}),
    };

    const aggregationPipeline = [
      {
        $match: matchConditions,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$subject_id",
          latestRecord: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$latestRecord" },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const latestSalesStatuses = await DailyStatuses.aggregate(aggregationPipeline);

    // Extract subject_id values for population
    const subjectIds = latestSalesStatuses.map((status) => status.subject_id);

    // Populate user_id and subject_id fields
    const populatedStatuses = await DailyStatuses.populate(latestSalesStatuses, [
      {
        path: "user_id",
        select: ["name", "profile_image"],
      },
      {
        path: "subject_id",
        select: "subject",
      },
    ]);

    // Count total documents based on the provided date range
    const countPipeline = [
      {
        $match: matchConditions,
      },
      {
        $group: {
          _id: "$subject_id",
        },
      },
      {
        $count: "total",
      },
    ];

    const [totalResult] = await DailyStatuses.aggregate(countPipeline);
    const total = totalResult ? totalResult.total : 0;
    return {
      total,
      projects: populatedStatuses,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getGeneralStatusById = async (userId, from, to, page, adminId) => {
  try {
    if (!userId) throw new ApiError(httpStatus.NOT_FOUND);
    let skip = 0;
    const limit = 10;
    skip = page >= 1 ? (page - 1) * limit : skip;
    const statuses = await DailyStatuses.find({
      'user_id': { $in: [userId, adminId] }, createdAt: {
        $gte: moment(from).startOf('day').format(),
        $lt: moment(to).endOf('day').format()
      }
    }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    }).populate({
      path: "subject_id",
      select: "subject"
    }).skip(skip)
      .limit(limit).sort({ createdAt: -1 });

    const total = await DailyStatuses.find({
      user_id: userId, createdAt: {
        $gte: moment(from).startOf('day').format(),
        $lt: moment(to).endOf('day').format()
      }
    }).countDocuments();
    return {
      statuses,
      total,
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const getDailyStatusById = async (userId, from, to, page) => {
  try {
    if (!userId) throw new ApiError(httpStatus.NOT_FOUND);
    let skip = 0;
    const limit = 10;
    skip = page >= 1 ? (page - 1) * limit : skip;
    let childrensId = [];
    let ids = [];
    let teamParentId = await Organisation.findOne({ parent: userId });
    // let teamMember = await Organisation.findOne({children : {$in: userId}});
    const superAdmins = await User.find({ role: "60e43f2f90254a06ecc32ca3" }).select('_id');
    const superAdminId = [superAdmins[0]._id];
    const adminSubjectIds = await Subject.find({ createdBy: superAdminId }).select("_id");
    const adminDailyStatuses = await DailyStatuses.find({
      $or: [{
        type: "daily_status",
        subject_id: { $in: adminSubjectIds }, createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format(),
        }
      }, {
        type: { $ne: "sales_status" },
        subject_id: { $in: adminSubjectIds }, createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format(),
        }
      }]
    }).sort({ createdAt: -1 }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    }).populate({
      path: "subject_id",
      select: "subject"
    });


    const parentlevel1 = await Organisation.find({ children: { $in: userId } }).select("parent");

    if (parentlevel1.length) {
      const parentlevel2 = await Organisation.find({ children: { $in: parentlevel1[0].parent } }).select("parent");
      ids = [...parentlevel1, ...parentlevel2]

      if (parentlevel2.length) {
        const parentlevel3 = await Organisation.find({ children: { $in: parentlevel2[0].parent } }).select("parent");
        ids = [...ids, ...parentlevel3]

        if (parentlevel3.length) {
          const parentlevel4 = await Organisation.find({ children: { $in: parentlevel3[0].parent } }).select("parent");
          ids = [...ids, ...parentlevel4]

          if (parentlevel4.length) {
            const parentlevel5 = await Organisation.find({ children: { $in: parentlevel4[0].parent } }).select("parent");
            ids = [...ids, ...parentlevel5]

            if (parentlevel5.length) {
              const parentlevel6 = await Organisation.find({ children: { $in: parentlevel5[0].parent } }).select("parent");
              ids = [...ids, ...parentlevel6]

            }
            if (parentlevel5.length) {
              const parentlevel6 = await Organisation.find({ children: { $in: parentlevel5[0].parent } }).select("parent");
              ids = [...ids, ...parentlevel6]

            }
          }
        }
      }
    }
    const parentIds = ids.map(d => d.parent);

    const userSubjectList = await DailyStatuses.find({
      $or: [{
        type: "daily_status",
        user_id: { $in: userId }, createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format(),
        }
      }, {
        type: { $ne: "sales_status" },
        user_id: { $in: userId }, createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format(),
        }
      }]
    }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    }).populate({
      path: "subject_id",
      select: "subject"
    }).sort({ createdAt: -1 });

    const userSubjectListId = userSubjectList.map(d => d.subject_id._id);

    const parentSubjectList = await DailyStatuses.find({
      $or: [{
        type: "daily_status",
        user_id: { $in: parentIds }, createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format(),
        }, subject_id: { $in: userSubjectListId }
      }, {
        type: { $ne: "sales_status" },
        user_id: { $in: parentIds }, createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format(),
        }, subject_id: { $in: userSubjectListId }
      }]
    }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    }).populate({
      path: "subject_id",
      select: "subject"
    }).sort({ createdAt: -1 });

    const parent = await Organisation.findOne({ parent: userId }).select("children");
    const parentSubjectListId = parentSubjectList.map(d => d.subject_id._id);

    if (teamParentId) {
      let parentLevel1 = teamParentId.children;
      childrensId = [...parentLevel1, userId];
      if (parentLevel1) {
        const parentLevel2 = await Organisation.find({ parent: { $in: parentLevel1 } }).select("children");
        for (let child of parentLevel2) {
          childrensId = [...childrensId, ...child.children];
        }
        if (childrensId) {
          const childlevel3 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel3) {
            childrensId = [...childrensId, ...child.children];
          }
        }
        if (childrensId) {
          const childlevel4 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel4) {
            childrensId = [...childrensId, ...child.children];
          }
        }
        if (childrensId) {
          const childlevel5 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel5) {
            childrensId = [...childrensId, ...child.children];
          }
        }
        if (childrensId) {
          const childlevel6 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel6) {
            childrensId = [...childrensId, ...child.children];
          }
        }
      }
    }
    else {
      childrensId = [userId]
    }

    const dailyStatus = await DailyStatuses.find({
      $or: [{
        type: "daily_status",
        user_id: { $in: childrensId }, createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format(),
        }
      },
      {
        type: { $ne: "sales_status" },
        user_id: { $in: childrensId }, createdAt: {
          $gte: moment(from).startOf('day').format(),
          $lt: moment(to).endOf('day').format(),
        }
      }]
    }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    }).populate({
      path: "subject_id",
      select: "subject"
    }).sort({ createdAt: -1 });

    let messagesData = [];

    const uniqueUserSubjectListId = [...new Map(userSubjectListId.map((m) => [m.id, m])).values()];

    const uniqueParentSubjectListId = [...new Map(parentSubjectListId.map((m) => [m.id, m])).values()];

    if (uniqueUserSubjectListId.length) {
      for (let data of uniqueUserSubjectListId) {

        const found = uniqueParentSubjectListId.find(element => element.toString() == data.toString());
        const subjectData = await DailyStatuses.find({ subject_id: found });

        if (found) {
          let messages = dailyStatus.concat(userSubjectList, parentSubjectList, adminDailyStatuses);
          messagesData = [...new Map(messages.map((m) => [m.id, m])).values()].sort(function (x, y) {
            return y.createdAt - x.createdAt;
          });
        } else {

          let messages = dailyStatus.concat(adminDailyStatuses);
          messagesData = [...new Map(messages.map((m) => [m.id, m])).values()].sort(function (x, y) {
            return y.createdAt - x.createdAt;
          });
        }
      }
    }
    else {
      let messages = dailyStatus.concat(adminDailyStatuses);
      messagesData = [...new Map(messages.map((m) => [m.id, m])).values()].sort(function (x, y) {
        return y.createdAt - x.createdAt;
      });
    }

    const childrensSubjectListId = dailyStatus.map(d => d.subject_id._id);
    for (let data of childrensSubjectListId) {
      const subjectIds = childrensSubjectListId.find(element => element.toString() === data.toString());
      const subjectData = await DailyStatuses.find({ subject_id: subjectIds, type: { $ne: "sales_status" } }).sort({ createdAt: -1 }).limit(limit).populate({
        path: "user_id",
        select: ["name", "profile_image"]
      }).populate({
        path: "subject_id",
        select: "subject"
      }).sort({ createdAt: -1 });


      let messages = dailyStatus.concat(userSubjectList, parentSubjectList, subjectData, adminDailyStatuses);
      messagesData = [...new Map(messages.map((m) => [m.id, m])).values()].sort(function (x, y) {
        return y.createdAt - x.createdAt;


      });
    }

    const total = messagesData.length;
    messages = messagesData.slice(skip, skip + limit)
    return {
      messages,
      total,
    }
  }
  catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const getProjectUpdatesById = async (userId) => {
  try {
    if (!userId) throw new ApiError(httpStatus.NOT_FOUND);
    const projectUpdates = await ProjectUpdates.find({ user_id: userId }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    });
    const projectDetails = await Projects.findOne({
      'users': { $in: userId }
    }).populate({
      path: "users",
      select: ['name', 'profile_image']
    });
    return {
      projectUpdates,
      projectDetails,
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const getSubjectDetails = async (subjectId) => {
  try {
    if (!subjectId) throw new ApiError(httpStatus.NOT_FOUND);
    const subjectRecipients = await DailyStatuses.find({ subject_id: subjectId, type: "sales_status" }).populate({
      path: "subject_id",
      select: "subject",
    }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    });

    let recipientsArray = []
    for (let subject of subjectRecipients) {
      recipientsArray = [...recipientsArray, ...subject.recipients];
    }

    const subjectDetail = await DailyStatuses.find({ subject_id: subjectId }).populate({
      path: "subject_id",
      select: "subject",
    }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    }).sort({ createdAt: -1 });
    return {
      subjectDetail,
      recipientsArray
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};


const getProjectUpdatedDetails = async (projectId, subjectId, type, userId) => {
  try {
    if (!projectId) throw new ApiError(httpStatus.NOT_FOUND);
    return await ProjectUpdates.find({ project_id: projectId, subject_id: subjectId }).populate({
      path: "project_id",
      select: "name",
    }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    }).populate({
      path: "subject_id",  // Assuming subject_id is the reference to the Subject model
      select: "subject"
    }).sort({ createdAt: -1 });
    // if(type==="admin"){
    //   return await ProjectUpdates.find({ project_id: projectId, subject_id: subjectId }).populate({
    //     path: "project_id",
    //     select: "name",
    //   }).populate({
    //     path: "user_id",
    //     select: ["name", "profile_image"]
    //   });
    // }else{
    //   return await ProjectUpdates.find({ project_id: projectId, subject_id: subjectId, $or: [
    //     { "recipients": userId },
    //     { "user_id": userId }
    //   ]  }).populate({
    //     path: "project_id",
    //     select: "name",
    //   }).populate({
    //     path: "user_id",
    //     select: ["name", "profile_image"]
    //   });
    // }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const deleteMessage = async (messageId) => {
  try {
    if (!messageId) throw new ApiError(httpStatus.NOT_FOUND);
    const getMessageDetails = await DailyStatuses.findOne({ _id: messageId });
    const getSubjectDetails = await Subject.findOne({ _id: getMessageDetails.subject_id });
    if (getSubjectDetails) {
      // Check if the message being deleted is the first occurrence of that text in Subjects
      const isFirstMessage = await DailyStatuses.findOne({ subject_id: getSubjectDetails._id }).sort({ createdAt: 1 });
      if (getMessageDetails._id.equals(isFirstMessage._id)) {
        //First Delete all messages if it's the first occurrence then just after also delete the current subject
        await DailyStatuses.deleteMany({ subject_id: getSubjectDetails._id });
        await Subject.deleteOne({ _id: getMessageDetails.subject_id });
      } else {
        // Delete only the current message if it's not the first occurrence
        await DailyStatuses.deleteOne({ _id: messageId });
      }
    } else {
      // If the subject details are not found, it means the message doesn't match any subject.
      throw new ApiError(httpStatus.NOT_FOUND)
    }
    // await DailyStatuses.deleteOne({ _id: messageId });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const deleteProjectMessage = async (projectMessageId) => {
  try {
    if (!projectMessageId) throw new ApiError(httpStatus.NOT_FOUND);
    const getMessageDetails = await ProjectUpdates.findOne({ _id: projectMessageId });
    const getSubjectDetails = await ProjectSubjects.findOne({ _id: getMessageDetails.subject_id });
    if (getSubjectDetails) {
      // Check if the message being deleted is the first occurrence of that text in ProjectSubjects
      const isFirstMessage = await ProjectUpdates.findOne({ subject_id: getSubjectDetails._id }).sort({ createdAt: 1 });
      if (getMessageDetails._id.equals(isFirstMessage._id)) {
        //First Delete all messages if it's the first occurrence then just after also delete the current subject
        await ProjectUpdates.deleteMany({ subject_id: getSubjectDetails._id });
        await ProjectSubjects.deleteOne({ _id: getMessageDetails.subject_id });
      } else {
        // Delete only the current message if it's not the first occurrence
        await ProjectUpdates.deleteOne({ _id: projectMessageId });
      }
    } else {
      // If the subject details are not found, it means the message doesn't match any subject.
      throw new ApiError(httpStatus.NOT_FOUND)
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
}

const teamProfileImages = async (userId) => {
  try {
    if (!userId) throw new ApiError(httpStatus.NOT_FOUND);
    let teamParentId = await Organisation.findOne({ parent: userId });
    let childrensId = [];
    if (teamParentId) {
      let parentLevel1 = teamParentId.children;
      childrensId = [...parentLevel1, userId];
      if (parentLevel1) {
        const parentLevel2 = await Organisation.find({ parent: { $in: parentLevel1 } }).select("children");
        for (let child of parentLevel2) {
          childrensId = [...childrensId, ...child.children];
        }
        if (childrensId) {
          const childlevel3 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel3) {
            childrensId = [...childrensId, ...child.children];
          }
        }
        if (childrensId) {
          const childlevel4 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel4) {
            childrensId = [...childrensId, ...child.children];
          }
        }
        if (childrensId) {
          const childlevel5 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel5) {
            childrensId = [...childrensId, ...child.children];
          }
        }
        if (childrensId) {
          const childlevel6 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel6) {
            childrensId = [...childrensId, ...child.children];
          }
        }
      }
    }
    else {
      childrensId = [userId]
    }

    const teamMembers = await User.find({ _id: { $in: childrensId } }).select(["profile_image"])

    return {
      teamMembers,
    }
  }
  catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
}

const getStatusDetailById = async (userId) => {
  try {
    if (!userId) throw new ApiError(httpStatus.NOT_FOUND);
    const statusDetail = await Subject.find({
      createdBy: userId, createdAt: { $gte: moment().startOf('day') }
    });
    return {
      statusDetail,
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const getSalesTeamProfileImages = async () => {
  try {
    const role = await Roles.findOne({ role: "Sales" });
    const roleId = role._id;
    const salesAdmin = await User.findOne({ role: roleId })
    const salesAdminId = salesAdmin._id;
    let teamParentId = await Organisation.findOne({ parent: salesAdminId });
    let childrensId = [];
    if (teamParentId) {
      let parentLevel1 = teamParentId.children;
      childrensId = [...parentLevel1, salesAdminId];
      if (parentLevel1) {
        const parentLevel2 = await Organisation.find({ parent: { $in: parentLevel1 } }).select("children");
        for (let child of parentLevel2) {
          childrensId = [...childrensId, ...child.children];
        }
        if (childrensId) {
          const childlevel3 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel3) {
            childrensId = [...childrensId, ...child.children];
          }
        }
        if (childrensId) {
          const childlevel4 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel4) {
            childrensId = [...childrensId, ...child.children];
          }
        }
        if (childrensId) {
          const childlevel5 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel5) {
            childrensId = [...childrensId, ...child.children];
          }
        }
        if (childrensId) {
          const childlevel6 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
          for (let child of childlevel6) {
            childrensId = [...childrensId, ...child.children];
          }
        }
      }
    }
    const teamProfileImages = await User.find({ _id: { $in: childrensId } }).select(["profile_image"])
    return {
      teamProfileImages,
    }
  }
  catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
}

const getGeneralStatusOfSingleUser = async (from, to, page, userId) => {
  try {
    if (!userId) throw new ApiError(httpStatus.NOT_FOUND);
    let skip = 0;
    const limit = 10;
    skip = page >= 1 ? (page - 1) * limit : skip;
    const statuses = await DailyStatuses.find({
      user_id: userId, createdAt: {
        $gte: moment(from).startOf('day').format(),
        $lt: moment(to).endOf('day').format()
      }
    }).populate({
      path: "user_id",
      select: ["name", "profile_image"]
    }).populate({
      path: "subject_id",
      select: "subject"
    }).skip(skip)
      .limit(limit).sort({ createdAt: -1 });

    const total = await DailyStatuses.find({
      user_id: userId, createdAt: {
        $gte: moment(from).startOf('day').format(),
        $lt: moment(to).endOf('day').format()
      }
    }).countDocuments();
    return {
      statuses,
      total,
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

// Latest 15 days records for sales updates

// const salesUpdaytesByRecipients = async (userId, from, to, page) => {
//   try {
//     if (!userId) throw new ApiError(httpStatus.NOT_FOUND);
//     let skip = 0;
//     const limit = 10;
//     skip = page >= 1 ? (page - 1) * limit : skip;

//     const Updates = await DailyStatuses.find({
//       recipients: { $in: userId }, type: "sales_status"
//     });

//     /* { all message appers with same thread or one thread in list (old backup for user)

//     // const salesUpdates = await DailyStatuses.find({
//     //   recipients: { $in: userId }, type: "sales_status", createdAt: {
//     //     $gte: moment(from).startOf('day').format(),
//     //     $lt: moment(to).endOf('day').format()
//     //   }
//     // }).populate({
//     //   path: "user_id",
//     //   select: ["name", "profile_image"]
//     // }).populate({
//     //   path: "subject_id",
//     //   select: "subject"
//     // }).skip(skip)
//     //   .limit(limit).sort({ createdAt: -1 });

//     } */


//     // one thread appears only one time with latest message in list (new changes for user)

//     const updates = await DailyStatuses.find({
//       recipients: { $in: userId },
//       type: "sales_status",
//       createdAt: {
//         $gte: moment(from).startOf('day').format(),
//         $lt: moment(to).endOf('day').format(),
//       },
//     }).populate({
//       path: "user_id",
//       select: ["name", "profile_image"]
//     }).populate({
//       path: "subject_id",
//       select: "subject"
//     }).skip(skip)
//       .limit(limit).sort({ createdAt: -1 });

//     // Use a map to keep track of unique subject_ids and their latest updates
//     const latestUpdatesMap = new Map();
//     updates.forEach((update) => {
//       const subjectId = update.subject_id.toString();
//       if (!latestUpdatesMap.has(subjectId) || update.createdAt > latestUpdatesMap.get(subjectId).createdAt) {
//         latestUpdatesMap.set(subjectId, update);
//       }
//     });

//     // Convert the map values to an array (latest updates)
//     const salesUpdates = Array.from(latestUpdatesMap.values()).slice(skip, skip + limit);

//     // end of new changes for one thread appears only one time with latest message in list 

//     const RecipientsProfileImages = await User.find({ _id: { $in: userId } }).select(["profile_image"]);
//     const total = await DailyStatuses.find({
//       recipients: { $in: userId }, type: "sales_status", createdAt: {
//         $gte: moment(from).startOf('day').format(),
//         $lt: moment(to).endOf('day').format(),
//       }
//     }).countDocuments();

//     return { Updates ,salesUpdates, total, RecipientsProfileImages}
//   }
//   catch (err) {
//     throw new ApiError(httpStatus.NOT_FOUND, err);
//   }
// }

// latest 15 records for sales updates

const salesUpdaytesByRecipients = async (userId, from, to, page) => {
  try {
    if (!userId) throw new ApiError(httpStatus.NOT_FOUND);
    let skip = 0;
    const limit = 15;
    skip = page >= 1 ? (page - 1) * limit : skip;
    const query = {
      recipients: { $in: userId },
      type: "sales_status",
      ...(from && to
        ? {
          createdAt: {
            $gte: moment(from).startOf("day").toDate(),
            $lt: moment(to).endOf("day").toDate(),
          },
        }
        : {}),
    };

    const updates = await DailyStatuses.find(query)
      .populate({
        path: "user_id",
        select: ["name", "profile_image"],
      })
      .populate({
        path: "subject_id",
        select: "subject",
      })
      .sort({ createdAt: -1 });
    const latestUpdatesMap = new Map();

    for (const update of updates) {
      const subjectId = update.subject_id.toString();
      if (!latestUpdatesMap.has(subjectId) || update.createdAt > latestUpdatesMap.get(subjectId).createdAt) {
        latestUpdatesMap.set(subjectId, update);
      }
    }

    // Convert the map values to an array (latest updates)
    const uniqueUpdates = Array.from(latestUpdatesMap.values());
    // Get the latest updates based on limit and skip
    const slicedUpdates = uniqueUpdates.slice(skip, skip + limit);
    const RecipientsProfileImages = await User.find({ _id: { $in: userId } }).select(["profile_image"]);
    const total = latestUpdatesMap.size;
    return { salesUpdates: slicedUpdates, total, RecipientsProfileImages };
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const getAllEmployeesForSalesUpdate = async (request) => {
  try {
    const roles = await rolesService.getUsersRoles();
    const role = roles.filter((r) => r.role === 'Super Admin');
    return await User.find({
      role: { $ne: role[0]._id },
      isExEmployee: { $ne: true },
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

module.exports = {
  addProject,
  getProject,
  getProjectDetails,
  projectUpdates,
  getProjectUpdateDetails,
  getUserProject,
  updateMessage,
  getDailyStatus,
  getDailyStatusById,
  addDailyStatus,
  getGeneralStatusById,
  getProjectUpdatesById,
  getUserProjectforAdmin,
  getDailyStatusById,
  getProjectUpdateStatusDetails,
  getSubjectDetails,
  deleteMessage,
  teamProfileImages,
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