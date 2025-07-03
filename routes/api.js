const express = require('express');
const router = express.Router();
const { 
  getFiles, 
  getFile, 
  createFile, 
  updateFile, 
  deleteFile, 
  getLanguageFromExtension 
} = require('../storage');

// GET /api/files - Get all files
router.get('/files', (req, res) => {
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
router.post('/files', (req, res) => {
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
router.get('/files/:id', (req, res) => {
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
router.put('/files/:id', (req, res) => {
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
router.delete('/files/:id', (req, res) => {
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
router.get('/stats', (req, res) => {
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

module.exports = router;