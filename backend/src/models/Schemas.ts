import mongoose, { Schema } from 'mongoose';

// User Schema
export const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Question Embedded Schema
const QuestionSchema = new Schema({
  questionText: { type: String, required: true },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true },
  },
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
});

// Exam Schema
export const ExamSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  questions: [QuestionSchema],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Submission Schema
export const SubmissionSchema = new Schema({
  studentId: { type: String, required: true },
  studentName: { type: String },
  studentEmail: { type: String },
  examId: { type: String, required: true },
  examTitle: { type: String },
  answers: [{
    questionId: { type: String, required: true },
    selectedOption: { type: String },
  }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  corrections: [{
    questionText: { type: String },
    selectedOption: { type: String },
    correctAnswer: { type: String },
    isCorrect: { type: Boolean },
    options: {
      A: { type: String },
      B: { type: String },
      C: { type: String },
      D: { type: String },
    }
  }]
});

// Create unique compound index to enforce one attempt only per student + exam
SubmissionSchema.index({ studentId: 1, examId: 1 }, { unique: true });

export const UserModel = (mongoose.models.User || mongoose.model('User', UserSchema)) as any;
export const ExamModel = (mongoose.models.Exam || mongoose.model('Exam', ExamSchema)) as any;
export const SubmissionModel = (mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema)) as any;
