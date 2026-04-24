const mongoose = require('mongoose');

const importantDatesSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      trim: true,
    },
    event: {
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
 * @typedef ImportantDates
 */
const ImportantDates = mongoose.model('Important_Dates', importantDatesSchema);

module.exports = ImportantDates;
