const Joi = require("joi");

const passwordSchema = Joi.string()
  .min(8)
  .max(16)
  .pattern(/[A-Z]/)
  .pattern(/[@$!%*?&]/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter and one special character (@$!%*?&)",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must not exceed 16 characters",
  });

const emailSchema = Joi.string().email().required().messages({
  "string.email": "Must be a valid email",
});

// User registration validation
exports.validateSignUp = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(20).max(60).required().messages({
      "string.min": "Name must be at least 20 characters",
      "string.max": "Name must not exceed 60 characters",
    }),
    email: emailSchema,
    password: passwordSchema,
    address: Joi.string().max(400).required().messages({
      "string.max": "Address must not exceed 400 characters",
    }),
  });
  return schema.validate(data);
};

// User login validation
exports.validateLogin = (data) => {
  const schema = Joi.object({
    email: emailSchema,
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

// Store creation validation
exports.validateStoreCreation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(20).max(60).required().messages({
      "string.min": "Store name must be at least 20 characters",
      "string.max": "Store name must not exceed 60 characters",
    }),
    email: emailSchema,
    address: Joi.string().max(400).required().messages({
      "string.max": "Address must not exceed 400 characters",
    }),
    owner_id: Joi.number().required(),
  });
  return schema.validate(data);
};

// Rating validation
exports.validateRating = (data) => {
  const schema = Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      "number.min": "Rating must be between 1 and 5",
      "number.max": "Rating must be between 1 and 5",
    }),
  });
  return schema.validate(data);
};

// Password update validation
exports.validatePasswordUpdate = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: passwordSchema,
  });
  return schema.validate(data);
};

// User creation by admin
exports.validateUserCreation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(20).max(60).required(),
    email: emailSchema,
    password: passwordSchema,
    address: Joi.string().max(400).required(),
    role: Joi.string().valid("admin", "user", "store_owner").required(),
  });
  return schema.validate(data);
};
