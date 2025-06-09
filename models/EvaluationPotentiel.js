import mongoose from 'mongoose';

const critereSchema = new mongoose.Schema({
  question: String,
  note: { type: Number, min: 1, max: 5 },
});

const evaluationPotentielSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  criteres: [critereSchema],
  noteFinale: Number,
  classification: {
    type: String,
    enum: ['PROFESSIONAL', 'ACHIEVER', 'POTENTIAL'],
  },
  commentaire: String,
  dateEvaluation: { type: Date, default: Date.now },
});

export default mongoose.model('EvaluationPotentiel', evaluationPotentielSchema);