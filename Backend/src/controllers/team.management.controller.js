const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { teamManagementService } = require("../services");

const addTeam = catchAsync(async (req, res) => {
  await teamManagementService.addTeam(req.body,req.params.leadId);
  res.status(httpStatus.CREATED).send({ message: "Added Successfully" });
});
const getTeam = catchAsync(async (req, res) => {
  const team = await teamManagementService.getTeam(req.params.leadId);
  res.status(httpStatus.OK).send(team);
});

const deleteTeam=catchAsync(async(req,res)=>{
  await teamManagementService.deleteTeam(req.body,req.params.leadId);
  res.status(httpStatus.OK).send({message:"Deleted Successfully"});
})

module.exports = {
  addTeam,
  getTeam,
  deleteTeam
};
