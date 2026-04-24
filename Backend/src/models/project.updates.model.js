const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const projectUpdateSchema = new Schema(
  {
    project_id: {
      type: Schema.Types.ObjectId,
      ref: 'Projects',
    },
    subject_id: {
      type: Schema.Types.ObjectId,
      ref: 'ProjectSubjects',
      required: true,
    },
    message: {
      type: String,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);
const ProjectUpdates = mongoose.model('Project_Update', projectUpdateSchema);
module.exports = ProjectUpdates;
