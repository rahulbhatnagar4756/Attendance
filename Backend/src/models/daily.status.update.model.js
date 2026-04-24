const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const dailyStatusSchema = new Schema({

  subject_id: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,

  },
  message: {
    type: String,
    required: true,

  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['daily_status', 'sales_status'],
    default: 'daily_status',
  },
  recipients: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  channel: {
    type: String,
  },
  clientLocation: {
    type: String,
  },
},
  {
    timestamps: true,
  }
);
const DailyStatuses = mongoose.model('Daily_Statuses', dailyStatusSchema);
module.exports = DailyStatuses;