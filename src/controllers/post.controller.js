const axios = require('axios');
const Post = require('../models/post.model');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Fx3. Fonction pour créer une nouvelle publication (avec vérification utilisateur, statut de modération et limite)
exports.createPost = async (req, res) => {
  try {
    const { authId, content } = req.body;

    // 1. Coup de fil au User Service pour vérifier si l'utilisateur existe
    let userProfile;
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/profile/${authId}`);
      userProfile = response.data; // On récupère l'objet profil de l'utilisateur
    } catch (error) {
      return res.status(400).json({ 
        message: "Action impossible : l'utilisateur n'existe pas dans le User Service." 
      });
    }

    // --- SÉCURITÉ : VÉRIFICATION DU STATUT DE MODÉRATION (Fx21) ---
    if (userProfile && (userProfile.status === 'suspended' || userProfile.status === 'banned')) {
      return res.status(403).json({ 
        message: `Action impossible : votre compte est actuellement ${userProfile.status}.` 
      });
    }
    // -----------------------------------------------------------------

    // 2. Validation si le contenu est vide
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Le contenu du message ne peut pas être vide." });
    }

    // 3. Validation de la limite des 280 caractères (Consigne Fx3)
    if (content.length > 280) {
      return res.status(400).json({ 
        message: `Le message est trop long (${content.length} caractères). La limite est de 280 caractères.` 
      });
    }

    // 4. Création et sauvegarde si tout est OK
    const newPost = new Post({
      authId,
      content
    });

    await newPost.save();
    res.status(201).json({ message: "Publication créée avec succès !", post: newPost });

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de la publication.", error: error.message });
  }
};

// Fx5. Fonction pour récupérer toutes les publications (Fil d'actualité global)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des publications.", error: error.message });
  }
};

// Fx6. Fonction pour Liker / Unliker un post (Toggle)
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params; 
    const { authId } = req.body; 

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Publication introuvable." });
    }

    const hasLiked = post.likes.includes(authId);

    if (hasLiked) {
      post.likes = post.likes.filter(userId => userId !== authId);
      await post.save();
      return res.status(200).json({ message: "Like retiré !", post });
    } else {
      post.likes.push(authId);
      await post.save();
      return res.status(200).json({ message: "Post liké !", post });
    }

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la gestion du like.", error: error.message });
  }
};

// Fx7. Fonction pour ajouter un commentaire à un post
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params; 
    const { authId, text } = req.body; 

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Le commentaire ne peut pas être vide." });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Publication introuvable." });
    }

    const newComment = {
      authId,
      text
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({ message: "Commentaire ajouté avec succès !", post });

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire.", error: error.message });
  }
};
// Liker / Unliker un commentaire (Toggle)
exports.likeComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { authId } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Publication introuvable." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable." });
    }

    const hasLiked = comment.likes.includes(authId);
    if (hasLiked) {
      comment.likes = comment.likes.filter((userId) => userId !== authId);
    } else {
      comment.likes.push(authId);
    }

    await post.save();
    res.status(200).json({ message: hasLiked ? "Like retiré !" : "Commentaire liké !", post });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la gestion du like.", error: error.message });
  }
};


// Fx4 / Fx11. Récupérer toutes les publications d'un utilisateur spécifique
exports.getUserPosts = async (req, res) => {
  try {
    const { authId } = req.params; 

    const posts = await Post.find({ authId: authId }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération des publications de l'utilisateur.", 
      error: error.message 
    });
  }
};

// Fx8. Fonction pour répondre à un commentaire spécifique sur un post
exports.replyToComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; 
    const { authId, text } = req.body;    

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "La réponse ne peut pas être vide." });
    }

    if (text.length > 280) {
      return res.status(400).json({ message: "La réponse est trop longue (max 280 caractères)." });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Publication introuvable." });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable." });
    }

    const newReply = {
      authId,
      text
    };

    comment.replies.push(newReply);
    await post.save();

    res.status(201).json({ message: "Réponse ajoutée avec succès !", post });

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout de la réponse.", error: error.message });
  }
};

// Supprimer un post (réservé à son auteur)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = parseInt(req.headers['x-user-id']);

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Publication introuvable." });
    }

    if (post.authId !== requesterId) {
      return res.status(403).json({ message: "Vous ne pouvez supprimer que vos propres publications." });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Publication supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression.", error: error.message });
  }
};

// Fx5. Récupérer le fil d'actualité personnalisé (les posts des utilisateurs suivis)
exports.getFeedPosts = async (req, res) => {
  try {
    const { authId } = req.params; 

    // 1. On demande le profil au User Service pour récupérer ses abonnements (following)
    let following = [];
    try {
      const userResponse = await axios.get(`${USER_SERVICE_URL}/api/users/profile/${authId}`);
      following = userResponse.data.following || []; 
    } catch (error) {
      return res.status(404).json({ message: "Impossible de récupérer les abonnements de l'utilisateur." });
    }

    // 2. On crée la liste des comptes à afficher : les abonnements + l'utilisateur lui-même
    const targetUserIds = [...following, parseInt(authId)];

    // 3. On cherche tous les posts dont l'authId est dans notre liste, triés par le plus récent
    const feedPosts = await Post.find({ authId: { $in: targetUserIds } }).sort({ createdAt: -1 });

    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la génération du fil d'actualité.", error: error.message });
  }
};