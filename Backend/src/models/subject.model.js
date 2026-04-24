const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const subjectSchema = new Schema({
    subject:
    {
        type: String,
        // required: true

    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
},
    {
        timestamps: true,
    }
)
const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;

