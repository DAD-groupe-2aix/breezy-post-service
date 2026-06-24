const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');

// Créer un post
router.post('/', postController.createPost);

// Récupérer tous les posts (Fil global)
router.get('/', postController.getAllPosts);

// Récupérer les posts d'un utilisateur précis
router.get('/user/:authId', postController.getUserPosts);

// Modifier un post
router.put('/:id', postController.editPost);

// Supprimer un post
router.delete('/:id', postController.deletePost);

// Liker / Unliker un post
router.post('/:id/like', postController.likePost);

// Ajouter un commentaire
router.post('/:id/comment', postController.addComment);

router.post('/:id/comments/:commentId/like', postController.likeComment);


// Répondre à un commentaire spécifique (Ligne qui posait problème)
router.post('/:id/comments/:commentId/reply', postController.replyToComment);

// Route pour le fil d'actualité personnalisé
router.get('/feed/:authId', postController.getFeedPosts);
module.exports = router;