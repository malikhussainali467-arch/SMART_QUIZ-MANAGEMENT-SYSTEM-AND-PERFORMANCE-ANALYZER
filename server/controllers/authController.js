import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { signToken } from '../middleware/auth.js';
import { HttpError, asyncHandler, requireFields } from '../utils/helpers.js';

const reply = (user) => ({ token: signToken(user), user });

export const register = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'password']);
  const { name, email, password, role = 'student', teacherCode } = req.body;

  if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
 
  if (await User.findOne({ email: email.toLowerCase() })) throw new HttpError(409, 'An account with this email already exists');

  const user = await User.create({
    name,
    email,
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
