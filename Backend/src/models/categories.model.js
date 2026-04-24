const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const categoriesSchema = new Schema({

    category: {
        type: String,
        require: true,
    },

},
    {
        timestamps: true,
    }
);

const Categories = mongoose.model('Categories', categoriesSchema);
module.exports = Categories;