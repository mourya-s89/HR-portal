const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'HR', 'Employee'], default: 'Employee' }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function check() {
  try {
    await mongoose.connect('mongodb+srv://mouryakadali5_db_user:XnqLcSOdqavh2A9q@cluster0.13hjhoy.mongodb.net/hr-portal');
    const user = await User.findOne({ email: 'mouryakadali5@gmail.com' });
    console.log(user ? `USER_FOUND: ${JSON.stringify(user)}` : 'User NOT found');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
