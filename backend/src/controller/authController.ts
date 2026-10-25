import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Adjust relative path based on your folders
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;

export class AuthController {
  // 1. Register a new user
  static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName, role, phone } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields (email, password, fullName).',
        });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already registered.',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role: role || 'CLIENT',
          phone,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during registration.',
      });
    }
  }

  // 2. Login user and issue JWT
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required.',
        });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials.',
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials.',
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during login.',
      });
    }
  }

  // 3. Request Password Reset Link
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required.' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        return res.status(200).json({ 
          success: true, 
          message: 'If an account with that email exists, a password reset link has been sent.' 
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiration

      await prisma.user.update({
        where: { email },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires,
        },
      });

      console.log(`[DEV ONLY] Password Reset Token for ${email}: ${resetToken}`);

      return res.status(200).json({ 
        success: true, 
        message: 'Password reset instructions have been sent to your email.' 
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
  }

  // 4. Complete Password Reset using Token
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ success: false, error: 'Token and new password are required.' });
      }

      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { gt: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({ success: false, error: 'Invalid or expired password reset token.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Password has been successfully reset. You can now log in.' 
      });

    } catch (error) {
      console.error('Reset password error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
  }
}