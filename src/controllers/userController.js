// src/controllers/userController.js
const userModel = require('../models/userModel');

exports.getUsers = async (req, res) => {
    try {
        const users = await userModel.getUsers(req.body);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const newUser = await userModel.createUser(req.body);
        res.json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await userModel.updateUser(req.body);
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userModel.deleteUser(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};