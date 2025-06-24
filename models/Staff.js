import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  nom: { type: String},
  prenom: { type: String},
  email: { type: String},
  poste: { type: String},
  departement: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  typeContrat: { type: String, enum: ["CDD", "CDI", "Stagiaire"] },
  dateEmbauche: { type: Date},
  dateFinContrat: { type: Date},
  evaluations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Evaluation" }],
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

}, { timestamps: true })

const Staff = mongoose.model("Staff", staffSchema);
export default Staff;