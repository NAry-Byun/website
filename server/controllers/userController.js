const { containers } = require('../config/cosmosdb');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const container = containers.users();
    const { resources: users } = await container.items
      .query('SELECT * FROM c')
      .fetchAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by id
const getUserById = async (req, res) => {
  try {
    const container = containers.users();
    const { resource: user } = await container.item(req.params.id, req.query.email).read();

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by email
const getUserByEmail = async (req, res) => {
  try {
    const container = containers.users();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [
        {
          name: '@email',
          value: req.params.email
        }
      ]
    };

    const { resources: users } = await container.items
      .query(querySpec)
      .fetchAll();

    if (users.length > 0) {
      res.json(users[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const container = containers.users();

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);

    // Create User instance
    const user = new User({
      id: req.body.id || Date.now().toString(),
      email: req.body.email,
      name: req.body.name,
      password: hashedPassword,
      user_type: req.body.user_type,
      address: req.body.address
    });

    // Validate user data
    const validation = user.validate();
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Check if email already exists
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [
        {
          name: '@email',
          value: user.email
        }
      ]
    };

    const { resources: existingUsers } = await container.items
      .query(querySpec)
      .fetchAll();

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Create user in database
    const { resource: createdUser } = await container.items.create(user.toJSON());

    // Remove password from response
    const { password, ...userWithoutPassword } = createdUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user (full update)
const updateUser = async (req, res) => {
  try {
    const container = containers.users();
    const { resource: existingUser } = await container.item(req.params.id, req.body.email).read();

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash password if it's being updated
    let updatedPassword = existingUser.password;
    if (req.body.password !== undefined) {
      updatedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    }

    // Create updated user instance
    const updatedUserData = {
      ...existingUser,
      name: req.body.name !== undefined ? req.body.name : existingUser.name,
      password: updatedPassword,
      user_type: req.body.user_type !== undefined ? req.body.user_type : existingUser.user_type,
      address: req.body.address !== undefined ? req.body.address : existingUser.address
    };

    const user = new User(updatedUserData);

    // Validate updated data
    const validation = user.validate();
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Update timestamp
    user.updateTimestamp();

    const { resource: result } = await container.item(req.params.id, user.email).replace(user.toJSON());

    // Remove password from response
    const { password, ...userWithoutPassword } = result;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Partial update user
const partialUpdateUser = async (req, res) => {
  try {
    const container = containers.users();

    // Get email from query or body
    const email = req.query.email || req.body.email;
    if (!email) {
      return res.status(400).json({ error: 'Email is required in query or body' });
    }

    const { resource: existingUser } = await container.item(req.params.id, email).read();

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash password if it's being updated
    let hashedPassword = existingUser.password;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    }

    // Only update provided fields
    const updatedUserData = {
      ...existingUser,
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.password && { password: hashedPassword }),
      ...(req.body.user_type && { user_type: req.body.user_type }),
      ...(req.body.address !== undefined && { address: req.body.address })
    };

    const user = new User(updatedUserData);

    // Validate updated data
    const validation = user.validate();
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Update timestamp
    user.updateTimestamp();

    const { resource: result } = await container.item(req.params.id, user.email).replace(user.toJSON());

    // Remove password from response
    const { password, ...userWithoutPassword } = result;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const container = containers.users();

    if (!req.query.email) {
      return res.status(400).json({ error: 'Email is required in query parameter' });
    }

    await container.item(req.params.id, req.query.email).delete();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const container = containers.users();
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: '이메일과 비밀번호를 입력해주세요',
        success: false
      });
    }

    // Find user by email
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [
        {
          name: '@email',
          value: email
        }
      ]
    };

    const { resources: users } = await container.items
      .query(querySpec)
      .fetchAll();

    if (users.length === 0) {
      return res.status(401).json({
        error: '이메일 또는 비밀번호가 올바르지 않습니다. 다시 시도해주세요.',
        success: false
      });
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: '이메일 또는 비밀번호가 올바르지 않습니다. 다시 시도해주세요.',
        success: false
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        user_type: user.user_type
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: `${user.name}님, 환영합니다!`,
      user: userWithoutPassword,
      token: token
    });
  } catch (error) {
    res.status(500).json({
      error: '로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
      success: false
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  partialUpdateUser,
  deleteUser,
  loginUser
};
