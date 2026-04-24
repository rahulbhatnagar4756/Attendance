const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Categories, Candidates, ResultStatus } = require('../models');
const rolesService = require('./roles.service');

const addCategory = async (body) => {
  try {
    if (!body) throw new ApiError(httpStatus.NOT_FOUND);
    return await Categories.create(body);
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getCategory = async () => {
  try {
    const categoryData = await Categories.find();
    return categoryData;
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const addCandidate = async (body) => {
  try {
    if (!body) throw new ApiError(httpStatus.NOT_FOUND);
    const findEmail = await Candidates.findOne({ email: body.email });
    if (findEmail) {
      throw new ApiError(httpStatus.OK, 'Email already exist!');
    }
    const findPhone = await Candidates.findOne({ phone: body.phone });
    if (findPhone) {
      throw new ApiError(httpStatus.OK, 'Phone Number already exist!');
    }
    return await Candidates.create(body);
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getAllCandidate = async (request) => {
  try {
    const { page, alphaTerm, searchText, categoryList, sort, columnName } = request;
    let skip = 0;
    const limit = 10;
    skip = page >= 1 ? (page - 1) * limit : skip;
    const sortOptions = {};
         switch (columnName) {
      case 'createdAt':
        sortOptions.createdAt = sort === 'asc' ? 1 : -1;
        break;
      case 'updatedAt':
        sortOptions.updatedAt = sort === 'asc' ? 1 : -1;
        break;
         default:
        sortOptions.createdAt = -1; 
        break;
    }
      if (!columnName || !sort || columnName === undefined || sort === undefined || sort === null || columnName === null) {
        sortOptions.createdAt = -1;
      }
    const totalItems = await Candidates.countDocuments();
    const totalCategoryItems = await Candidates.countDocuments({ category: { $in: categoryList } });
    let requests = [];
    let searchByInitial = alphaTerm ? alphaTerm.toLowerCase() : '';
    let searchByText = searchText ? searchText.toLowerCase() : '';
    if (request.alphaTerm || request.searchText || categoryList) {
      requests = await Candidates.find({
        $and: [{ category: { $eq: categoryList } }, { candidate_name: { $regex: '^' + searchByInitial, $options: 'i' } }, { candidate_name: { $regex: searchByText, $options: 'i' } }],

      })
      .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('category')
        .populate('technical_round')
        .populate('manager_round')
        .populate('final_round')
        .populate('aptitude_round');
    } else {
      requests = await Candidates.find()
      .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('category')
        .populate('technical_round')
        .populate('manager_round')
        .populate('final_round')
        .populate('aptitude_round');
    }
    return {
      totalItems,
      totalCategoryItems,
      data: requests,
    };
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getCandidateDetails = async (id) => {
  try {
    if (!id) throw new ApiError(httpStatus.NOT_FOUND);
    return Candidates.findById(id);
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const deleteCandidate = async (id) => {
  try {
    if (!id) throw new ApiError(httpStatus.NOT_FOUND);
    await Candidates.deleteOne({ _id: id });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, err);
  }
};

const updateCandidate = async (updateBody, candidateId) => {
  try {
    if (!candidateId) throw new ApiError(httpStatus.NOT_FOUND);
    const candidateData = await Candidates.updateOne({ _id: candidateId }, { $set: updateBody })
    return candidateData;
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const addResult = async (body) => {
  try {
    if (!body) throw new ApiError(httpStatus.NOT_FOUND);
    return await ResultStatus.create(body);
  } catch {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

const getResult = async () => {
  try {
    return await ResultStatus.find();
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
};

module.exports = {
  addCategory,
  getCategory,
  addCandidate,
  getAllCandidate,
  getCandidateDetails,
  deleteCandidate,
  updateCandidate,
  addResult,
  getResult,
};
