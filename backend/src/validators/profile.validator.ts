import { body, ValidationChain, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

/** Reusable chain: fullName must be a non-empty, trimmed string. */
export const validateFullName = (): ValidationChain =>
  body("fullName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name cannot be empty")
    .isLength({ min: 2, max: 50 })
    .withMessage("Full name must be between 2 and 50 characters");

/** Reusable chain: username must be unique-safe and correctly formatted. */
export const validateUsername = (): ValidationChain =>
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers and underscores");

/** Reusable chain: bio is optional, trimmed, max 300 chars. */
export const validateBio = (): ValidationChain =>
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Bio cannot exceed 300 characters");

/** Reusable chain: country is optional, trimmed, max 100 chars. */
export const validateCountry = (): ValidationChain =>
  body("country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Country cannot exceed 100 characters");

/** All editable profile fields for PUT /api/profile. */
export const updateProfileValidators: ValidationChain[] = [
  validateFullName(),
  validateUsername(),
  validateBio(),
  validateCountry(),
];

/**
 * Express-validator results checker. Returns a 400 with the first error if
 * validation failed, otherwise calls next().
 */
export const validateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    throw new ApiError(400, first.msg, errors.array());
  }

  next();
};

