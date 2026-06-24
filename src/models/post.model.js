const mongoose = require('mongoose');

// Sous-schéma pour les réponses aux commentaires (Fx8)
const ReplySchema = new mongoose.Schema({
  authId: { 
    type: Number, 
    required: true 
  },
  text: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 280 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

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
  editedAt: {
    type: Date,
    default: null
  },
  likes: [
    {
      type: Number
    }
  ],
    comments: [
    {
      authId: { type: Number, required: true },
      text: { type: String, required: true, trim: true, maxlength: 280 },
      likes: [{ type: Number }],
      createdAt: { type: Date, default: Date.now },
      replies: [ReplySchema]
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);