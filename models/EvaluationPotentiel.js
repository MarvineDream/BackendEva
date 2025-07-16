import mongoose from 'mongoose';

const critereSchema = new mongoose.Schema({
  question: { type: String, required: true },
  note: { type: Number, required: true, min: 1, max: 5 },
});

const evaluationPotentielSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
  },
  dateEvaluation: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['EvaluationPotentiel'],
    default: 'EvaluationPotentiel',
  },
  criteres: {
    type: [critereSchema],
    required: true,
  },
  commentaire: {
    type: String,
    default: '',
  },
  noteGlobale: {
    type: Number,
    required: true,
  },
  moyenne: {
    type: Number,
    required: true,
  },
  classificationAutomatique: {
    type: String,
    enum: ['PROFESSIONAL', 'ACHIEVER', 'POTENTIAL'],
    required: true,
  },
  classificationFinale: {
    type: String,
    enum: ['A', 'B+', 'B', 'C', 'D'],
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.EvaluationPotentiel ||
  mongoose.model('EvaluationPotentiel', evaluationPotentielSchema);
