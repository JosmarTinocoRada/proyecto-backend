const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const path = require('path');
const mongoose = require('mongoose'); // Integrar Mongoose

const app = express();
const PORT = 8080;

// Conectar a MongoDB Atlas
const uri = "mongodb+srv://desuv3:desuawa1@projectback1.x9d5d.mongodb.net/?retryWrites=true&w=majority&appName=projectback1";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error al conectar a MongoDB Atlas:', err));

// Configuración de Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const { router: productsRouter, initSocket: initProductSocket } = require('./routes/products');
const cartsRouter = require('./routes/carts');
const { router: viewsRouter, initSocket: initViewSocket } = require('./routes/viewsrouter');


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/viewsrouter', viewsRouter);


const server = createServer(app);
const io = new Server(server);


io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('newProduct', (product) => {
        io.emit('productAdded', product);
    });

    socket.on('deleteProduct', (productId) => {
        io.emit('productDeleted', productId);
    });
});

// Inicializar el socket en los routers
initProductSocket(io);
initViewSocket(io);

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
