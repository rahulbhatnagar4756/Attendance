const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const thought = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
        },
        thought: {
            type: String,
            required: true,
        },
        background_image: {
            type: String,
            trim: true,
        },
        is_display: {
            type: Boolean,
            trim: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * @typedef Thought
 */
const Thought = mongoose.model('Thought', thought);

module.exports = Thought;
