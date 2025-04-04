//? Este carga datos de forma dinamica en caso de ser necesario (por ejemplo funciones)

module.exports = {
    selectRandomSidebarCategory: function (context, events, done) {
      // Lista de categorías disponibles (debe coincidir con las categorías del sidebar)
      const categories = [
        { id: 1, name: "Aislamiento Auditivo" },
        { id: 2, name: "Entorno Suave" },
        { id: 3, name: "Gadgets" },
        { id: 4, name: "Próximamente" },
        { id: "discount", name: "Ir a Descuentos" },
      ];
  
      // Selecciona una categoría aleatoria
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      context.vars.selectedCategoryId = randomCategory.id; // ID de la categoría
      context.vars.selectedCategoryName = randomCategory.name; // Nombre de la categoría
      return done();
    },
  };