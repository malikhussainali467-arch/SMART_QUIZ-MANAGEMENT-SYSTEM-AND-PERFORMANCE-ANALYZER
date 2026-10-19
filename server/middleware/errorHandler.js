// Last middleware in the chain: turns any thrown error into a clean JSON reply.
export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'ValidationError' || err.name === 'SequelizeValidationError') {
    status = 400;
    message = err.errors ? Object.values(err.errors).map((e) => e.message).join(', ') : err.message;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.code === 11000 || err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = 'That value already exists';
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
}
