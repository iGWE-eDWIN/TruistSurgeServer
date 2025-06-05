const express = require('express');
const {
  createSystemAdmin,
  getTransactions,
  getUsers,
  deleteUser,
  fundAccount,
  loginAdmin,
  checkAdmin,
  getUsersLoanRequest,
  grantLoans,
  userBLockToggle,
} = require('../controller/admin');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = new express.Router();

router.post('/admin/login', loginAdmin);
router.post('/admin/fund-account', auth, adminAuth, fundAccount);
router.delete('/admin/users/:userId', auth, adminAuth, deleteUser);
router.get('/admin/users', auth, adminAuth, getUsers);
router.get('/admin/transactions', auth, adminAuth, getTransactions);
router.get('/admin/check', auth, checkAdmin);
router.post('/admin/register', createSystemAdmin);
router.get('/admin/loans', auth, adminAuth, getUsersLoanRequest);
router.patch('/admin/loans/:loanId', auth, adminAuth, grantLoans);
router.patch(
  '/admin/users/:userId/toggle-block',
  auth,
  adminAuth,
  userBLockToggle
);

module.exports = router;
