const { z } = require('zod');

const createUserSchema = z.object({
  username: z.string().min(1, { message: 'username is required' }),
  email: z.string().email({ message: 'invalid email' }),
  password: z.string().min(6, { message: 'password must be at least 6 characters' }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  groups: z.array(z.string()).optional()
});

const updateUserSchema = createUserSchema.partial();

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  req.body = result.data;
  next();
};

module.exports = {
  validateCreateUser: validate(createUserSchema),
  validateUpdateUser: validate(updateUserSchema)
};
