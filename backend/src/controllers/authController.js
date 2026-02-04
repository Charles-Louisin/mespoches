const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Générer JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

class AuthController {
  // Inscription
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'Un compte existe déjà avec cet email'
        });
      }

      // Créer l'utilisateur
      const user = await User.create({
        email,
        password,
        name
      });

      // Générer le token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Connexion
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Veuillez fournir un email et un mot de passe'
        });
      }

      // Récupérer l'utilisateur avec le mot de passe
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Vérifier le mot de passe
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Générer le token
      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Récupérer l'utilisateur connecté
  async getMe(req, res, next) {
    try {
      const user = await User.findById(req.user.id);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
