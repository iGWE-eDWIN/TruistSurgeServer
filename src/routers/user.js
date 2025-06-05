const express = require('express');
const {
  registerUser,
  loginUser,
  tranferFunds,
  getUserTransactions,
  getUserProfile,
  getRecentTransactions,
  getUserById,
  loanAppy,
  getUsersLoans,
} = require('../controller/user');
const auth = require('../middleware/auth');
const userBlockAuth = require('../middleware/userBlockAuth');

const router = new express.Router();

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.post('/user/transfer', auth, userBlockAuth, tranferFunds);
router.post('/user/loans/apply', auth, userBlockAuth, loanAppy);
router.get('/user/transactions', auth, userBlockAuth, getUserTransactions);
router.get('/user/profile', auth, getUserProfile);
router.get('/user/:userId', auth, getUserById);
router.get(
  '/user/transactions/recent',
  auth,
  userBlockAuth,
  getRecentTransactions
);
router.get('/user/loans', auth, userBlockAuth, getUsersLoans);

module.exports = router;
