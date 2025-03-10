// src/models/userModel.js
const database = require('../services/database');


exports.getUsers = async (filter) => {
    let sql = 'SELECT * FROM app_user';
    const binds = [];
    if (filter && filter.column && filter.value) {
        sql += ` WHERE ${filter.column} = :value`;
        binds.push(filter.value);
    }
    return database.executeQuery(sql, binds);
};

exports.createUser = async (user) => {
    const sql = `INSERT INTO app_user (rut, email, user_password, first_name, last_name, birth_date, city, district, street, street_number, mobile_phone, additional_address_info, active, user_role)
                 VALUES (:rut, :email, :password, :first_name, :last_name, TO_DATE(:birth_date, 'YYYY-MM-DD'), :city, :district, :street, :street_number, :mobile_phone, :additional_address_info, :active, :user_role)`;
    return database.executeQuery(sql, Object.values(user));
};

exports.updateUser = async (user) => {
    const sql = `UPDATE app_user 
                 SET rut = :rut,
                     email = :email, 
                     user_password = :password,
                     first_name = :first_name, 
                     last_name = :last_name, 
                     birth_date = TO_DATE(:birth_date, 'YYYY-MM-DD'),
                     city = :city, 
                     district = :district, 
                     street = :street, 
                     street_number = :street_number, 
                     mobile_phone = :mobile_phone, 
                     additional_address_info = :additional_address_info, 
                     active = :active, 
                     user_role = :user_role
                 WHERE user_id = :user_id`;
    return database.executeQuery(sql, [
        user.rut,
        user.email,
        user.password,
        user.first_name,
        user.last_name,
        user.birth_date,
        user.city,
        user.district,
        user.street,
        user.street_number,
        user.mobile_phone,
        user.additional_address_info,
        user.active,
        user.user_role,
        user.user_id // El ID debe ser el último parámetro porque en la consulta está al final
    ]);
};

exports.deleteUser = async (userId) => {
    const sql = 'DELETE FROM app_user WHERE user_id = :id';
    return database.executeQuery(sql, [userId]);
};