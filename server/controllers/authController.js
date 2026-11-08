import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { signToken } from '../middleware/auth.js';
import { HttpError, asyncHandler, requireFields } from '../utils/helpers.js';

const reply = (user) => ({ token: signToken(user), user });

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, name, email, password, confirmPassword, role = 'student' } = req.body || {};

  if (!email || !String(email).trim()) {
    throw new HttpError(400, 'Email is required');
  }
  if (!password) {
    throw new HttpError(400, 'Password is required');
  }

  // Name resolution & validation
  let resolvedName = '';
  if (firstName !== undefined || lastName !== undefined) {
    const cleanFirst = String(firstName || '').trim();
    const cleanLast = String(lastName || '').trim();

    if (!cleanFirst) throw new HttpError(400, 'First name is required');
    if (!cleanLast) throw new HttpError(400, 'Last name is required');

    if (/[0-9]/.test(cleanFirst) || /[^A-Za-z\s]/.test(cleanFirst)) {
      throw new HttpError(400, 'First name must contain only letters (no numbers or special characters)');
    }
    if (/[0-9]/.test(cleanLast) || /[^A-Za-z\s]/.test(cleanLast)) {
      throw new HttpError(400, 'Last name must contain only letters (no numbers or special characters)');
    }
    resolvedName = `${cleanFirst} ${cleanLast}`;
  } else {
    resolvedName = String(name || '').trim();
    if (!resolvedName) throw new HttpError(400, 'Name is required');
  }

  // Password validation: at least 12 chars, uppercase, lowercase, special character
  if (password.length < 12) {
    throw new HttpError(400, 'Password must be at least 12 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    throw new HttpError(400, 'Password must contain at least one uppercase letter (cannot be only lowercase)');
  }
  if (!/[a-z]/.test(password)) {
    throw new HttpError(400, 'Password must contain at least one lowercase letter');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    throw new HttpError(400, 'Password must contain at least one special character');
  }

  // Confirm password verification if provided
  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new HttpError(400, 'Passwords do not match');
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (await User.findOne({ email: cleanEmail })) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name: resolvedName,
    email: cleanEmail,
    role: role === 'teacher' ? 'teacher' : 'student',
    passwordHash: await User.hashPassword(password),
  });
  res.status(201).json(reply(user));
});

export const login = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password']);
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user || !(await user.verifyPassword(req.body.password))) throw new HttpError(401, 'Wrong email or password');
  res.json(reply(user));
});

export const me = (req, res) => res.json({ user: req.user });
