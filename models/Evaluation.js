import mongoose from "mongoose";

const EvaluationSchema = new mongoose.Schema({
  // ID du staff (référence MongoDB)
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true
  },

  // Période de l’évaluation
  periodeEvaluation: {
    type: String,
    enum: ["Mensuel", "1er Trimestre", "2e Trimestre", "3e Trimestre", "Annuel", "Finale"],
    required: true
  },

  // Statut de l'évaluation
  statutEvaluation: {
    type: String,
    enum: ["En cours", "Terminée"],
    default: "En cours" // Valeur par défaut
  },


  // Métadonnées
  dateCreation: { type: Date, default: Date.now },
  dateDerniereModification: { type: Date },

  // Informations de l'agent évalué
  agent: {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true },
    emploi: { type: String, required: true },
    direction: { type: String, required: true },
    typeContrat: { type: String, enum: ["CDD", "CDI", "Stagiaire"], required: true },
    dateEmbauche: { type: Date, required: true },
    dateDebutCDD: Date,
    dateFinCDD: Date,
    dureeCDD: { type: String }
  },

  // Objectifs fixés (Activité 1 à 6)
  objectifs: [
    {
      activite: String,
      periode: {
        type: String,
        enum: ["Mensuel", "1er Trimestre", "2e Trimestre", "3e Trimestre", "Annuel"],
        required: true
      },
      pourcentage: {
        type: Number,
        min: 0,
        max: 100,
        required: true
      },
      sousTaches: [
        {
          titre: String,
          note: {
            type: Number,
            min: 1,
            max: 5
          },
          commentaire: String
        }
      ]
    }
  ],

  // Intégration dans l’environnement pro
  integration: {
    AdaptationPoste: [{ note: String, commentaire: String }],
    AdaptationEquipe: [{ note: String, commentaire: String }],
    RespectDesProcédures: [{ note: String, commentaire: String }],
    MaitriseDesOutils: [{ note: String, commentaire: String }]
  },

  // Compétences
  competences: {
    savoir: [{ critere: String, note: String, axeAmelioration: String }],
    savoirFaire: [{ critere: String, note: String, axeAmelioration: String }],
    savoirEtre: [{ critere: String, note: String, axeAmelioration: String }],
    discipline: [{ critere: String, note: String, axeAmelioration: String }]
  },

  // 👤 L'auteur de l’évaluation
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

const Evaluation = mongoose.model("Evaluation", EvaluationSchema);

export default Evaluation;
