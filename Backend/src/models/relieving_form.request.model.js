const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const relivingFormApprovalRequestSchema = mongoose.Schema(
  {
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    formId:{
      type: Schema.Types.ObjectId,
      ref: "UserFormTemplate",
      required: true,
    },
    date: {
      type: Date,
      trim: true,
    },
    requestMessage: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
// tokenSchema.plugin(toJSON);

// changeRequestSchema.plugin(toJSON);
// changeRequestSchema.plugin(paginate);

/**
 * @typedef ChangeRequests
 */
const RelivingFormApprovalRequest = mongoose.model("Reliving_Form_Approval_Request", relivingFormApprovalRequestSchema);

module.exports = RelivingFormApprovalRequest;
