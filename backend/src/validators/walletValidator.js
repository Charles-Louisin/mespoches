const Joi = require('joi');

const createWalletSchema = Joi.object({
  name: Joi.string().trim().required()
    .messages({
      'string.empty': 'Le nom est requis',
      'any.required': 'Le nom est requis'
    }),
  currency: Joi.string().trim().default('XAF')
});

const updateWalletSchema = Joi.object({
  name: Joi.string().trim(),
  currency: Joi.string().trim()
}).min(1);

module.exports = {
  createWalletSchema,
  updateWalletSchema
};
