const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const salasActivas = new Set();


app.use(express.static('client'));

const usuariosPorSala = {}; // { sala: { socketId: nombre } }

io.on('connection', (socket) => {
  console.log('🔌 Nuevo socket conectado:', socket.id);
  let salaActual = null;

  socket.on('usuario:login', ({ nombre, sala }) => {
    const nombreNormalizado = nombre.trim().toLowerCase();

    usuariosPorSala[sala] ||= {};

    // Validar duplicado
    const yaExiste = Object.values(usuariosPorSala[sala]).some(u => u.toLowerCase() === nombreNormalizado);
    if (yaExiste || !nombre) {
      socket.emit('login:error', 'Nombre en uso o inválido en esa sala.');
      return;
    }
    salasActivas.add(sala);
    io.emit('salas:lista', Array.from(salasActivas)); // actualiza a todos

    socket.on('salas:pedir', () => {
        socket.emit('salas:lista', Array.from(salasActivas));
      });
          
    // Asignar sala
    usuariosPorSala[sala][socket.id] = nombre;
    salaActual = sala;

    socket.join(sala);
    console.log(`🟢 ${nombre} entró a sala #${sala}`);

    // Enviar lista de usuarios actualizada a esa sala
    io.to(sala).emit('usuarios:lista', Object.values(usuariosPorSala[sala]));
  });

  socket.on('chat:mensaje', ({ usuario, mensaje, sala }) => {
    io.to(sala).emit('chat:mensaje', { usuario, mensaje });
  });

  socket.on('chat:privado', ({ de, para, mensaje, sala }) => {
    const usuariosEnSala = usuariosPorSala[sala];
    if (!usuariosEnSala) return;
  
    // Buscar socket ID del destinatario
    const destinoSocketId = Object.keys(usuariosEnSala).find(id => usuariosEnSala[id] === para);
    
    if (destinoSocketId) {
      io.to(destinoSocketId).emit('chat:privado', { de, mensaje });
    }
  });
  

  socket.on('disconnect', () => {
    if (salaActual && usuariosPorSala[salaActual]) {
      delete usuariosPorSala[salaActual][socket.id];
      io.to(salaActual).emit('usuarios:lista', Object.values(usuariosPorSala[salaActual]));
      console.log(`❌ Usuario salió de sala #${salaActual}`);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ SIGECOR escuchando en http://localhost:${PORT}`);
});
