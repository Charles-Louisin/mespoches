const Joi = require('joi');

const createIncomeSchema = Joi.object({
  amount: Joi.number().positive().required()
    .messages({
      'number.base': 'Le montant doit être un nombre',
      'number.positive': 'Le montant doit être positif',
      'any.required': 'Le montant est requis'
    }),
  wallet_id: Joi.string().required()
    .messages({
      'any.required': 'Le portefeuille est requis'
    }),
  category_id: Joi.string().allow(null, ''),
  description: Joi.string().allow(''),
  date: Joi.date().optional()
});

const createExpenseSchema = Joi.object({
  amount: Joi.number().positive().required()
    .messages({
      'number.base': 'Le montant doit être un nombre',
      'number.positive': 'Le montant doit être positif',
      'any.required': 'Le montant est requis'
    }),
  wallet_id: Joi.string().required()
    .messages({
      'any.required': 'Le portefeuille est requis'
    }),
  category_id: Joi.string().allow(null, ''),
  description: Joi.string().allow(''),
  date: Joi.date().optional()
});

const createTransferSchema = Joi.object({
  amount: Joi.number().positive().required()
    .messages({
      'number.base': 'Le montant doit être un nombre',
      'number.positive': 'Le montant doit être positif',
      'any.required': 'Le montant est requis'
    }),
  wallet_id: Joi.string().required()
    .messages({
      'any.required': 'Le portefeuille source est requis'
    }),
  destination_wallet_id: Joi.string().required()
    .messages({
      'any.required': 'Le portefeuille de destination est requis'
    }),
  description: Joi.string().allow(''),
  date: Joi.date().optional()
});

module.exports = {
  createIncomeSchema,
  createExpenseSchema,
  createTransferSchema
};
