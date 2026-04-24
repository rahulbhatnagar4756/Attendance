const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const leavesSchema = new Schema(
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
    leave_reason: {
      type: String,
      // required: true,
      trim: true,
    },
    reject_reason: {
      type: String,
      trim: true,
    },
    start_time: {
      type: String,
      trim: true,
    },
    end_time: {
      type: String,
      trim: true,
    },
    comp_off_date: {
      type: Date,
      trim: true,
    },
    duration: {
      type: String,
      enum: ['Short Day', 'Half Day', 'Full Day'],
      required: true,
    },
    type: {
      type: String,
      enum: ['Sick Leave', 'Leave', 'Comp Off', 'Maternity Leave', 'N/A'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'absent'],
      default: 'pending',
    },
    last_pending_leaves: {
      type: Number,
      trim: true,
    },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    file_name:{
      type: String,
      trim: true
    },
    path: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Leaves
 */
const Leaves = mongoose.model('Leaves', leavesSchema);

module.exports = Leaves;
