import mongoose from "mongoose";

const EvaluationSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },

  dateEvaluation: {
    type: Date,
    required: true,
  },

  statutEvaluation: {
    type: String,
    enum: ["En cours", "Terminée"],
    default: "En cours",
  },

  // ✅ Mise à jour ici : correspond aux vraies étapes du Stepper
  lastStep: {
    type: String,
    enum: [
      "agent",               
      "objectifsFixes",      
      "objectifsHorsFixes",
      "integration",  
      "competences",         
      "appreciationGlobale", 
      "finalisation"         
    ],
    default: "agent",
  },

  dateCreation: { type: Date, default: Date.now },
  dateDerniereModification: { type: Date },

  agent: {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true },
    emploi: { type: String, required: true },
    direction: { type: String, required: false },
    typeContrat: {
      type: String,
      enum: ["CDD", "CDI", "Stagiaire"],
      required: true,
    },
    dateEmbauche: { type: Date, required: true },
    dateDebutCDD: Date,
    dateFinCDD: Date,
    dureeCDD: { type: String },
  },

  objectifs: [
    {
      activite: String,
      periode: {
        type: String,
        enum: ["Mensuel", "T1", "T2", "T3", "Annuel"],
        required: true,
      },
      pourcentage: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      sousTaches: [
        {
          titre: String,
          note: {
            type: Number,
            min: 1,
            max: 5,
          },
          commentaire: String,
        },
      ],
    },
  ],

  objectifsHorsFixes: [
    {
      activite: String,
      periode: {
        type: String,
        enum: ["Mensuel", "T1", "T2", "T3", "Annuel"],
        required: true,
      },
      pourcentage: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      sousTaches: [
        {
          titre: String,
          note: {
            type: Number,
            min: 1,
            max: 5,
          },
          commentaire: String,
        },
      ],
    },
  ],

  integration: {
    AdaptationPoste: [{ note: String, commentaire: String }],
    AdaptationEquipe: [{ note: String, commentaire: String }],
    RespectDesProcédures: [{ note: String, commentaire: String }],
    MaitriseDesOutils: [{ note: String, commentaire: String }],
  },

  competences: {
    savoir: [{ critere: String, note: String, axeAmelioration: String }],
    savoirFaire: [{ critere: String, note: String, axeAmelioration: String }],
    savoirEtre: [{ critere: String, note: String, axeAmelioration: String }],
    discipline: [{ critere: String, note: String, axeAmelioration: String }],
  },

  appreciationGlobale: {
    note: { type: Number, min: 1, max: 5 },
    commentaire: String,
  },

  decision: {
    type: String,
  },

  signatures: {
    manager: String,
    rh: String,
    agent: String,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

const Evaluation = mongoose.model("Evaluation", EvaluationSchema);
export default Evaluation;
