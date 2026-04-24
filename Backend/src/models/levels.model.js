const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const levelsSchema = new Schema(
  {
    
    level: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Levels
 */
const Levels = mongoose.model('Levels', levelsSchema);

module.exports = Levels;