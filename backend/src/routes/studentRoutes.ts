import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { authenticateJWT, authorizeRole } from '../middleware/auth';

const router = Router();

// Apply student protection to all routes in this namespace
router.use(authenticateJWT);
router.use(authorizeRole(['student']));

// Exam available listings and info details
router.get('/exams', StudentController.getExams);
router.get('/exams/:id', StudentController.getExamById);

// Submit responses for grading
router.post('/submit', StudentController.submitExam);

// Results history logs and stats
router.get('/results', StudentController.getResults);
router.get('/results/:id', StudentController.getResultById);
router.get('/stats', StudentController.getStats);

export default router;
