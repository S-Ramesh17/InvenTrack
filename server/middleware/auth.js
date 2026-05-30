// Simple middleware to check if user info is passed via headers
// Since we use localStorage on frontend, we pass user data in request headers

const requireAuth = (req, res, next) => {
  const userRole = req.headers['x-user-role'];
  const userId = req.headers['x-user-id'];
  const userName = req.headers['x-user-name'];

  if (!userRole || !userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  // Attach user info to request
  req.user = {
    id: userId,
    role: userRole,
    name: userName || 'Unknown',
  };

  next();
};

const requireAdmin = (req, res, next) => {
  const userRole = req.headers['x-user-role'];
  const userId = req.headers['x-user-id'];
  const userName = req.headers['x-user-name'];

  if (!userRole || !userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  req.user = {
    id: userId,
    role: userRole,
    name: userName || 'Unknown',
  };

  next();
};

module.exports = { requireAuth, requireAdmin };
