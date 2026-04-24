const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Forms } = require('../models');
const { UserFormTemplate } = require('../models');
const { RelivingFormApprovalRequest, User } = require('../models');

const createForm = async (body) => {
  try {
    if (!body) throw new ApiError(httpStatus.NOT_FOUND);
    return await Forms.create(body);
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getAllForms = async () => {
  try {
    const allForms = await Forms.find({});
    return {
      allForms,
    };
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const createFormTemplateByUserId = async (body) => {
  try {
    if (!body) throw new ApiError(httpStatus.NOT_FOUND);
    let entries = [];
    const templateData = body.template[0];
    for (let user of body.users) {
      let templateDataCopy = JSON.parse(JSON.stringify(templateData))
      templateDataCopy.jsonFormData.map((item)=>{
        if(item.key==='name'){
          item.defaultValue = user.name;
          item.disabled = true;
        }
        if(item.key==='employeeId'){
          item.defaultValue = user.empId;
          item.disabled = true;
        }
        if(item.key==='designation'){
          item.defaultValue = user.designation;
          item.disabled = true;
        }
        // if(item.key==='dateOfJoining'){
        //   item.defaultValue = user.dateOfJoinning;
        //   item.disabled = true;
        // }
      });
      let bodyData = {
        formId: templateDataCopy._id,
        formName: templateDataCopy.formName,
        userId: user.user_id,
        formJson: templateDataCopy.jsonFormData,
        formDescription: templateDataCopy.formDescription,
      };
      entries.push(bodyData);
    }
    // return await UserFormTemplate.create(body);
    return await UserFormTemplate.insertMany(entries);
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getFormByUserId = async (userId) => {
  try {
    const formByUserId = await UserFormTemplate.find({ userId: userId, is_submitted: false });
    return {
      formByUserId,
    };
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getUserFormDataByFormId = async (formId) => {
  try {
    const userDetails = await UserFormTemplate.findOne({ _id: formId }).select({ _id: 0, submitDetails: 1, formName: 1 });
    return {
      userDetails,
    };
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getAllGeneratedForms = async (filterValue, alphaTerm) => {
  try {
    let generatedForms = [];
    if (filterValue === '' && alphaTerm === '') {
      generatedForms = await UserFormTemplate.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'approveRelievingFormManagerId',
            foreignField: '_id',
            as: 'managerId',
          },
        },
      ]).sort({ createdAt: -1 });
    } else {
      const query = [];
      if (alphaTerm != '') {
        query.push({
          'userId.name': { $regex: '^' + alphaTerm.toLowerCase(), $options: 'i' },
        });
      }
      if (filterValue) {
        query.push({
          formId: filterValue,
        });
      }
      generatedForms = await UserFormTemplate.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'approveRelievingFormManagerId',
            foreignField: '_id',
            as: 'managerId',
          },
        },
        {
          $match: {
            $and: query,
          },
        },
      ]).sort({ createdAt: -1 });
    }
    let allGeneratedForms = [];
    generatedForms.map((item) => {
      if (item.userId.length > 0) {
        allGeneratedForms.push(item);
      }
    });
    return {
      allGeneratedForms,
    };
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const deleteFormById = async (id) => {
  try {
    await RelivingFormApprovalRequest.findOneAndRemove({formId:id});
    return await UserFormTemplate.findOneAndRemove({ _id: id });
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getFormById = async (formId) => {
  try {
    const allForms = await Forms.find({ _id: formId });
    return {
      allForms,
    };
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const saveFormDetails = async (body, formDocId) => {
  try {
    const getJsonForm = await UserFormTemplate.findOne({ _id: formDocId }).select({ formJson: 1, _id: 0 });
    let arr = [];
    let subArray = [];
    for (let key in body.data) {
      if (key === 'submit') {
        continue;
      }
      getJsonForm.formJson.map((item) => {
        if (typeof body.data[key] === 'object' && key === item.key) {
          for (let subKey in body.data[key]) {
            if (item.questions.length > 0) {
              for (let val of item.questions) {
                if (subKey === val.value) {
                  subArray.push({ key: subKey, Question: val.label, Answer: body.data[key][subKey] });
                }
              }
            }
          }
          arr.push({ key: key, Question: item.label, subQuestions: subArray });
          subArray = [];
        } else if (typeof body.data[key] === 'string') {
          if (key === item.key) {
            arr.push({ key: key, Question: item.label, Answer: body.data[key] });
          }
        }
      });
    }
    const isAlreadySubmitted = await UserFormTemplate.findOne({_id:formDocId});
    if(isAlreadySubmitted.is_submitted){
      throw new ApiError(httpStatus.ALREADY_REPORTED, "Already Submitted");
    }else{
      return await UserFormTemplate.findOneAndUpdate(
        { _id: formDocId },
        { submitDetails: arr, is_submitted: true },
        { useFindAndModify: false }
      );
    }
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const findUserById = async (id) => {
  try {
    return User.findById(id);
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const updateManagerByFormId = async (formId, managerId) => {
  try {
    const manager = await findUserById(managerId);
    const findRejectedRecord = await UserFormTemplate.findOne({_id:formId});
    if(findRejectedRecord.managerApproval==="Rejected" && findRejectedRecord.hrApproval==="Pending"){
        await UserFormTemplate.findByIdAndUpdate({ _id: formId }, {approveRelievingFormManagerId:managerId,managerApproval:"Pending" });
    }else{
      await UserFormTemplate.findByIdAndUpdate({ _id: formId }, {approveRelievingFormManagerId:managerId});
    }
    const approveRequest = {
      managerId: managerId,
      formId:formId,
      requestMessage: `${manager.name} has a relieving form approval request`,
    };
    // const notification = await RelivingFormApprovalRequest({ ...approveRequest });
    // notification.save();
    const result = await RelivingFormApprovalRequest.findOne({formId:formId});
    if(result){
      await RelivingFormApprovalRequest.findOneAndUpdate({formId:formId}, {managerId:approveRequest.managerId, requestMessage:approveRequest.requestMessage});
    }else{
      await RelivingFormApprovalRequest.create(approveRequest);
    }
    return;
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};


const getAllPendingRelievingFormEntries = async (userId) => {
  try {
    const getPendingRelievingFormList = await UserFormTemplate.find({
      managerApproval: 'Pending',
      is_submitted: true,
      approveRelievingFormManagerId:userId,
    }).populate({
      path: 'userId',
      select: 'name',
    }).sort({updatedAt:-1});
    return {
      getPendingRelievingFormList,
    };
   
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error);
  }
};

const updateRelievingFormStatusByManager = async (formId, managerResponse) => {
  try {
    return await UserFormTemplate.findByIdAndUpdate({ _id: formId }, {managerApproval:managerResponse});
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const updateRelievingFormStatusByHr = async (formId, hrResponse) => {
  try {
    return await UserFormTemplate.findByIdAndUpdate({ _id: formId }, {hrApproval:hrResponse});
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const reAssignedFormToEmployee = async (formId, formName) => {
  try {
    if(formName === "Feedback Form"){
      return await UserFormTemplate.findByIdAndUpdate({ _id: formId }, {is_submitted:false});
    }
    else{
      return await UserFormTemplate.findByIdAndUpdate({ _id: formId }, {is_submitted:false, managerApproval:"Pending", hrApproval:"Pending"});
    }
  } catch (err) {
    console.log(err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

module.exports = {
  createForm,
  getAllForms,
  createFormTemplateByUserId,
  getFormByUserId,
  saveFormDetails,
  getUserFormDataByFormId,
  getAllGeneratedForms,
  deleteFormById,
  getFormById,
  updateManagerByFormId,
  getAllPendingRelievingFormEntries,
  updateRelievingFormStatusByManager,
  updateRelievingFormStatusByHr,
  reAssignedFormToEmployee
};
