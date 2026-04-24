const mongoose = require("mongoose");

const teamSchema = mongoose.Schema(
  {
    team_lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team_members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Teams
 */
const Teams = mongoose.model("Teams", teamSchema);

module.exports = Teams;
