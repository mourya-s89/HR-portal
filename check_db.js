const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb+srv://mouryakadali5_db_user:XnqLcSOdqavh2A9q@cluster0.13hjhoy.mongodb.net/hr-portal');
  console.log("Connected");
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log("Users in DB:", users.map(u => u.email));
  process.exit(0);
}
check().catch(console.error);
