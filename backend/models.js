const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
    phone: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    avatar: { type: DataTypes.STRING },
  });

  const Account = sequelize.define('Account', {
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    balance: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
    currency: { type: DataTypes.STRING, defaultValue: 'USD' },
    description: { type: DataTypes.TEXT },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  const Category = sequelize.define('Category', {
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
    color: { type: DataTypes.STRING, defaultValue: '#1976d2' },
    description: { type: DataTypes.TEXT },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  const Transaction = sequelize.define('Transaction', {
    amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    description: { type: DataTypes.STRING },
    type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
    notes: { type: DataTypes.TEXT },
    CategoryId: { type: DataTypes.INTEGER, allowNull: true },
    AccountId: { type: DataTypes.INTEGER, allowNull: true },
  });

  const Budget = sequelize.define('Budget', {
    amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    period: { type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'), defaultValue: 'monthly' },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    description: { type: DataTypes.TEXT },
  });

  const RecurringTransaction = sequelize.define('RecurringTransaction', {
    amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    description: { type: DataTypes.STRING },
    type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
    interval: { type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'), allowNull: false },
    nextDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  const UserSettings = sequelize.define('UserSettings', {
    theme: { type: DataTypes.ENUM('light', 'dark'), defaultValue: 'light' },
    notifications: { type: DataTypes.BOOLEAN, defaultValue: true },
    cloudSync: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  User.hasMany(Account);
  Account.belongsTo(User);

  User.hasMany(Category);
  Category.belongsTo(User);

  User.hasMany(Budget);
  Budget.belongsTo(User);
  Category.hasMany(Budget);
  Budget.belongsTo(Category);

  Account.hasMany(Transaction);
  Transaction.belongsTo(Account);
  Category.hasMany(Transaction);
  Transaction.belongsTo(Category);
  User.hasMany(Transaction);
  Transaction.belongsTo(User);

  User.hasMany(RecurringTransaction);
  RecurringTransaction.belongsTo(User);
  Account.hasMany(RecurringTransaction);
  RecurringTransaction.belongsTo(Account);
  Category.hasMany(RecurringTransaction);
  RecurringTransaction.belongsTo(Category);

  User.hasOne(UserSettings);
  UserSettings.belongsTo(User);

  return { User, Account, Category, Transaction, Budget, RecurringTransaction, UserSettings };
}; 