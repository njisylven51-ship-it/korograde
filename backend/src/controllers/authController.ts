import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService';

const JWT_SECRET = process.env.JWT_SECRET || 'korograde_secret_key_fixed_for_immediate_runnability';

export class AuthController {
  
  static async signup(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields (name, email, password, role) are required' });
      }

      if (role !== 'admin' && role !== 'student') {
        return res.status(400).json({ message: 'Role must be either "admin" or "student"' });
      }

      const existingUser = await dbService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'An account with this email address already exists' });
      }

      // Password hashing
      const hashedPassword = await bcryptjs.hash(password, 10);

      const user = await dbService.createUser({
        name,
        email,
        password: hashedPassword,
        role: role as 'admin' | 'student'
      });

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(211).json({
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      return res.status(500).json({ message: 'Failed to complete signup', error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await dbService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      const isMatch = await bcryptjs.compare(password, user.password || '');
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Failed to complete login', error: err.message });
    }
  }
}
