const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { Schema } = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userSchema = new Schema(
  {
    emp_id: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      private: true, // used by the toJSON plugin
    },

    profile_image: {
      type: String,
      trim: true,
    },

    guardian_name: {
      type: String,
      trim: true,
    },

    guardian_phone: {
      type: Number,
      trim: true,
    },

    blood_group: {
      type: String,
      trim: true,
    },

    marital_status: {
      type: String,
      trim: true,
    },

    correspondence_address: {
      type: String,
      trim: true,
    },

    permanent_address: {
      type: String,
      trim: true,
    },

    in_time: {
      type: String,
      trim: true,
    },

    out_time: {
      type: String,
      trim: true,
    },
    working_hour: {
      type: String,
      required: true,
      trim: true,
    },

    doj: {
      type: Date,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      trim: true,
    },
    isExEmployee: {
      type: Boolean,
      default: false,
    },
    releving_date: {
      type: Date,
      trim: true,
    },
    exit_formality: {
      type: Boolean,
      default: false,
    },
    comments: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    allotted_leaves: {
      type: Number,
      trim: true,
    },
    
    pending_leaves: {
      type: Number,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    role: { type: Schema.Types.ObjectId, ref: 'Roles' },
    status: {
      type: Boolean,
      default: false,
    },
    isElligibleToRehire:{
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
