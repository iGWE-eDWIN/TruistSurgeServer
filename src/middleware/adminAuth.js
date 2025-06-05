const adminAuth = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') throw new Error('Admin access required');
    next();
  } catch (error) {
    res.status(403).send({ error });
  }
};

module.exports = adminAuth;
