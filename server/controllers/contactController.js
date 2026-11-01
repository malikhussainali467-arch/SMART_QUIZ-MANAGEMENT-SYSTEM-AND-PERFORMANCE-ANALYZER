// Contact Us messages: submission by anyone.
import { ContactMessage } from '../models/ContactMessage.js';
import { HttpError, asyncHandler } from '../utils/helpers.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const ALLOWED_SUBJECTS = [
  'Question about a quiz',
  'Report a problem',
  'Suggestion',
  'Other',
];

/** Public: Send a contact message. Optional user attachment if authenticated. */
export const sendMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanSubject = String(subject || '').trim();
  const cleanMessage = String(message || '').trim();

  if (!cleanName) {
    throw new HttpError(400, 'Please enter your name');
  }
  if (cleanName.length < 2 || cleanName.length > 100) {
    throw new HttpError(400, 'Name must be between 2 and 100 characters');
  }

  if (!cleanEmail) {
    throw new HttpError(400, 'Please enter your email address');
  }
  if (!EMAIL_REGEX.test(cleanEmail)) {
    throw new HttpError(400, 'Please enter a valid email address');
  }

  if (!cleanSubject) {
    throw new HttpError(400, 'Please select a subject');
  }

  if (!cleanMessage) {
    throw new HttpError(400, 'Please enter a message');
  }
  if (cleanMessage.length < 10) {
    throw new HttpError(400, 'Message must be at least 10 characters long');
  }
  if (cleanMessage.length > 1000) {
    throw new HttpError(400, 'Message must not exceed 1000 characters');
  }

  const userId = req.user ? req.user._id : null;

  const contactMessage = await ContactMessage.create({
    userId,
    name: cleanName,
    email: cleanEmail,
    subject: cleanSubject,
    message: cleanMessage,
    status: 'new',
  });

  res.status(201).json({
    ok: true,
    message: 'Thanks, we received your message.',
    id: contactMessage._id,
  });
});
