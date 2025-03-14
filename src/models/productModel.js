// src/models/productModel.js

const database = require('../services/database');

// ==============================
// Funciones para manejo de PRODUCT (Productos)
// ==============================

// Obtener todos los productos con filtro opcional
exports.getProducts = async (filter) => {
    let sql = 'SELECT * FROM product';
    const binds = [];

    if (filter && filter.column && filter.value !== undefined) {
        const operator = filter.operator || '=';

        // 🔹 Si el operador es ">", "<", ">=", "<=", lo agregamos directamente en el SQL
        if (['>', '<', '>=', '<='].includes(operator)) {
            sql += ` WHERE ${filter.column} ${operator} ${filter.value}`;
        } else {
            sql += ` WHERE ${filter.column} ${operator} :value`;
            binds.push(filter.value);
        }
    }

    return database.executeQuery(sql, binds);
};

// Crear un nuevo producto
exports.createProduct = async (product) => {
    const sql = `INSERT INTO product (code, product_name, product_description, price, discount, stock, reference_photo, brand_id, category_id, active) 
                 VALUES (:code, :product_name, :product_description, :price, :discount, :stock, :reference_photo, :brand_id, :category_id, :active)`;
    return database.executeQuery(sql, [
        product.code,
        product.product_name,
        product.product_description,
        product.price,
        product.discount,
        product.stock,
        product.reference_photo,
        product.brand_id,
        product.category_id,
        product.active
    ]);
};

// Actualizar un producto existente
exports.updateProduct = async (product) => {
    const sql = `UPDATE product SET code = :code, product_name = :product_name, product_description = :product_description, price = :price, 
                                    discount = :discount, stock = :stock, reference_photo = :reference_photo, brand_id = :brand_id, category_id = :category_id, active = :active
                 WHERE product_id = :product_id`;
    return database.executeQuery(sql, [
        product.code,
        product.product_name,
        product.product_description,
        product.price,
        product.discount,
        product.stock,
        product.reference_photo,
        product.brand_id,
        product.category_id,
        product.active,
        product.product_id
    ]);
};

// Eliminar un producto (eliminando primero sus referencias en ORDER_PRODUCT y su imagen)
exports.deleteProduct = async (productId) => {    
    // Eliminar referencias en ORDER_PRODUCT antes de eliminar el producto
    const sqlDeleteReferences = `DELETE FROM order_product WHERE product_id = :productId`;
    await database.executeQuery(sqlDeleteReferences, [productId]);
    
    // Ahora eliminar el producto
    const sqlDeleteProduct = `DELETE FROM product WHERE product_id = :productId`;
    await database.executeQuery(sqlDeleteProduct, [productId]);
};
