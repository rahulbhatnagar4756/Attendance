const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const organisationSchema = new Schema(
  {
    parent:
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },
    children: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Organisation
 */
const Organisation = mongoose.model('Organisation', organisationSchema);

module.exports = Organisation;
