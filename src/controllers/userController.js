// src/controllers/userController.js
const userModel = require('../models/userModel');
const database = require('./../services/database');
const jwt = require("jsonwebtoken"); // Para decodificar el token de Google

// ==============================
// Controlador para manejo de APP_USER
// ==============================

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

exports.normalLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que se envíen ambos datos
        if (!email || !password) {
            return res.status(400).json({ error: "Email y contraseña son requeridos." });
        }

        // Buscar usuario por email usando el método getUsers(filter)
        const userResult = await userModel.getUsers({ column: "email", value: email });

        if (!userResult.rows || userResult.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Extraer datos del usuario
        const userData = userResult.rows[0];
        const storedPassword = userData[3]; // Contraseña almacenada en la BD
        const isActive = userData[13]; // Estado de cuenta (activo o inactivo)

        // Si el usuario está inactivo, impedir acceso
        if (isActive === 0) {
            return res.status(403).json({ error: "Cuenta inactiva. Contacta al soporte." });
        }

        // Comparar contraseñas directamente (sin hash)
        if (password !== storedPassword) {
            return res.status(401).json({ error: "Contraseña incorrecta." });
        }

        // Guardar sesión del usuario en el backend
        req.session.user = {
            userId: userData[0],
            email: userData[2],
            role: userData[14] // 'customer' o 'admin'
        };

        // Enviar los datos del usuario al frontend (sin la contraseña)
        return res.json({
            userId: userData[0],
            rut: userData[1],
            email: userData[2],
            firstName: userData[4],
            lastName: userData[5],
            birthDate: userData[6],
            city: userData[7],
            district: userData[8],
            street: userData[9],
            streetNumber: userData[10],
            mobilePhone: userData[11],
            additionalInfo: userData[12],
            active: isActive,
            role: userData[14],
        });

    } catch (error) {
        console.error("Error en la autenticación normal:", error);
        return res.status(500).json({ error: "Error interno en la autenticación." });
    }
};


exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: "Credencial no proporcionada." });
        }

        // Decodificar la credencial de Google
        const decoded = jwt.decode(credential);
        if (!decoded || !decoded.email) {
            return res.status(400).json({ error: "Error al decodificar la credencial." });
        }

        const email = decoded.email;

        // 🔹 Buscar usuario en la base de datos usando el método de userModel
        const userResult = await userModel.getUsers({ column: "email", value: email });

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: email });
        }

        // 🔹 Extraer datos del usuario
        const userData = userResult.rows[0];
        const storedPassword = userData[3]; // Contraseña en la BD
        const isActive = userData[13]; // Estado de cuenta (activo o inactivo)

        // Si el usuario está inactivo, impedir acceso
        if (isActive === 0) {
            return res.status(403).json({ error: "Cuenta inactiva. Contacta al soporte." });
        }

        // 🔹 Validar si la contraseña NO es NULL (registro normal)
        if (storedPassword !== null) {
            return res.status(403).json({ error: "Debes iniciar sesión con usuario y contraseña." });
        }

        // Guardar sesión del usuario en el backend
        req.session.user = {
            userId: userData[0],
            email: userData[2],
            role: userData[14] // 'customer' o 'admin'
        };

        // 🔹 Usuario autenticado correctamente con Google, devolver los datos
        return res.json({
            userId: userData[0],
            rut: userData[1],
            email: userData[2],
            firstName: userData[4],
            lastName: userData[5],
            birthDate: userData[6],
            city: userData[7],
            district: userData[8],
            street: userData[9],
            streetNumber: userData[10],
            mobilePhone: userData[11],
            additionalInfo: userData[12],
            active: userData[13],
            role: userData[14],
            googleAuth: true
        });

    } catch (error) {
        console.error("Error en la autenticación con Google:", error);
        return res.status(500).json({ error: "Error interno en la autenticación." });
    }
};

// ==============================
// Controlador para manejo de USER_CONDITION
// ==============================

// Obtener todas las condiciones asociadas a un usuario
exports.getUserConditions = async (req, res) => {
    try {
        const { userId } = req.params;
        const conditions = await userModel.getUserConditions(userId);
        res.json(conditions);
    } catch (error) {
        res.json({ error: error.message });
    }
};

// Asignar una condición a un usuario
exports.assignUserCondition = async (req, res) => {
    try {
        const { userId, conditionId } = req.body;
        await userModel.assignUserCondition(userId, conditionId);
        res.json({ message: 'Condición asignada correctamente.' });
    } catch (error) {
        res.json({ error: error.message });
    }
};

// Eliminar una condición de un usuario
exports.removeUserCondition = async (req, res) => {
    try {
        const { userId, conditionId } = req.body;
        await userModel.removeUserCondition(userId, conditionId);
        res.json({ message: 'Condición eliminada correctamente.' });
    } catch (error) {
        res.json({ error: error.message });
    }
};
