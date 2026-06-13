import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateJWT, authorizeRole } from '../middleware/auth';

const router = Router();

// Apply admin protection to all routes in this namespace
router.use(authenticateJWT);
router.use(authorizeRole(['admin']));

// Exams CRUD
router.post('/exams', AdminController.createExam);
router.get('/exams', AdminController.getExams);
router.put('/exams/:id', AdminController.updateExam);
router.delete('/exams/:id', AdminController.deleteExam);

// Question operations
router.post('/questions', AdminController.createQuestion);
router.put('/questions/:id', AdminController.updateQuestion);
router.delete('/questions/:id', AdminController.deleteQuestion);

// Submissions / Results querying
router.get('/results', AdminController.getResults);
router.get('/results/:studentId', AdminController.getResultsByStudent);

// Dashboard statistics
router.get('/stats', AdminController.getStats);

export default router;
