const express = require('express');
const server = express();
const morgan = require('morgan');
const cors = require('cors'); // permite la conexión con otros servidores

//settings 
server.set('port', process.env.PORT || 3000);
server.set('json spaces', 2); //ordenamos json

//middlewares
const corsOptions = {};
server.use(morgan('dev'));
server.use(express.json()); //entender formato json
server.use(express.urlencoded({extended: false})); //entender formulario simple:
server.use(cors(corsOptions));

//routes
server.use('/api',require('./routes/routes'));

//starting the server 
server.listen(server.get('port'), ()=>{
    console.log(`Server on port ${server.get('port')}`);
});