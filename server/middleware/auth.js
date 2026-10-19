// Authentication (who are you?) and authorization (are you allowed?).
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { HttpError, asyncHandler } from '../utils/helpers.js';

export const signToken = (user) => jwt.sign({ id: user._id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

/** Reads "Authorization: Bearer <token>", loads the user and puts it on req.user. */
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Please log in first');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new HttpError(401, 'Your session expired. Please log in again');
  }

  const user = await User.findById(payload.id);
  if (!user) throw new HttpError(401, 'Account no longer exists');
  req.user = user;
  next();
});

/** Role gate: requireRole('teacher') lets only teachers through. */
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(new HttpError(403, 'You do not have access to this'));
  next();
};
