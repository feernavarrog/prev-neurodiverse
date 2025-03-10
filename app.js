const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./src/services/database');

const userRoutes = require('./src/routes/userRoutes');
//const productRoutes = require('./src/routes/productRoutes');

const app = express();

// Configuraciones
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static('public'));

// Servir archivos estáticos desde 'node_modules'
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));


app.use('/users', userRoutes); // Rutas de usuarios
//app.use('/products', productRoutes); // Rutas de productos

// RUTAS NEURODIVERSE
app.get('/', (req, res) => {res.render('home');});  // Ruta inicial 
app.get('/register', (req, res) => {res.render('register');});
app.get('/products', (req, res) => {res.render('products');});
app.get('/item', (req, res) => {res.render('item');});
app.get('/checkout', (req, res) => {res.render('checkout');});
app.get('/account', (req, res) => {res.render('account');});
app.get('/account-settings', (req, res) => {res.render('account-settings');});
app.get('/orders', (req, res) => {res.render('orders');});
app.get('/admin-panel', (req, res) => {res.render('admin_panel');});
app.get('/admin/orders', (req, res) => {res.render('admin_orders');});
app.get('/admin/users', (req, res) => {res.render('admin_users');});
app.get('/admin/products', (req, res) => {res.render('admin_products');});
app.get('/testing', (req, res) => {res.render('testing');});
app.use((req, res, next) => {res.status(404).render('notFound');});

// Inicializar la base de datos
database.initialize();

// Manejador de señales para cierre adecuado de la base de datos
process.on('SIGINT', () => {
  database.close().then(() => {
    console.log('Base de datos cerrada correctamente');
    process.exit(0);
  }).catch(err => {
    console.error('Error al cerrar la base de datos:', err);
    process.exit(1);
  });
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Backend is running on http://localhost:3000');
});
