import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  description: { type: String},
},
{
  timestamps: true
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;