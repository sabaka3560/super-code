const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api', apiRoutes);

// Main route
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Code Sharing App',
    description: 'Share code snippets across devices instantly'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('index', { 
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// For Vercel serverless functions
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`\n📝 Code Sharing App is ready!`);
  });
}

// Export for Vercel
module.exports = app;