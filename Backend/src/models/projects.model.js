const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const projectSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    type: {
      type: String,
      enum: ['Public', 'Private'],
      default: 'Private',
      required: true,
    },
    archive_status: {
      type: Number,
      default: 1,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);
const Projects = mongoose.model('Projects', projectSchema);
module.exports = Projects;
