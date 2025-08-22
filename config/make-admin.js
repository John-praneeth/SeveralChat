const path = require('path');
const mongoose = require(path.resolve(__dirname, '..', 'api', 'node_modules', 'mongoose'));
const { User } = require('@librechat/data-schemas').createModels(mongoose);
const { SystemRoles } = require('librechat-data-provider');
const { askQuestion, silentExit } = require('./helpers');
const connect = require('./connect');

(async () => {
  await connect();

  console.purple('--------------------------');
  console.purple('Make user an admin!');
  console.purple('--------------------------');

  let email = '';

  if (process.argv.length >= 3) {
    email = process.argv[2];
  }

  if (!email) {
    email = await askQuestion('Email of user to make admin:');
  }

  if (!email.includes('@')) {
    console.red('Error: Invalid email address!');
    silentExit(1);
  }

  const user = await User.findOne({ email });
  if (!user) {
    console.red('Error: User not found!');
    silentExit(1);
  }

  if (user.role === SystemRoles.ADMIN) {
    console.orange('User is already an admin!');
    silentExit(0);
  }

  try {
    await User.findByIdAndUpdate(user._id, { role: SystemRoles.ADMIN });
    console.green(`Successfully made ${email} an admin!`);
    
    const updatedUser = await User.findById(user._id);
    console.green(`User role is now: ${updatedUser.role}`);
    silentExit(0);
  } catch (error) {
    console.red('Error updating user role: ' + error.message);
    silentExit(1);
  }
})();

process.on('uncaughtException', (err) => {
  if (!err.message.includes('fetch failed')) {
    console.error('There was an uncaught error:');
    console.error(err);
  }

  if (err.message.includes('fetch failed')) {
    return;
  } else {
    process.exit(1);
  }
});
