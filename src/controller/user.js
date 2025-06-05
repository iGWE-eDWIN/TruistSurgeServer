const User = require('../models/user');
const Transaction = require('../models/transaction');
const Loan = require('../models/loan');

// Generate Account Number
const generateAccountNumber = () =>
  '10' +
  Math.floor(Math.random() * 10000000000)
    .toString()
    .padStart(10, '0');

// Generate Transfer PIN
const generateTransferPin = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

// Register User
const registerUser = async (req, res) => {
  const { fullName, email, password, state, city, zipCode, ssn, homeAddress } =
    req.body;
  try {
    if (!fullName || !email || !password) {
      res.status(400);
      throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = new User({
      fullName,
      email,
      password,
      transferPin: generateTransferPin(),
      accountNumber: generateAccountNumber(),
    });
    await user.save();

    const token = await user.generateAuthToken();

    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(422);
      throw new Error('Must provide email and password');
    }
    const user = await User.findByCredentials(email, password);

    const token = await user.generateAuthToken();

    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Transfer funds
const tranferFunds = async (req, res) => {
  try {
    const { receiverAccountNumber, amount, description, transferPin } =
      req.body;
    const sender = req.user;

    if (sender.transferPin !== transferPin) {
      throw new Error('Invalid transfer PIN');
    }

    // check if sender has sufficent ballance
    if (sender.accountBalance < amount) throw new Error('Insufficient funds');

    // find receiver
    const receiver = await User.findOne({
      accountNumber: receiverAccountNumber,
    });
    if (!receiver) throw new Error('Recipient not found');

    sender.accountBalance -= amount;
    receiver.accountBalance += amount;

    await sender.save();
    await receiver.save();

    // create transaction
    await Transaction.create([
      {
        userId: sender._id,
        type: 'debit',
        amount,
        description,
        recipient: receiver.accountNumber,
        recipientName: receiver.fullName,
      },
      {
        userId: receiver._id,
        type: 'credit',
        amount,
        description,
        sender: sender.accountNumber,
        senderName: sender.fullName,
      },
    ]);

    res.send({ message: 'Transfer successful' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({
      timestamp: -1,
    });
    res.send({ transactions });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    //   const user = await User.findById(req.user._id)
    const user = req.user;
    res.send({ user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getRecentTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(limit);
    res.send({ transactions });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).send({ error: 'User not found' });
    res.send({ user });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Apply for loan
const loanAppy = async (req, res) => {
  // console.log('Loan application endpoint hit');
  try {
    // console.log('Request body:', req.body);
    // console.log('User:', req.user);

    const { type, amount } = req.body;

    const interestRates = {
      student: 3,
      personal: 5,
      business: 6,
      mortgage: 6,
    };

    if (!type || !interestRates[type]) {
      return res.status(400).send({ error: 'Invalid loan type' });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).send({ error: 'Invalid loan amount' });
    }

    const interestRate = interestRates[type];
    const monthlyInterestRate = interestRate / 100 / 12;
    const paymentPeriod = 12; // 1 year in months

    // Calculate monthly payment using loan amortization formula
    const monthlyPayment =
      (amount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, paymentPeriod)) /
      (Math.pow(1 + monthlyInterestRate, paymentPeriod) - 1);

    if (isNaN(monthlyPayment)) {
      return res
        .status(400)
        .send({ error: 'Invalid calculation for monthly payment' });
    }

    const totalPayment = monthlyPayment * paymentPeriod;

    const loan = new Loan({
      userId: req.user._id,
      type,
      amount,
      interestRate,
      monthlyPayment,
      totalPayment,
      paymentPeriod,
    });

    await loan.save();

    res.status(201).send({ loan });
  } catch (error) {
    console.error('Loan application error:', error);
    res.status(400).send({ error: error.message });
  }
};

// Fetch users loans
const getUsersLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user._id });
    res.send({ loans });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  tranferFunds,
  getUserTransactions,
  getUserProfile,
  getRecentTransactions,
  getUserById,
  loanAppy,
  getUsersLoans,
};
