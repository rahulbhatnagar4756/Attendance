const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const projectSubjectSchema = new Schema(
  {
    project_id: {
      type: Schema.Types.ObjectId,
      ref: 'Projects',
    },
    subject: {
      type: String,
      require: true,
    },
    message: {
      type: String,
      require: true,
    },
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);
const ProjectSubjects = mongoose.model('ProjectSubjects', projectSubjectSchema);
module.exports = ProjectSubjects;
