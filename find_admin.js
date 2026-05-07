const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function find() {
  try {
    await mongoose.connect('mongodb+srv://mouryakadali5_db_user:XnqLcSOdqavh2A9q@cluster0.13hjhoy.mongodb.net/hr-portal');
    const user = await User.findOne({ role: 'Admin' });
    if (user) {
      console.log(`ADMIN_FOUND: ${user.email} | ${user.role}`);
    } else {
      console.log('No Admin found');
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

find();
