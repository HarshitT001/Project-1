const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned by default queries
    },
    // Saved so the planner can prefill next time this user logs in
    profile: {
      age: Number,
      gender: { type: String, enum: ['male', 'female'] },
      height: Number,
      weight: Number,
      activityLevel: Number,
      goal: { type: String, enum: ['loss', 'maintain', 'gain', 'muscle'] },
      dietType: { type: String, enum: ['veg', 'nonveg', 'egg', 'vegan'] },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
