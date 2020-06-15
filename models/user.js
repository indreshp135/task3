const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
  email:
  {
    type: String,
    required: true
  },
  username:
  {
    type: String,
    required: true
  },
  password:
  {
    type: String,
    required: true
  },
  accepted:[mongoose.Schema.Types.ObjectId],
  invited:[mongoose.Schema.Types.ObjectId],
  created:[mongoose.Schema.Types.ObjectId],
  notif:[String],
});

const User = module.exports = mongoose.model('User', UserSchema);
