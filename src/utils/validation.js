/**
 * Validation Utilities
 * 
 * Form validation functions for registration, login, and profile forms
 * Includes email format, password strength, and required field checks
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }

  // Optional: Add more strength requirements
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumber = /[0-9]/.test(password);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return { valid: true, message: '' };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} - { valid: boolean, message: string }
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return { valid: false, message: 'Username is required' };
  }

  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }

  if (username.length > 30) {
    return { valid: false, message: 'Username must be less than 30 characters' };
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate registration form
 * @param {Object} formData - Form data object
 * @returns {Object} - { valid: boolean, errors: Object }
 */
export const validateRegistration = (formData) => {
  const errors = {};

  // Username validation
  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.valid) {
    errors.username = usernameValidation.message;
  }

  // Email validation
  if (!formData.email || !formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message;
  }

  // Confirm password
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Level validation
  const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
  if (!validLevels.includes(formData.level)) {
    errors.level = 'Please select a valid experience level';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form
 * @param {Object} formData - Form data object
 * @returns {Object} - { valid: boolean, errors: Object }
 */
export const validateLogin = (formData) => {
  const errors = {};

  if (!formData.email || !formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validation Utilities Explanation:
 * 
 * These functions provide client-side form validation:
 * - Email format validation using regex
 * - Password strength requirements
 * - Username format and length validation
 * - Complete form validation for registration and login
 * 
 * Returns validation results with error messages for inline display.
 * Can be extended with additional rules as needed.
 */
