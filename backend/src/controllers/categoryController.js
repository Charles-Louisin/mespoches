const Category = require('../models/Category');
const { createCategorySchema, updateCategorySchema } = require('../validators/categoryValidator');

class CategoryController {
  async createCategory(req, res, next) {
    try {
      const { error, value } = createCategorySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const category = new Category(value);
      await category.save();
      
      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req, res, next) {
    try {
      const filter = {};
      if (req.query.type) {
        filter.type = req.query.type;
      }

      const categories = await Category.find(filter).sort({ name: 1 });
      
      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const category = await Category.findById(req.params.id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie introuvable'
        });
      }
      
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const { error, value } = updateCategorySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        value,
        { new: true, runValidators: true }
      );
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie introuvable'
        });
      }
      
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie introuvable'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Catégorie supprimée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
