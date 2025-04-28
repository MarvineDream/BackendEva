import mongoose from "mongoose";

const EvaluationSchema = new mongoose.Schema({
  // Informations de l'agent évalué
  agent: {
    nom: String,
    prenom: String,
    emploi: String,
    direction: String,
    typeContrat: String,
    dateEmbauche: Date,
    dateDebutCDD: Date,
    dateFinCDD: Date,
    dureeCDD: String
  },

  // Objectifs fixés (Activité 1 à 6)
  objectifs: [
    {
      activite: String,
      attendu: String,
      realise: String,
      indicateur: String,
      pourcentageAtteinte: Number,
      commentaires: String
    }
  ],

  // Intégration dans l’environnement pro
  integration: {
    remarque: String
  },

  // Compétences
  competences: {
    savoir: [
      {
        critere: String,
        note: String, // TB, B, P, I, PC
        axeAmelioration: String
      }
    ],
    savoirFaire: [
      {
        critere: String,
        note: String,
        axeAmelioration: String
      }
    ],
    savoirEtre: [
      {
        critere: String,
        note: String,
        axeAmelioration: String
      }
    ],
    discipline: [
      {
        critere: String,
        note: String
      }
    ]
  },

  // Appréciation globale
  appreciationGlobale: String,

  // Signatures
  signatures: {
    collaborateur: String,
    responsable: String
  },

  // Décision RH
  decision: {
    type: { type: String, enum: ["confirmation", "fin_contrat", "prorogation"] },
    avisResponsable: String,
    dureeProrogation: String,
    motifConfirmation: String,
    motifFinContrat: String,
    dateSignatureResponsable: Date,
    dateSignatureDirecteur: Date
  },

  // Métadonnées
  statut: { type: String, default: "en_attente" },
  dateSoumission: { type: Date, default: Date.now }
},
{ timestamps: true });

const Evaluation = mongoose.model("Evaluation", EvaluationSchema);
export default Evaluation;
