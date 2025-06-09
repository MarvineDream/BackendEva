import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["RH", "Manager"],
      default: "Manager",
      required: true
    },

    departements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Departement",
      }
    ],

    // Historique ou audit éventuel
    lastLogin: Date,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
