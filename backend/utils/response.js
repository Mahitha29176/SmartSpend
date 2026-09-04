// Small helpers so every controller returns the exact same JSON shape.
function success(res, data = {}, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, message = 'Something went wrong', status = 400) {
  return res.status(status).json({ success: false, message });
}

module.exports = { success, fail };
