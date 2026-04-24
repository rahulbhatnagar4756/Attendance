const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const resultStatusSchema = new Schema({
    result_status: {
    type: String,
       
    },
},
    {
        timestamps: true,
    }
)
const ResultStatus = mongoose.model('ResultStatus', resultStatusSchema);
module.exports = ResultStatus;

