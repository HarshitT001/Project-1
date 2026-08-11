const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
  {
    name: String,
    slot: String,
    diet: String,
    cal: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  { _id: false }
);

const dietPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetCalories: Number,
    tdee: Number,
    goal: String,
    dietType: String,
    meals: {
      breakfast: mealSchema,
      lunch: mealSchema,
      snack: mealSchema,
      dinner: mealSchema,
    },
    totals: {
      cal: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DietPlan', dietPlanSchema);
