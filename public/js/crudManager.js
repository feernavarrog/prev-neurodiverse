// public/js/crudManager.js
// Este archivo contiene las funciones para realizar fetch a las rutas de usuarios

async function fetchUsers(filter = {}) {
    const response = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter)
    });
    return response.json();
}

async function createUser(userData) {
    const response = await fetch('/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return response.json();
}

async function updateUser(userData) {
    const response = await fetch('/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return response.json();
}

async function deleteUser(userId) {
    const response = await fetch(`/users/delete/${userId}`, {
        method: 'DELETE'
    });
    return response.json();
}
