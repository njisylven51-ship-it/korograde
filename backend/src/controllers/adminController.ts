import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { dbService } from '../services/dbService';
import { IExam, IQuestion } from '../models/types';

export class AdminController {

  // ================= EXAMS =================

  static async createExam(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, duration, questions } = req.body;

      if (!title || !description || duration === undefined) {
        return res.status(400).json({ message: 'Title, description, and duration (numeric) are required' });
      }

      const examData: Partial<IExam> = {
        title,
        description,
        duration: Number(duration),
        questions: questions || [],
        createdBy: req.user?.name || 'Admin',
      };

      const exam = await dbService.createExam(examData);
      return res.status(201).json({ message: 'Exam created successfully', exam });
    } catch (err: any) {
      console.error('Create Exam error:', err);
      return res.status(500).json({ message: 'Failed to create exam', error: err.message });
    }
  }

  static async getExams(req: AuthenticatedRequest, res: Response) {
    try {
      const exams = await dbService.getExams();
      return res.json(exams);
    } catch (err: any) {
      console.error('Get Exams error:', err);
      return res.status(500).json({ message: 'Failed to fetch exams', error: err.message });
    }
  }

  static async updateExam(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, duration, questions } = req.body;

      const exam = await dbService.getExamById(id);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      const updated = await dbService.updateExam(id, {
        title,
        description,
        duration: duration !== undefined ? Number(duration) : undefined,
        questions
      });

      return res.json({ message: 'Exam updated successfully', exam: updated });
    } catch (err: any) {
      console.error('Update Exam error:', err);
      return res.status(500).json({ message: 'Failed to update exam', error: err.message });
    }
  }

  static async deleteExam(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const exam = await dbService.getExamById(id);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      await dbService.deleteExam(id);
      return res.json({ message: 'Exam deleted successfully' });
    } catch (err: any) {
      console.error('Delete Exam error:', err);
      return res.status(500).json({ message: 'Failed to delete exam', error: err.message });
    }
  }

  // ================= QUESTIONS =================

  static async createQuestion(req: AuthenticatedRequest, res: Response) {
    try {
      const { examId, questionText, options, correctAnswer } = req.body;

      if (!examId || !questionText || !options || !correctAnswer) {
        return res.status(400).json({ message: 'examId, questionText, options (A,B,C,D), and correctAnswer are required' });
      }

      const exam = await dbService.getExamById(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      const newQuestion: IQuestion = {
        id: Math.random().toString(36).substr(2, 9),
        questionText,
        options,
        correctAnswer
      };

      const updatedQuestions = [...exam.questions, newQuestion];
      const updatedExam = await dbService.updateExam(examId, { questions: updatedQuestions });

      return res.status(201).json({ message: 'Question added successfully', exam: updatedExam, question: newQuestion });
    } catch (err: any) {
      console.error('Create Question error:', err);
      return res.status(500).json({ message: 'Failed to add question', error: err.message });
    }
  }

  static async updateQuestion(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params; // Question ID
      const { questionText, options, correctAnswer } = req.body;

      // Find the exam containing this question
      const exams = await dbService.getExams();
      let foundExam: IExam | null = null;
      let questionIndex = -1;

      for (const ex of exams) {
        const idx = ex.questions.findIndex(q => q.id === id);
        if (idx !== -1) {
          foundExam = ex;
          questionIndex = idx;
          break;
        }
      }

      if (!foundExam || questionIndex === -1) {
        return res.status(404).json({ message: 'Question not found in any exam' });
      }

      const updatedQuestion = {
        ...foundExam.questions[questionIndex],
        questionText: questionText !== undefined ? questionText : foundExam.questions[questionIndex].questionText,
        options: options !== undefined ? options : foundExam.questions[questionIndex].options,
        correctAnswer: correctAnswer !== undefined ? correctAnswer : foundExam.questions[questionIndex].correctAnswer
      };

      const newQuestions = [...foundExam.questions];
      newQuestions[questionIndex] = updatedQuestion;

      const updatedExam = await dbService.updateExam(foundExam.id, { questions: newQuestions });

      return res.json({ message: 'Question updated successfully', question: updatedQuestion, exam: updatedExam });
    } catch (err: any) {
      console.error('Update Question error:', err);
      return res.status(500).json({ message: 'Failed to update question', error: err.message });
    }
  }

  static async deleteQuestion(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params; // Question ID

      const exams = await dbService.getExams();
      let foundExam: IExam | null = null;

      for (const ex of exams) {
        const contains = ex.questions.some(q => q.id === id);
        if (contains) {
          foundExam = ex;
          break;
        }
      }

      if (!foundExam) {
        return res.status(404).json({ message: 'Question not found' });
      }

      const filteredQuestions = foundExam.questions.filter(q => q.id !== id);
      const updatedExam = await dbService.updateExam(foundExam.id, { questions: filteredQuestions });

      return res.json({ message: 'Question deleted successfully', exam: updatedExam });
    } catch (err: any) {
      console.error('Delete Question error:', err);
      return res.status(500).json({ message: 'Failed to delete question', error: err.message });
    }
  }

  // ================= RESULTS =================

  static async getResults(req: AuthenticatedRequest, res: Response) {
    try {
      const results = await dbService.getSubmissions();
      return res.json(results);
    } catch (err: any) {
      console.error('Get Results error:', err);
      return res.status(500).json({ message: 'Failed to fetch results', error: err.message });
    }
  }

  static async getResultsByStudent(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const results = await dbService.getSubmissionsByStudent(studentId);
      return res.json(results);
    } catch (err: any) {
      console.error('Get Student Results error:', err);
      return res.status(500).json({ message: 'Failed to fetch student results', error: err.message });
    }
  }

  // ================= STATS FOR DASHBOARD =================

  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await dbService.getUsers();
      const students = users.filter(u => u.role === 'student');
      const exams = await dbService.getExams();
      const submissions = await dbService.getSubmissions();

      // Formulate recent activities
      const recentActivity: any[] = [];

      // Sort submissions by date descending
      const sortedSubmissions = [...submissions].sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      sortedSubmissions.slice(0, 5).forEach(sub => {
        recentActivity.push({
          type: 'submission',
          description: `${sub.studentName || 'A Student'} completed the exam "${sub.examTitle || 'Exam'}" and scored ${sub.percentage}%`,
          time: sub.submittedAt
        });
      });

      // Sort user registrations
      const sortedStudents = [...students].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      sortedStudents.slice(0, 5).forEach(st => {
        recentActivity.push({
          type: 'registration',
          description: `New student registration: ${st.name} (${st.email})`,
          time: st.createdAt
        });
      });

      // Sort recent activity (combined)
      const combinedActivity = recentActivity.sort((a, b) => 
        new Date(b.time).getTime() - new Date(a.time).getTime()
      ).slice(0, 7);

      return res.json({
        totalStudents: students.length,
        totalExams: exams.length,
        totalSubmissions: submissions.length,
        recentActivity: combinedActivity
      });
    } catch (err: any) {
      console.error('Stats fetch error:', err);
      return res.status(500).json({ message: 'Failed to load stats', error: err.message });
    }
  }
}
