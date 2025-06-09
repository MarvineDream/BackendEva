import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: { type: String, required: true },
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;