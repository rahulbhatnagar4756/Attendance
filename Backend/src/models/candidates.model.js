const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const candidatesSchema = new Schema({
    candidate_name: {
        type: String,
        trim: true,
        require: true,
    },
    email: {
        type: String,
        trim: true,
        require: true,
    },
    phone: {
        type: Number,
        trim: true,
        require: true,
    },
    dob: {
        type: String,
        trim: true,
    },
    current_company: {
        type: String,
        trim: true,
        require: true,
    },
    experience: {
        type: String,
        trim: true,
        require: true,
    },
    current_ctc: {
        type: String,
        trim: true,
        require: true,
    },
    expected_ctc: {
        type: String,
        trim: true,
        require: true,
    },
    notice_period: {
        type: Number,
        trim: true,
        require: true,
    },
    current_location: {
        type: String,
        trim: true,
        require: true,
    },
    source_of_hiring: {
        type: String,
        trim: true,
        require: true,
    },
    qualification: {
        type: String,
        trim: true,
        require: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Categories",
        require: true,
    },
    candidate_cv_fileName: {
        type: String,
        trim: true,
    },
    candidate_cv_URL: {
        type: String,
        trim: true,
    },
    aptitude_round: {
        type: Schema.Types.ObjectId,
        ref: "ResultStatus",
    },
    aptitude_round_comment: {
        type: String,
        trim: true,
    },
    technical_round: {
        type: Schema.Types.ObjectId,
        ref: "ResultStatus",
    },
    technical_round_comment: {
        type: String,
        trim: true,
    },
    manager_round: {
        type: Schema.Types.ObjectId,
        ref: "ResultStatus",
    },
    manager_round_comment: {
        type: String,
        trim: true,
    },
    final_round: {
        type: Schema.Types.ObjectId,
        ref: "ResultStatus",
    },
    final_round_comment: {
        type: String,
        trim: true,
    },
    additional_comment: {
        type: String,
        trim: true,
    },
    recruiter_name: {
        type: String,
        trim: true,
        require: true,
    }
},
    {
        timestamps: true,
    }
);

const Candidates = mongoose.model('Candidates', candidatesSchema);
module.exports = Candidates;
