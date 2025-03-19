// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ==============================
// Rutas para manejo de APP_USER
// ==============================

router.post('/', userController.getUsers);
router.post('/create', userController.createUser);
router.put('/update', userController.updateUser);
router.delete('/delete/:id', userController.deleteUser);

// ==============================
// Rutas para manejo de USER_CONDITION
// ==============================

// Obtener todas las condiciones asociadas a un usuario
router.get('/conditions/:userId', userController.getUserConditions);

// Asignar una condición a un usuario
router.post('/conditions', userController.assignUserCondition);

// Eliminar una condición de un usuario
router.delete('/conditions', userController.removeUserCondition);

// ==============================
// Rutas de autenticación
// ==============================

// Ruta para manejar el login con Google
router.post("/auth/callback", userController.googleAuth);

// Ruta para manejar el login con email y contraseña
router.post('/auth/login', userController.normalLogin);

module.exports = router;