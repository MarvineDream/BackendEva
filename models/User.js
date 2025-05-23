import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nom: { type: String},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Manager", "RH", "admin"] },
  departement: { type: String, required: true, unique: true },
},
{ timestamps: true });

const User = mongoose.model("User", UserSchema);

export default User;
