const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const documentSchema = new Schema({

  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Folder', 'File'],
    required: true,
  },
  path: {
    type: String,
    trim: true,
  },
  parentFolder:
  {
    type: Schema.Types.ObjectId,
    ref: 'Documents',
  },

  parentFolderForUser:{
    type:String,
  },

  permittedUsers: [{
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum:["Viewer","Editor"],
      default:"Viewer",
    }
  }],
  fileSize: {
    type: Number,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  accessMode: {
    type: String,
    default: 'public',
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
const Documents = mongoose.model('Documents', documentSchema);
module.exports = Documents;