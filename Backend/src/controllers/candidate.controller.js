const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { candidateService } = require("../services")


const addCandidate = catchAsync(async (req, res) => {
    const result = await candidateService.addCandidate(req.body);
    res.status(httpStatus.OK).send({ result });
});

const getAllCandidate = catchAsync(async (req, res) => {
    const result = await candidateService.getAllCandidate(req.query);
    res.status(httpStatus.OK).send({ result });
});

const addCategory = catchAsync(async (req, res) => {
    const result = await candidateService.addCategory(req.body);
    res.status(httpStatus.OK).send({ result });
});

const getCategory = catchAsync(async (req, res) => {
    const result = await candidateService.getCategory();
    res.status(httpStatus.OK).send({ result });
});

const getCandidateDetails = catchAsync(async (req, res) => {
    const result = await candidateService.getCandidateDetails(req.params.candidateId);
    res.status(httpStatus.OK).send({ result });
});

const deleteCandidate = catchAsync(async (req, res) => {
    await candidateService.deleteCandidate(req.params.candidateId);
    res.status(httpStatus.OK).send({ message: "Deleted Successfully" });
})

const updateCandidate = catchAsync(async (req, res) => { 
    const result = await candidateService.updateCandidate(req.body, req.params.candidateId);
    res.status(httpStatus.OK).send({ result });
});

const addResult = catchAsync(async (req, res) => {
    const result = await candidateService.addResult(req.body);
    res.status(httpStatus.OK).send({ result });
});

const getResult = catchAsync(async (req, res) => {
    const result = await candidateService.getResult();
    res.status(httpStatus.OK).send({ result });
});



module.exports = {
    addCandidate,
    getAllCandidate,
    addCategory,
    getCategory,
    getCandidateDetails,
    deleteCandidate,
    updateCandidate,
    getResult,
    addResult,
};