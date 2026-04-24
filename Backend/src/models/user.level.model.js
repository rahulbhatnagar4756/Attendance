const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const userlevelSchema = new Schema(
  {

    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: "Levels",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef UserLevel
 */
const UserLevel = mongoose.model('UserLevel', userlevelSchema);

module.exports = UserLevel;