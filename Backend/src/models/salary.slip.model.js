const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const salarySlipSchema = new Schema({
    userId:{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    basic:{
      type: Number,
      required: false
    },
    hra:{
      type: Number,
      required: false
    },
    cca:{
      type: Number,
      required: false
    },
    medical:{
      type: Number,
      required: false
    },
    transport:{
      type: Number,
      required: false
    },
    employer_pf:{
      type: Number,
      required: false
    },
    performance_incentive:{
      type: Number,
      required: false
    },
    pf_deduction:{
      type: Number,
      required: false
    },
    esi_deduction:{
      type: Number,
      required: false
    },
    professional_tax:{
      type: Number,
      required: false
    },
    medical_insurance:{
      type: Number,
      required: false
    },
    income_tax:{
      type: Number,
      required: false
    },
    leave_deduction:{
      type: Number,
      required: false
    },
    month:{
      type: String,
      required: true
    },
    year:{
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const SalrySlip = mongoose.model('SalrySlip', salarySlipSchema);
module.exports = SalrySlip;