import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String },
  email: { type: String, required: true, unique: true },
  poste: { type: String, required: true },
  departement: { type: String, required: true },
  typeContrat: { type: String, enum: ["CDD", "CDI", "Stagiaire"], required: true },
  dateEmbauche: { type: Date, required: true },
  dateFinContrat: { type: Date }, 
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
}, 
{ timestamps: true });

export default mongoose.model("Staff", staffSchema);
