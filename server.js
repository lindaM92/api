const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware para manejar datos JSON
app.use(bodyParser.json());

// Ruta para servir el archivo HTML
app.use(express.static('views'));

// Función para leer los usuarios desde el archivo JSON
const readUsers = () => {
  const data = fs.readFileSync('users.json', 'utf8');
  return JSON.parse(data || '[]');
};

// Función para guardar los usuarios en el archivo JSON
const saveUsers = (users) => {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
};

// Ruta de registro de usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  // Verifica si el usuario ya existe
  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: 'El usuario ya existe.' });
  }

  // Cifrar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  saveUsers(users);

  res.json({ message: 'Registro exitoso.' });
});

// Ruta de inicio de sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  // Verificar si el usuario existe
  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Usuario no encontrado.' });
  }

  // Verificar la contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Contraseña incorrecta.' });
  }

  res.json({ message: 'Autenticación satisfactoria.' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
