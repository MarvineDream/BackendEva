import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String,enum: ["admin", "rh", "manager"], required: true},
  departement: { type: String, required: function () {
      return this.role === "manager";
    }
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
