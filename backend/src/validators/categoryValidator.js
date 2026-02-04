const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().trim().required()
    .messages({
      'string.empty': 'Le nom est requis',
      'any.required': 'Le nom est requis'
    }),
  type: Joi.string().valid('income', 'expense').required()
    .messages({
      'any.only': 'Le type doit être "income" ou "expense"',
      'any.required': 'Le type est requis'
    })
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim(),
  type: Joi.string().valid('income', 'expense')
}).min(1);

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
