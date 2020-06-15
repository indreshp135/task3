const mongoose = require('mongoose');

const InviteSchema = mongoose.Schema({
  header:String,
  content:String,
  footer:String,
  typeof:String,
  deadline:Date,
  host:String,
  atTime:Date,
});

const Invitations = module.exports = mongoose.model('Invitations', InviteSchema);