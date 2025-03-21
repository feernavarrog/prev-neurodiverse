// src/controllers/userController.js
const userModel = require('../models/userModel');
const database = require('./../services/database');
const jwt = require("jsonwebtoken"); // Para decodificar el token de Google
const bcrypt = require('bcrypt'); // Asegúrate de tener esta línea arriba del archivo

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
        const user = { ...req.body };

        // 🔐 Si tiene contraseña (no es null), cifrarla antes de enviarla al modelo
        if (user.password) {
            const saltRounds = 10;
            user.password = await bcrypt.hash(user.password, saltRounds);
        }

        const newUser = await userModel.createUser(user);
        res.json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = { ...req.body };

        // Solo cifrar si la contraseña fue cambiada (no es un hash)
        /*if (user.password && !user.password.startsWith('$2b$')) {
            user.password = await bcrypt.hash(user.password, 10);
        }*/

        // 🔍 Obtener la contraseña actual desde la base de datos
        const result = await userModel.getUsers({ column: "user_id", value: user.user_id });

        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        const currentPasswordHash = result.rows[0][3]; // Contraseña actual en la BD

        // 🔐 Si la contraseña cambió, se vuelve a hashear
        if (user.password && user.password !== currentPasswordHash) {
            user.password = await bcrypt.hash(user.password, 10);
        }

        const updatedUser = await userModel.updateUser(user);
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
        /*f (password !== storedPassword) {
            return res.status(401).json({ error: "Contraseña incorrecta." });
        }*/

        // 🔐 Comparar la contraseña ingresada con el hash almacenado

        // ✅ Omitir hash si es usuario de test
        const isTestUser = /^test\d+@/.test(email);
        const isAdmin = userData[14] === 'admin';

        let isMatch = false;

        if (isTestUser || isAdmin) {
            // Comparación directa para test (por ejemplo, test1@neuro.com con clave 123)
            isMatch = password === storedPassword;
        } else {
            // 🔐 Validación real con bcrypt
            isMatch = await bcrypt.compare(password, storedPassword);
        }

        //const isMatch = await bcrypt.compare(password, storedPassword);

        if (!isMatch) {
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

exports.autoLogin = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email es requerido." });
        }

        // Buscar usuario en la base de datos
        const userResult = await userModel.getUsers({ column: "email", value: email });

        if (!userResult.rows || userResult.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // Extraer datos del usuario
        const userData = userResult.rows[0];

        // Guardar sesión en el backend
        req.session.user = {
            userId: userData[0],
            email: userData[2],
            role: userData[14] // 'customer' o 'admin'
        };

        return res.json({
            message: "Sesión iniciada automáticamente.",
            userId: userData[0],
            role: userData[14]
        });

    } catch (error) {
        console.error("Error en el auto-login:", error);
        return res.status(500).json({ error: "Error interno en la autenticación." });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "Error al cerrar sesión." });
            }
            res.clearCookie('connect.sid'); // 🔹 Borra la cookie de sesión
            return res.json({ message: "Sesión cerrada correctamente." });
        });
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        return res.status(500).json({ error: "Error interno al cerrar sesión." });
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
