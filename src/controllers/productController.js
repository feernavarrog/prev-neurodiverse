// src/controllers/productController.js

const productModel = require('../models/productModel');

// ==============================
// Controlador para manejo de PRODUCT (Productos)
// ==============================

// Obtener todos los productos con filtro opcional
exports.getProducts = async (req, res) => {
    try {
        const filter = req.body;
        const products = await productModel.getProducts(filter);
        res.json(products);
    } catch (error) {
        res.json({ error: error.message });
    }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    try {
        const product = req.body;
        await productModel.createProduct(product);
        res.json({ message: 'Producto creado correctamente.' });
    } catch (error) {
        res.json({ error: error.message });
    }
};

// Actualizar un producto existente
exports.updateProduct = async (req, res) => {
    try {
        const product = req.body;
        await productModel.updateProduct(product);
        res.json({ message: 'Producto actualizado correctamente.' });
    } catch (error) {
        res.json({ error: error.message });
    }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        await productModel.deleteProduct(productId);
        res.json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
        res.json({ error: error.message });
    }
};
