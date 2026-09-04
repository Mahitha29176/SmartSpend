// Thrown from services/controllers, caught by the central error-handling
// middleware so every failure maps to a consistent { success: false } response.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = ApiError;
