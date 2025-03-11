function formatDate(fechaISO) {
    if (fechaISO.includes('/')) {
        return fechaISO; // Si ya está en formato DD/MM/YYYY, no convertir
    }
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateInput(fechaISO) {
    return fechaISO.split("T")[0]; // Formato YYYY-MM-DD para inputs tipo date
}

function formatDateToDB(dateString) {
    const parts = dateString.split("/");
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convierte DD/MM/YYYY a YYYY-MM-DD
    }
    return dateString; // Devuelve el mismo valor si ya está en YYYY-MM-DD
}