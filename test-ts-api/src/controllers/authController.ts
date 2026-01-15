import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Security: JWT secret should be in .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Register new user
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body;

    // Security: Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create user with hashed password
    const user = await User.create({ username, email, password });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error.message === 'User already exists') {
      return res.status(409).json({ message: error.message });
    }
    
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
}

// Login user
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Security: Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
}

// Get current user (protected route)
export async function getCurrentUser(req: Request & { userId?: string }, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
}
