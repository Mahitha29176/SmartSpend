// Any error passed to next(err) anywhere in the app ends up here.
// Keeps the response shape identical whether the failure was a validation
// issue, a thrown ApiError, or an unexpected exception.
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  if (status === 500) {
    // Only log unexpected errors -- expected 4xx failures are normal traffic.
    console.error(err);
  }

  res.status(status).json({ success: false, message });
}

module.exports = errorHandler;
