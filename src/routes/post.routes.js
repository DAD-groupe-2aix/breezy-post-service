const express = require('express');
const router = express.Router();

// On importe le contrôleur du service de publication
const postController = require('../controllers/post.controller');

// Route pour créer un post -> POST http://localhost:3002/api/posts
router.post('/', postController.createPost);

// Route pour récupérer tous les posts -> GET http://localhost:3002/api/posts
router.get('/', postController.getAllPosts);

// Route pour liker/unliker un post -> PUT http://localhost:3002/api/posts/:id/like
router.put('/:id/like', postController.likePost);

// Route pour ajouter un commentaire -> POST http://localhost:3002/api/posts/:id/comment
router.post('/:id/comment', postController.addComment);
module.exports = router;