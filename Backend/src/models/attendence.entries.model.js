const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const breakSchema = new Schema(
  {
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const locationSchema = new Schema({
  formatted_address: {
    type: String,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
});

const attendenceEntriesSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entry_date: {
      type: Date,
    },
    check_in: {
      type: Date,
    },
    on_leave: {
      type: Boolean,
    },
    breaks: [breakSchema],
    check_out: {
      type: Date,
    },
    working_hours: {
      type: String,
    },
    work_from: {
      type: String,
      enum: ['office', 'home'],
    },
    check_in_location: {
      type: locationSchema,
    },
    // check_out_location: {
    location: {
      type: locationSchema,
    },
    user_image: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef AttendenceEntries
 */
const AttendenceEntries = mongoose.model('Attendence_Entries', attendenceEntriesSchema);

module.exports = AttendenceEntries;
