const mongoose = require('mongoose');

const rolesSchema = mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
// tokenSchema.plugin(toJSON);

/**
 * @typedef Roles
 */
const Roles = mongoose.model('Roles', rolesSchema);

module.exports = Roles;
