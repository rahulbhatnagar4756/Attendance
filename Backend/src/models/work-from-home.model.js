const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const wfhSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    from: {
      type: Date,
      required: true,
      trim: true,
    },
    to: {
      type: Date,
      trim: true,
    },
    wfh_reason: {
      type: String,
      required: true,
      trim: true,
    },
    reject_reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Leaves
 */
const WorkFromHome = mongoose.model('WorkFromHome', wfhSchema);

module.exports = WorkFromHome;
