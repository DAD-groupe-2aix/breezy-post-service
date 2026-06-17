const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  authId: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 280,
    trim: true
  },
  likes: [
    {
      type: Number
    }
  ],
  comments: [
    {
      authId: { type: Number, required: true },
      text: { type: String, required: true, trim: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);