const User = require('../models/user');
const Transaction = require('../models/transaction');
const Loan = require('../models/loan');

const generateAccountNumber = () =>
  '10' +
  Math.floor(Math.random() * 10000000000)
    .toString()
    .padStart(10, '0');

// Generate Transfer PIN
const generateTransferPin = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

// Admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) throw new Error('Invalid admin credentials');

    const token = await user.generateAuthToken();

    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Fund users account
const fundAccount = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    // find user
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.accountBalance += amount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'credit',
      amount,
      description: description || 'Account funded by admin',
      sender: 'Royal Trust Bank',
      senderName: req.user.fullName,
    });

    res.send({ message: 'Account funded successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    await Transaction.deleteMany({ userId: req.params.userId });
    res.send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get Users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });
    res.send({ users });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get transaction details
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ timestamp: -1 });
    res.send({ transactions });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get users loan request
const getUsersLoanRequest = async (req, res) => {
  try {
    const loans = await Loan.find().populate(
      'userId',
      'fullName email accountNumber'
    );
    res.send({ loans });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Grant users loan
const grantLoans = async (req, res) => {
  try {
    const { status } = req.body;
    const loan = await Loan.findById(req.params.loanId);

    if (!loan) {
      return res.status(404).send({ error: 'Loan not found' });
    }

    if (status === 'approved' && loan.status === 'pending') {
      const user = await User.findById(loan.userId);
      user.accountBalance += loan.amount;
      await user.save();

      // Create transaction record
      await Transaction.create({
        userId: loan.userId,
        type: 'credit',
        amount: loan.amount,
        description: `${
          loan.type.charAt(0).toUpperCase() + loan.type.slice(1)
        } loan approved`,
        sender: 'Royal Trust Bank',
        senderName: 'Loan Disbursement',
      });
    }

    loan.status = status;
    await loan.save();

    res.send({ loan });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const userBLockToggle = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.send({
      user,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// create System Admin
// truistsurge@aol.com
const createSystemAdmin = async () => {
  try {
    const adminUser = await User.findOne({ email: 'truistsurge@aol.com' });
    if (!adminUser) {
      await User.create({
        fullName: 'Truist Surge ',
        email: 'truistsurge@aol.com',
        password: 'admin123',
        role: 'admin',
        accountNumber: generateAccountNumber(),
        transferPin: generateTransferPin(),
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

const checkAdmin = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      res.send({ isAdmin: true });
    } else {
      res.send({ isAdmin: false });
    }
  } catch (error) {
    res.status(500).send({ error: 'Unable to verify admin status' });
  }
};

module.exports = {
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
};
