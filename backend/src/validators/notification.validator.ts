import { param, query, ValidationChain } from "express-validator";

/** Validates `:id` route param is a well-formed MongoDB ObjectId. */
export const notificationIdValidator = (): ValidationChain =>
  param("id")
    .isMongoId()
    .withMessage("Invalid notification id");

/** Validates optional pagination query params (`page`, `limit`). */
export const paginationValidators = (): ValidationChain[] => [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),
];

