const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const formSchema = new Schema({
    formName:{
      type: String,
      required: true
    },
    formDescription:{
      type: String,
    },
    status:{
      type: Boolean,
      default: true,
      required: true
    },
    jsonFormData:{
      type: JSON,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const Forms = mongoose.model('Forms', formSchema);
module.exports = Forms;