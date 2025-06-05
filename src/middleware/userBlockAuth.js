// Check if user is blocked middleware
const userBlockAuth = async (req, res, next) => {
  try {
    if (req.user.isBlocked) {
      throw new Error(
        'Account has been suspended. Please contact customer care.'
      );
    }
    next();
  } catch (error) {
    res.status(403).send({ error: error.message });
  }
};

module.exports = userBlockAuth;
