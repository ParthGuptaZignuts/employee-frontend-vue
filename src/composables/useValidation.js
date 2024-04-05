export const validateEmail = value => {
  if (!value) {
    return 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Email must be valid.';
  }
  
  return true;
}

export const validatePassword = value => {
  if (!value) {
    return 'Password is required.';
  }
  
  return true;
}

export const validationRules = {
  email: [validateEmail],
  password: [validatePassword],
};