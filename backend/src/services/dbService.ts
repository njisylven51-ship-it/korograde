import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { IUser, IExam, ISubmission, IQuestion } from '../models/types';
import { UserModel, ExamModel, SubmissionModel } from '../models/Schemas';

const DB_FILE = path.join(process.cwd(), 'korograde-db.json');

// Initialize local DB structure if it doesn't exist
const initialLocalDb = {
  users: [] as IUser[],
  exams: [] as IExam[],
  submissions: [] as ISubmission[]
};

class DbService {
  private useLocal: boolean = true;
  private dbLoaded: boolean = false;
  private localData = initialLocalDb;

  constructor() {
    this.init();
  }

  private async init() {
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri && mongoUri !== 'YOUR_MONGO_URI_HERE') {
      try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        // Set connection timeout to 4 seconds to fail-fast if no connection instead of hanging
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 4000,
        });
        this.useLocal = false;
        console.log('✅ Connected to MongoDB Atlas successfully.');
      } catch (err: any) {
        console.error('❌ Failed to connect to MongoDB. Error:', err.message);
        console.log('⚠️ Falling back to Local JSON Database storage...');
        this.useLocal = true;
      }
    } else {
      console.log('ℹ️ No MONGO_URI variable detected. Running on Local JSON Database...');
      this.useLocal = true;
    }

    if (this.useLocal) {
      this.loadLocalDb();
    }
    this.dbLoaded = true;
  }

  private loadLocalDb() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.localData = JSON.parse(fileContent);
        // Ensure keys exist
        if (!this.localData.users) this.localData.users = [];
        if (!this.localData.exams) this.localData.exams = [];
        if (!this.localData.submissions) this.localData.submissions = [];
      } else {
        this.saveLocalDb();
      }
    } catch (err) {
      console.error('Failed to load local DB file, starting clean.', err);
      this.localData = { users: [], exams: [], submissions: [] };
    }
  }

  private saveLocalDb() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.localData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save to local DB file.', err);
    }
  }

  // Returns true if using MongoDB, false if using JSON file-based local DB
  public usingMongo(): boolean {
    return !this.useLocal;
  }

  // Ensure DB connection check is completed
  private async ensureDbReady() {
    if (!this.dbLoaded) {
      // Small tick wait if initialization is in progress
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  // ================= USERS CRUD =================

  async getUsers(): Promise<IUser[]> {
    await this.ensureDbReady();
    if (!this.useLocal) {
      const records = await UserModel.find({});
      return records.map(r => ({
        id: r._id.toString(),
        name: r.name,
        email: r.email,
        role: r.role,
        createdAt: r.createdAt.toISOString()
      }));
    }
    return this.localData.users;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    await this.ensureDbReady();
    const cleanEmail = email.toLowerCase().trim();
    if (!this.useLocal) {
      const r = await UserModel.findOne({ email: cleanEmail });
      if (!r) return null;
      return {
        id: r._id.toString(),
        name: r.name,
        email: r.email,
        password: r.password,
        role: r.role,
        createdAt: r.createdAt.toISOString()
      };
    }
    const found = this.localData.users.find(u => u.email.toLowerCase() === cleanEmail);
    return found || null;
  }

  async getUserById(id: string): Promise<IUser | null> {
    await this.ensureDbReady();
    if (!this.useLocal) {
      try {
        const r = await UserModel.findById(id);
        if (!r) return null;
        return {
          id: r._id.toString(),
          name: r.name,
          email: r.email,
          role: r.role,
          createdAt: r.createdAt.toISOString()
        };
      } catch (err) {
        return null;
      }
    }
    const found = this.localData.users.find(u => u.id === id);
    return found || null;
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    await this.ensureDbReady();
    userData.email = userData.email?.toLowerCase().trim();
    
    if (!this.useLocal) {
      const r = await UserModel.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
      });
      return {
        id: r._id.toString(),
        name: r.name,
        email: r.email,
        role: r.role,
        createdAt: r.createdAt.toISOString()
      };
    }

    const newUser: IUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name || '',
      email: userData.email || '',
      password: userData.password || '',
      role: (userData.role as 'admin' | 'student') || 'student',
      createdAt: new Date().toISOString()
    };
    this.localData.users.push(newUser);
    this.saveLocalDb();
    return newUser;
  }

  // ================= EXAMS CRUD =================

  async getExams(): Promise<IExam[]> {
    await this.ensureDbReady();
    if (!this.useLocal) {
      const exams = await ExamModel.find({});
      return exams.map(e => ({
        id: e._id.toString(),
        title: e.title,
        description: e.description,
        duration: e.duration,
        questions: e.questions.map((q: any) => ({
          id: q._id.toString(),
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer
        })),
        createdBy: e.createdBy,
        createdAt: e.createdAt.toISOString()
      }));
    }
    return this.localData.exams;
  }

  async getExamById(id: string): Promise<IExam | null> {
    await this.ensureDbReady();
    if (!this.useLocal) {
      try {
        const e = await ExamModel.findById(id);
        if (!e) return null;
        return {
          id: e._id.toString(),
          title: e.title,
          description: e.description,
          duration: e.duration,
          questions: e.questions.map((q: any) => ({
            id: q._id.toString(),
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer
          })),
          createdBy: e.createdBy,
          createdAt: e.createdAt.toISOString()
        };
      } catch (err) {
        return null;
      }
    }
    const found = this.localData.exams.find(e => e.id === id);
    return found || null;
  }

  async createExam(examData: Partial<IExam>): Promise<IExam> {
    await this.ensureDbReady();
    if (!this.useLocal) {
      const formattedQuestions = (examData.questions || []).map(q => ({
        questionText: q.questionText,
        options: {
          A: q.options.A,
          B: q.options.B,
          C: q.options.C,
          D: q.options.D,
        },
        correctAnswer: q.correctAnswer
      }));
      const e = await ExamModel.create({
        title: examData.title,
        description: examData.description,
        duration: examData.duration,
        questions: formattedQuestions,
        createdBy: examData.createdBy,
      });
      return {
        id: e._id.toString(),
        title: e.title,
        description: e.description,
        duration: e.duration,
        questions: e.questions.map((q: any) => ({
          id: q._id.toString(),
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer
        })),
        createdBy: e.createdBy,
        createdAt: e.createdAt.toISOString()
      };
    }

    const newExam: IExam = {
      id: Math.random().toString(36).substr(2, 9),
      title: examData.title || '',
      description: examData.description || '',
      duration: examData.duration || 30,
      questions: (examData.questions || []).map(q => ({
        id: Math.random().toString(36).substr(2, 9),
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer
      })),
      createdBy: examData.createdBy || '',
      createdAt: new Date().toISOString()
    };
    this.localData.exams.push(newExam);
    this.saveLocalDb();
    return newExam;
  }

  async updateExam(id: string, examData: Partial<IExam>): Promise<IExam | null> {
    await this.ensureDbReady();
    if (!this.useLocal) {
      try {
        const e = await ExamModel.findById(id);
        if (!e) return null;
        if (examData.title !== undefined) e.title = examData.title;
        if (examData.description !== undefined) e.description = examData.description;
        if (examData.duration !== undefined) e.duration = examData.duration;
        if (examData.questions !== undefined) {
          e.questions = examData.questions.map(q => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer
          }));
        }
        await e.save();
        return {
          id: e._id.toString(),
          title: e.title,
          description: e.description,
          duration: e.duration,
          questions: e.questions.map((q: any) => ({
            id: q._id.toString(),
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer
          })),
          createdBy: e.createdBy,
          createdAt: e.createdAt.toISOString()
        };
      } catch (err) {
        return null;
      }
    }

    const index = this.localData.exams.findIndex(e => e.id === id);
    if (index === -1) return null;
    const current = this.localData.exams[index];
    const updated: IExam = {
      ...current,
      title: examData.title !== undefined ? examData.title : current.title,
      description: examData.description !== undefined ? examData.description : current.description,
      duration: examData.duration !== undefined ? examData.duration : current.duration,
      questions: examData.questions !== undefined ? examData.questions.map(q => ({
        id: q.id || Math.random().toString(36).substr(2, 9),
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer
      })) : current.questions
    };
    this.localData.exams[index] = updated;
    this.saveLocalDb();
    return updated;
  }

  async deleteExam(id: string): Promise<boolean> {
    await this.ensureDbReady();
    if (!this.useLocal) {
      try {
        const r = await ExamModel.findByIdAndDelete(id);
        return r !== null;
      } catch (err) {
        return false;
      }
    }

    const index = this.localData.exams.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.localData.exams.splice(index, 1);
    this.saveLocalDb();
    return true;
  }

  // ================= SUBMISSIONS CRUD =================

  async getSubmissions(): Promise<ISubmission[]> {
    await this.ensureDbReady();
    if (!this.useLocal) {
      const records = await SubmissionModel.find({});
      return records.map(r => ({
        id: r._id.toString(),
        studentId: r.studentId,
        studentName: r.studentName,
        studentEmail: r.studentEmail,
        examId: r.examId,
        examTitle: r.examTitle,
        answers: r.answers.map((a: any) => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption
        })),
        score: r.score,
        totalQuestions: r.totalQuestions,
        percentage: r.percentage,
        submittedAt: r.submittedAt.toISOString(),
        corrections: r.corrections
      }));
    }
    return this.localData.submissions;
  }

  async getSubmissionsByStudent(studentId: string): Promise<ISubmission[]> {
    await this.ensureDbReady();
    if (!this.useLocal) {
      const records = await SubmissionModel.find({ studentId });
      return records.map(r => ({
        id: r._id.toString(),
        studentId: r.studentId,
        studentName: r.studentName,
        studentEmail: r.studentEmail,
        examId: r.examId,
        examTitle: r.examTitle,
        answers: r.answers.map((a: any) => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption
        })),
        score: r.score,
        totalQuestions: r.totalQuestions,
        percentage: r.percentage,
        submittedAt: r.submittedAt.toISOString(),
        corrections: r.corrections
      }));
    }
    return this.localData.submissions.filter(s => s.studentId === studentId);
  }

  async getSubmissionByStudentAndExam(studentId: string, examId: string): Promise<ISubmission | null> {
    await this.ensureDbReady();
    if (!this.useLocal) {
      const r = await SubmissionModel.findOne({ studentId, examId });
      if (!r) return null;
      return {
        id: r._id.toString(),
        studentId: r.studentId,
        studentName: r.studentName,
        studentEmail: r.studentEmail,
        examId: r.examId,
        examTitle: r.examTitle,
        answers: r.answers.map((a: any) => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption
        })),
        score: r.score,
        totalQuestions: r.totalQuestions,
        percentage: r.percentage,
        submittedAt: r.submittedAt.toISOString(),
        corrections: r.corrections
      };
    }
    const found = this.localData.submissions.find(s => s.studentId === studentId && s.examId === examId);
    return found || null;
  }

  async getSubmissionById(id: string): Promise<ISubmission | null> {
    await this.ensureDbReady();
    if (!this.useLocal) {
      try {
        const r = await SubmissionModel.findById(id);
        if (!r) return null;
        return {
          id: r._id.toString(),
          studentId: r.studentId,
          studentName: r.studentName,
          studentEmail: r.studentEmail,
          examId: r.examId,
          examTitle: r.examTitle,
          answers: r.answers.map((a: any) => ({
            questionId: a.questionId,
            selectedOption: a.selectedOption
          })),
          score: r.score,
          totalQuestions: r.totalQuestions,
          percentage: r.percentage,
          submittedAt: r.submittedAt.toISOString(),
          corrections: r.corrections
        };
      } catch (err) {
        return null;
      }
    }
    const found = this.localData.submissions.find(s => s.id === id);
    return found || null;
  }

  async createSubmission(subData: Partial<ISubmission>): Promise<ISubmission> {
    await this.ensureDbReady();

    // Enforce unique attempt (studentId + examId)
    const existing = await this.getSubmissionByStudentAndExam(
      subData.studentId || '',
      subData.examId || ''
    );
    if (existing) {
      throw new Error('DUPLICATE_SUBMISSION');
    }

    if (!this.useLocal) {
      const r = await SubmissionModel.create({
        studentId: subData.studentId,
        studentName: subData.studentName,
        studentEmail: subData.studentEmail,
        examId: subData.examId,
        examTitle: subData.examTitle,
        answers: subData.answers,
        score: subData.score,
        totalQuestions: subData.totalQuestions,
        percentage: subData.percentage,
        corrections: subData.corrections,
      });
      return {
        id: r._id.toString(),
        studentId: r.studentId,
        studentName: r.studentName,
        studentEmail: r.studentEmail,
        examId: r.examId,
        examTitle: r.examTitle,
        answers: r.answers.map((a: any) => ({
          questionId: a.questionId,
          selectedOption: a.selectedOption
        })),
        score: r.score,
        totalQuestions: r.totalQuestions,
        percentage: r.percentage,
        submittedAt: r.submittedAt.toISOString(),
        corrections: r.corrections
      };
    }

    const newSubmission: ISubmission = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: subData.studentId || '',
      studentName: subData.studentName || '',
      studentEmail: subData.studentEmail || '',
      examId: subData.examId || '',
      examTitle: subData.examTitle || '',
      answers: subData.answers || [],
      score: subData.score || 0,
      totalQuestions: subData.totalQuestions || 0,
      percentage: subData.percentage || 0,
      submittedAt: new Date().toISOString(),
      corrections: subData.corrections || []
    };
    this.localData.submissions.push(newSubmission);
    this.saveLocalDb();
    return newSubmission;
  }
}

export const dbService = new DbService();
export default dbService;
