const Post = require('../models/post.model');

// Fonction pour créer une nouvelle publication
exports.createPost = async (req, res) => {
  try {
    const { authId, content } = req.body;

    // Validation stricte du contenu
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Le contenu du message ne peut pas être vide." });
    }

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

// Fonction pour récupérer toutes les publications (Fil d'actualité global)
exports.getAllPosts = async (req, res) => {
  try {
    // On récupère les posts et on les trie du plus récent au plus ancien
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des publications.", error: error.message });
  }
};

// Fonction pour Liker / Unliker un post (Toggle)
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params; // L'ID du post à liker
    const { authId } = req.body; // L'ID de l'utilisateur qui clique sur "Like"

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Publication introuvable." });
    }

    // On vérifie si l'utilisateur a déjà liké le post
    const hasLiked = post.likes.includes(authId);

    if (hasLiked) {
      // S'il a déjà liké, on retire son authId du tableau
      post.likes = post.likes.filter(userId => userId !== authId);
      await post.save();
      return res.status(200).json({ message: "Like retiré !", post });
    } else {
      // S'il n'a pas liké, on ajoute son authId dans le tableau
      post.likes.push(authId);
      await post.save();
      return res.status(200).json({ message: "Post liké !", post });
    }

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la gestion du like.", error: error.message });
  }
};

// Fonction pour ajouter un commentaire à un post
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params; // L'ID du post à commenter
    const { authId, text } = req.body; // Qui commente, et quoi

    // Validation rapide du texte
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Le commentaire ne peut pas être vide." });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Publication introuvable." });
    }

    // On crée l'objet du commentaire
    const newComment = {
      authId,
      text
    };

    // On l'ajoute dans le tableau des commentaires du post
    post.comments.push(newComment);
    await post.save();

    res.status(201).json({ message: "Commentaire ajouté avec succès !", post });

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire.", error: error.message });
  }
};