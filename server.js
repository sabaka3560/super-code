const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Import storage functions directly
const { 
  getFiles, 
  getFile, 
  createFile, 
  updateFile, 
  deleteFile, 
  getLanguageFromExtension 
} = require('./storage');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// API Routes - Inline for Vercel compatibility
// GET /api/files - Get all files
app.get('/api/files', (req, res) => {
  try {
    const files = getFiles();
    res.json({ 
      success: true, 
      files,
      count: files.length,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get files' 
    });
  }
});

// POST /api/files - Create new file
app.post('/api/files', (req, res) => {
  try {
    const { name, content } = req.body;
    
    if (!name || content === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and content are required' 
      });
    }

    const language = getLanguageFromExtension(name);
    const extension = '.' + name.split('.').pop();
    
    const newFile = createFile({
      name: name.trim(),
      content: content || '',
      language,
      extension
    });
    
    res.status(201).json({ 
      success: true, 
      file: newFile,
      message: 'File created successfully'
    });
  } catch (error) {
    console.error('Error creating file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create file' 
    });
  }
});

// GET /api/files/:id - Get specific file
app.get('/api/files/:id', (req, res) => {
  try {
    const { id } = req.params;
    const file = getFile(id);
    
    if (!file) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }
    
    res.json({ 
      success: true, 
      file 
    });
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get file' 
    });
  }
});

// PUT /api/files/:id - Update file
app.put('/api/files/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If updating name, also update language
    if (updates.name) {
      updates.language = getLanguageFromExtension(updates.name);
      updates.extension = '.' + updates.name.split('.').pop();
    }
    
    const updatedFile = updateFile(id, updates);
    
    if (!updatedFile) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }
    
    res.json({ 
      success: true, 
      file: updatedFile,
      message: 'File updated successfully'
    });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update file' 
    });
  }
});

// DELETE /api/files/:id - Delete file
app.delete('/api/files/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deletedFile = deleteFile(id);
    
    if (!deletedFile) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'File deleted successfully',
      deletedFile
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete file' 
    });
  }
});

// GET /api/stats - Get server statistics
app.get('/api/stats', (req, res) => {
  try {
    const files = getFiles();
    const stats = {
      totalFiles: files.length,
      totalCharacters: files.reduce((sum, file) => sum + file.content.length, 0),
      languages: [...new Set(files.map(file => file.language))],
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    res.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get stats' 
    });
  }
});

// Main route
app.get('/', (req, res) => {
  try {
    res.render('index', {
      title: 'Code Sharing App',
      description: 'Share code snippets across devices instantly'
    });
  } catch (error) {
    console.error('Error rendering index:', error);
    res.status(500).send('Error loading page');
  }
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
  try {
    res.status(404).render('index', {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist'
    });
  } catch (error) {
    res.status(404).send('Page not found');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// For local development only
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at:`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`\n📝 Code Sharing App is ready!`);
  });
}

// Export for Vercel
module.exports = app;
