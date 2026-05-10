const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

if (process.env.NODE_ENV === 'production') {
  const possibleBuildDirs = [
    path.join(__dirname, '..', 'frontend', 'build'),
    path.join(__dirname, '..', '..', 'frontend', 'build'),
    path.join(__dirname, 'frontend', 'build'),
    path.join(process.cwd(), 'frontend', 'build'),
  ];

  const frontendBuildPath = possibleBuildDirs.find((dir) => fs.existsSync(dir));

  if (!frontendBuildPath) {
    console.error('Frontend build directory not found. Searched paths:', possibleBuildDirs);
    throw new Error('Frontend build directory not found');
  }

  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

app.get('/api/ping', (req, res) => res.json({ message: 'Project manager API is alive' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
