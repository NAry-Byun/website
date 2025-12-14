class User {
  constructor(data) {
    this.id = data.id || null;
    this.email = data.email;
    this.name = data.name;
    this.password = data.password;
    this.user_type = data.user_type || 'customer';
    this.address = data.address || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validate required fields
  validate() {
    const errors = [];

    if (!this.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    if (!this.name) {
      errors.push('Name is required');
    }

    if (!this.password) {
      errors.push('Password is required');
    }

    if (!this.user_type) {
      errors.push('User type is required');
    } else if (!['customer', 'admin'].includes(this.user_type)) {
      errors.push('User type must be either "customer" or "admin"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Update timestamp
  updateTimestamp() {
    this.updatedAt = new Date().toISOString();
  }

  // Convert to plain object for database storage
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      password: this.password,
      user_type: this.user_type,
      address: this.address,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create from database object
  static fromJSON(data) {
    return new User(data);
  }
}

module.exports = User;
