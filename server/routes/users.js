const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get all users
router.get('/', userController.getAllUsers);

// Get user by email
router.get('/email/:email', userController.getUserByEmail);

// Get user by id
router.get('/:id', userController.getUserById);

// Create new user
router.post('/', userController.createUser);

// Login user
router.post('/login', userController.loginUser);

// Update user (full update)
router.put('/:id', userController.updateUser);

// Partial update user
router.patch('/:id', userController.partialUpdateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
