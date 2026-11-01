// Contact Us messages: submission by anyone, management by teachers.
import { ContactMessage } from '../models/ContactMessage.js';
import { HttpError, asyncHandler, ensureFound } from '../utils/helpers.js';

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

/** Teacher only: List all messages, newest first. */
export const listMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email role');

  res.json(
    messages.map((m) => ({
      id: m.id,
      userId: m.userId,
      user_id: m.userId,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      status: m.status,
      createdAt: m.createdAt,
      created_at: m.createdAt,
      user: m.user ? { id: m.user.id, name: m.user.name, email: m.user.email, role: m.user.role } : null,
    }))
  );
});

/** Teacher only: Get count of new/unresolved messages for badges. */
export const countNewMessages = asyncHandler(async (req, res) => {
  const count = await ContactMessage.countDocuments({ status: 'new' });
  res.json({ count });
});

/** Teacher only: Update message status (e.g., mark as 'resolved' or 'new'). */
export const updateStatus = asyncHandler(async (req, res) => {
  const message = ensureFound(await ContactMessage.findById(req.params.id), 'Message');
  const targetStatus = String(req.body.status || 'resolved').toLowerCase();

  if (!['new', 'resolved'].includes(targetStatus)) {
    throw new HttpError(400, 'Invalid status. Must be "new" or "resolved"');
  }

  message.status = targetStatus;
  await message.save();

  res.json({
    ok: true,
    message: `Message marked as ${targetStatus}`,
    status: message.status,
  });
});

/** Teacher only: Delete message. */
export const deleteMessage = asyncHandler(async (req, res) => {
  const message = ensureFound(await ContactMessage.findById(req.params.id), 'Message');
  await message.deleteOne();
  res.json({ ok: true, message: 'Message deleted successfully' });
});
