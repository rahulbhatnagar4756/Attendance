const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const templateUserSchema = new Schema({
    formId:{
      type: String,
      required: true
    },
    userId:{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    formName:{
      type: String,
      required: true
    },
    formDescription:{
      type: String,
    },
    formJson:{
      type: JSON,
      required: true
    },
    submitDetails:{
       type: Array,
       default:''
    },
    is_submitted:{
      type: Boolean,
      default: false
    },
    approveRelievingFormManagerId:{
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    managerApproval: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected' ],
      default: 'Pending'
    },
    hrApproval: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected' ],
      default: 'Pending'
    },
  },
  {
    timestamps: true,
  }
);

const UserFormTemplate  = mongoose.model('UserFormTemplate', templateUserSchema);
module.exports = UserFormTemplate;