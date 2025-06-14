import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['evaluation', 'contract', 'employee', 'alert'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: Date, default: Date.now }
}, 
{
  timestamps: true
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
