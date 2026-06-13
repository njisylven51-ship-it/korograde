export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'student';
  createdAt: string;
}

export interface IQuestion {
  id: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface IExam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: IQuestion[];
  createdBy: string; // admin user id / name
  createdAt: string;
}

export interface ISubmissionAnswer {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | '';
}

export interface ISubmission {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  examId: string;
  examTitle?: string;
  answers: ISubmissionAnswer[];
  score: number; // points correct
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
  corrections?: {
    questionText: string;
    selectedOption: string;
    correctAnswer: string;
    isCorrect: boolean;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
  }[];
}
