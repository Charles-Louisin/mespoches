require('dotenv').config();
const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const Category = require('../models/Category');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connecté');
  } catch (error) {
    console.error('Erreur de connexion:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Supprimer les données existantes
    await Wallet.deleteMany({});
    await Category.deleteMany({});
    console.log('Données existantes supprimées');

    // Créer les portefeuilles
    const wallets = await Wallet.insertMany([
      { name: 'Espèces', currency: 'XAF', current_balance: 0 },
      { name: 'Mobile Money', currency: 'XAF', current_balance: 0 },
      { name: 'Compte Bancaire', currency: 'XAF', current_balance: 0 },
      { name: 'Carte', currency: 'XAF', current_balance: 0 }
    ]);
    console.log('Portefeuilles créés:', wallets.length);

    // Créer les catégories de revenus
    const incomeCategories = await Category.insertMany([
      { name: 'Salaire', type: 'income' },
      { name: 'Freelance', type: 'income' },
      { name: 'Investissements', type: 'income' },
      { name: 'Cadeaux', type: 'income' },
      { name: 'Autre revenu', type: 'income' }
    ]);
    console.log('Catégories de revenus créées:', incomeCategories.length);

    // Créer les catégories de dépenses
    const expenseCategories = await Category.insertMany([
      { name: 'Alimentation', type: 'expense' },
      { name: 'Transport', type: 'expense' },
      { name: 'Logement', type: 'expense' },
      { name: 'Santé', type: 'expense' },
      { name: 'Éducation', type: 'expense' },
      { name: 'Loisirs', type: 'expense' },
      { name: 'Vêtements', type: 'expense' },
      { name: 'Services', type: 'expense' },
      { name: 'Communication', type: 'expense' },
      { name: 'Autre dépense', type: 'expense' }
    ]);
    console.log('Catégories de dépenses créées:', expenseCategories.length);

    console.log('✅ Seed terminé avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du seed:', error);
    process.exit(1);
  }
};

connectDB().then(() => seedData());
