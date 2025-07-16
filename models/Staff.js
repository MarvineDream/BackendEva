import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String },
  email: { type: String, required: true, unique: true },
  poste: { type: String, required: true },

  departement: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },

  typeContrat: {
    type: String,
    enum: ["CDD", "CDI", "Stagiaire"],
    required: true,
  },

  // Pour CDD et CDI
  dateEmbauche: { type: Date },
  dateFinContrat: { type: Date },

  // Pour Stagiaire
  dateDebutStage: { type: Date },
  dateFinStage: { type: Date },

  evaluations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Evaluation" }],
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
  timestamps: true,
});

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;