const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configuração de CORS para permitir requisições do React Native
app.use(cors());

// Configuração do diretório de uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Array em memória para armazenar os lugares
let places = [];

// Middleware para parsing de JSON
app.use(express.json());

// Servir arquivos estáticos (imagens) do diretório uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint para listar todos os lugares
app.get('/places', (req, res) => {
  res.json(places);
});

// Endpoint para criar um novo lugar
app.post('/places', upload.single('photo'), (req, res) => {
  const { name, description, latitude, longitude } = req.body;

  // Validação básica
  if (!name || !description || !latitude || !longitude) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, description, latitude, longitude' });
  }

  const newPlace = {
    _id: Date.now().toString(), // ID único baseado em timestamp
    name,
    description,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    photo: req.file ? `uploads/${req.file.filename}` : null,
  };

  places.push(newPlace);
  res.status(201).json(newPlace);
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});