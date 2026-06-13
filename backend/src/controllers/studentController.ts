import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { dbService } from '../services/dbService';
import { ISubmission, ISubmissionAnswer } from '../models/types';

export class StudentController {

  static async getExams(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.user?.id || '';
      const exams = await dbService.getExams();
      const submissions = await dbService.getSubmissionsByStudent(studentId);

      // Map exams to show status (completed vs available)
      const mappedExams = exams.map(exam => {
        const completedSubmission = submissions.find(s => s.examId === exam.id);
        return {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          questionCount: exam.questions.length,
          completed: !!completedSubmission,
          score: completedSubmission ? completedSubmission.score : null,
          percentage: completedSubmission ? completedSubmission.percentage : null,
          submissionId: completedSubmission ? completedSubmission.id : null,
        };
      });

      return res.json(mappedExams);
    } catch (err: any) {
      console.error('Student Get Exams error:', err);
      return res.status(500).json({ message: 'Failed to fetch available exams', error: err.message });
    }
  }

  static async getExamById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const studentId = req.user?.id || '';

      const exam = await dbService.getExamById(id);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      // Check if student already took it
      const existingSubmission = await dbService.getSubmissionByStudentAndExam(studentId, id);
      
      // Return a stripped version of the exam for taking (hide correctAnswer from response so students cannot inspect payload for answers!)
      const publicExam = {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        completed: !!existingSubmission,
        submissionId: existingSubmission ? existingSubmission.id : null,
        questions: exam.questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options
        }))
      };

      return res.json(publicExam);
    } catch (err: any) {
      console.error('Student Get Exam details error:', err);
      return res.status(500).json({ message: 'Failed to fetch exam instructions', error: err.message });
    }
  }

  static async submitExam(req: AuthenticatedRequest, res: Response) {
    try {
      const { examId, answers } = req.body; // Answers format: Array<{ questionId: string, selectedOption: string }>
      const studentId = req.user?.id || '';
      const studentName = req.user?.name || '';
      const studentEmail = req.user?.email || '';

      if (!examId || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'examId and answers array are required' });
      }

      // 1. Strict Attempt Verification (Attempt Rules)
      const existing = await dbService.getSubmissionByStudentAndExam(studentId, examId);
      if (existing) {
        // Return 403 or 409 as per requirements
        return res.status(409).json({
          message: 'You have already completed this exam. Multiple attempts are not allowed.',
          code: 'ALREADY_COMPLETED'
        });
      }

      // Fetch the actual exam to grade
      const exam = await dbService.getExamById(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      // 2. Automated Grading Engine
      let correctCount = 0;
      const corrections: any[] = [];

      exam.questions.forEach(question => {
        const studentAnsObj = answers.find(a => a.questionId === question.id);
        const selected = (studentAnsObj?.selectedOption || '').toUpperCase() as 'A' | 'B' | 'C' | 'D' | '';
        const isCorrect = selected === question.correctAnswer.toUpperCase();

        if (isCorrect) {
          correctCount++;
        }

        corrections.push({
          questionText: question.questionText,
          selectedOption: selected || 'No Answer',
          correctAnswer: question.correctAnswer,
          isCorrect,
          options: question.options
        });
      });

      const totalQuestions = exam.questions.length;
      const score = correctCount;
      const percentage = totalQuestions > 0 ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(2)) : 0;

      // Create submission
      const submission = await dbService.createSubmission({
        studentId,
        studentName,
        studentEmail,
        examId,
        examTitle: exam.title,
        answers: answers as ISubmissionAnswer[],
        score,
        totalQuestions,
        percentage,
        corrections
      });

      return res.status(201).json({
        message: 'Exam graded and submitted successfully',
        result: {
          submissionId: submission.id,
          score,
          totalQuestions,
          percentage,
          correctAnswers: correctCount,
          incorrectAnswers: totalQuestions - correctCount,
          corrections
        }
      });

    } catch (err: any) {
      console.error('Submit Exam error:', err);
      if (err.message === 'DUPLICATE_SUBMISSION') {
        return res.status(409).json({
          message: 'You have already completed this exam. Multiple attempts are not allowed.'
        });
      }
      return res.status(500).json({ message: 'Failed to grade and submit exam', error: err.message });
    }
  }

  static async getResults(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.user?.id || '';
      const results = await dbService.getSubmissionsByStudent(studentId);
      return res.json(results);
    } catch (err: any) {
      console.error('Student Get Results error:', err);
      return res.status(500).json({ message: 'Failed to fetch performance logs', error: err.message });
    }
  }

  static async getResultById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const studentId = req.user?.id || '';

      const submission = await dbService.getSubmissionById(id);
      if (!submission) {
        return res.status(404).json({ message: 'Result sheet not found' });
      }

      // Enforce security (students can only fetch their own sheets; admins can fetch any)
      if (submission.studentId !== studentId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized. You cannot view another student’s feedback' });
      }

      return res.json(submission);
    } catch (err: any) {
      console.error('Student Fetch Result Details error:', err);
      return res.status(500).json({ message: 'Failed to fetch result feedback', error: err.message });
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const studentId = req.user?.id || '';
      const exams = await dbService.getExams();
      const submissions = await dbService.getSubmissionsByStudent(studentId);

      // Compute statistics for student
      const completedCount = submissions.length;
      const availableExams = exams.filter(e => !submissions.some(s => s.examId === e.id));

      let totalPercentageSum = 0;
      submissions.forEach(sub => {
        totalPercentageSum += sub.percentage;
      });

      const averageScore = completedCount > 0 ? parseFloat((totalPercentageSum / completedCount).toFixed(2)) : 0;

      return res.json({
        totalExamsAvailable: availableExams.length,
        totalCompleted: completedCount,
        averageScore,
        recentResults: submissions.sort((a, b) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        ).slice(0, 5)
      });
    } catch (err: any) {
      console.error('Student stats error:', err);
      return res.status(500).json({ message: 'Failed to compute student stats', error: err.message });
    }
  }
}
