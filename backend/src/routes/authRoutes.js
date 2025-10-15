import express from "express";
import {
  register,
  login,
  getMe,
  registerValidation,
  loginValidation,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import { validationResult } from "express-validator";

const router = express.Router();

// Validation error handling middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/me", protect, getMe);

export default router;
