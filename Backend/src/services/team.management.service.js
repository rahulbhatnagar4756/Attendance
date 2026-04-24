const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Teams } = require("../models");

//addTeam
const addTeam = async (body, leadId) => {
  try {
    const checkTeamExist = await Teams.findOne({ team_lead: leadId });
    if (checkTeamExist) {
      return await Teams.updateOne(
        { team_lead: leadId },
        { $set: { team_members: body.team_members } }
      );
    } else {
      const team = await Teams({ ...body, team_lead: leadId });
      return await team.save();
    }
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, err);
  }
};

const getTeam = async (leadId) => {
  try {
    return await Teams.find({ team_lead: leadId }).populate(
      "team_members",
      "name"
    );
  } catch (err) {
    throw new ApiError(httpStatus.EXPECTATION_FAILED, err);
  }
};

const deleteTeam = async (body, lead_id) => {
  try {
    return await Teams.updateOne(
      { team_lead: lead_id },
      { $pull: { team_members: { $in: body.team_members } } },
      { multi: true }
    );
  } catch (err) {
    throw new ApiError(httpStatus.EXPECTATION_FAILED, err);
  }
};

module.exports = {
  addTeam,
  getTeam,
  deleteTeam,
};
