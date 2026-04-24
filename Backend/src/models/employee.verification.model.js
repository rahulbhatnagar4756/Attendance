const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const employeeVerificationSchema = new Schema(
  {
    userId:{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    prev_company_emp_id: {
      type: String,
      trim:true
    },
    prev_company_name: {
      type: String,
      trim: true,
    },
    prev_company_doj: {
      type: Date,
      trim: true,
    },
    prev_company_dor: {
      type: Date,
      trim: true,
    },
    prev_company_designation: {
      type: String,
      trim: true,
    },
    prev_company_employment_status: {
      type: String,
      enum: ['Active', 'Resigned And Left', 'Absconding', 'Terminated', 'Serving Notice Period'],
    },
    elligible_for_rehire: {
      type: String,
    },
    additional_comments: {
      type: String,
      trim: true,
    },
    file_name:{
      type: String,
      trim: true,
    },
    document_image: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

employeeVerificationSchema.pre('save', function (next) {
  if (this.eligible_for_rehire === true) {
    this.additional_comments = undefined; // If eligible_for_rehire is true, clear additional_comments
  }
  next();
});

/**
 * @typedef EmployeeVerification
 */
const EmployeeVerification = mongoose.model('EmployeeVerification', employeeVerificationSchema);

module.exports = EmployeeVerification;
