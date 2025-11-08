import { Router } from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  deleteUserSchema,
} from "../schemas/user.schema.js";
import { validateSchema } from "../utils/validation.util.js";

const router = Router();

/**
 * @route   POST /api/users
 * @desc    Create a new user
 */
router.post("/", validateSchema(createUserSchema), createUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get a user by ID
 */
router.get("/:id", validateSchema(getUserSchema, "params"), getUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user information
 */
router.put("/:id", validateSchema(updateUserSchema), updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 */
router.delete("/:id", validateSchema(deleteUserSchema, "params"), deleteUser);

export default router;
