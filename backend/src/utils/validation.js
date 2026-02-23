const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors.array().map(err => ({ field: err.param, message: err.msg }))
        });
    }
    next();
};

// Auth validators
const validateLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 2, max: 50 }).withMessage('Username must be 2-50 characters'),
    handleValidationErrors
];

// Mood validators
const validateMoodEntry = [
    body('date')
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
    body('moodLevel')
        .isInt({ min: 1, max: 5 }).withMessage('Mood level must be between 1 and 5'),
    body('note')
        .optional()
        .isLength({ max: 1000 }).withMessage('Note cannot exceed 1000 characters'),
    handleValidationErrors
];

// Reminder validators
const validateReminderCreation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    body('category')
        .trim()
        .isIn(['medication', 'supplement', 'appointment', 'water', 'exercise'])
        .withMessage('Invalid category'),
    body('time')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
    body('repeatType')
        .optional()
        .isIn(['none', 'daily', 'specific-days']).withMessage('Invalid repeat type'),
    body('repeatDays')
        .optional()
        .isArray().withMessage('Repeat days must be an array')
        .custom(days => {
            if (Array.isArray(days)) {
                return days.every(d => Number.isInteger(d) && d >= 0 && d <= 6);
            }
            return false;
        }).withMessage('Repeat days must be integers 0-6'),
    body('description')
        .optional()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    handleValidationErrors
];

const validateReminderUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    body('category')
        .optional()
        .trim()
        .isIn(['medication', 'supplement', 'appointment', 'water', 'exercise'])
        .withMessage('Invalid category'),
    body('time')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
    body('repeatType')
        .optional()
        .isIn(['none', 'daily', 'specific-days']).withMessage('Invalid repeat type'),
    body('description')
        .optional()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    handleValidationErrors
];

const validateDoseLogging = [
    body('status')
        .trim()
        .isIn(['taken', 'skipped', 'snoozed', 'pending']).withMessage('Invalid status'),
    body('date')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
    handleValidationErrors
];

// Group validators
const validateGroupCreation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Group name is required')
        .isLength({ min: 1, max: 100 }).withMessage('Group name must be 1-100 characters'),
    handleValidationErrors
];

const validateGroupJoin = [
    body('inviteCode')
        .trim()
        .notEmpty().withMessage('Invite code is required')
        .isLength({ min: 1, max: 20 }).withMessage('Invalid invite code format'),
    handleValidationErrors
];

// Post validators
const validatePostCreation = [
    body('content')
        .trim()
        .notEmpty().withMessage('Post content is required')
        .isLength({ min: 1, max: 5000 }).withMessage('Post content must be 1-5000 characters'),
    body('type')
        .optional()
        .isIn(['text', 'fitness']).withMessage('Invalid post type'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateLogin,
    validateMoodEntry,
    validateReminderCreation,
    validateReminderUpdate,
    validateDoseLogging,
    validateGroupCreation,
    validateGroupJoin,
    validatePostCreation
};
