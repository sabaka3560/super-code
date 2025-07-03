// In-memory storage for the app
let files = null;

// Default files that reset when server restarts
const defaultFiles = [
  {
    id: 'sample-js',
    name: 'example.js',
    content: `// JavaScript Example
function greetUser(name) {
  console.log(\`Hello, \${name}! Welcome to our code sharing app.\`);
  
  // Calculate user stats
  const stats = {
    filesShared: Math.floor(Math.random() * 50),
    lastVisit: new Date().toISOString(),
    isActive: true
  };
  
  return stats;
}

// Usage
const userStats = greetUser('Developer');
console.log('User stats:', userStats);

// Array methods example
const languages = ['JavaScript', 'Python', 'Java', 'C++', 'Go'];
const webLanguages = languages.filter(lang => 
  ['JavaScript', 'Python'].includes(lang)
);

console.log('Web languages:', webLanguages);

// Async/await example
async function fetchData() {
  try {
    const response = await fetch('/api/files');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}`,
    language: 'javascript',
    extension: '.js',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-py',
    name: 'example.py',
    content: `# Python Example
import datetime
import random
import json

def analyze_data(data_list):
    """Analyze a list of numbers and return statistics."""
    if not data_list:
        return {"error": "No data provided"}
    
    stats = {
        "count": len(data_list),
        "sum": sum(data_list),
        "average": sum(data_list) / len(data_list),
        "min": min(data_list),
        "max": max(data_list),
        "timestamp": datetime.datetime.now().isoformat()
    }
    
    return stats

# Generate sample data
sample_data = [random.randint(1, 100) for _ in range(10)]
print(f"Sample data: {sample_data}")

# Analyze the data
results = analyze_data(sample_data)
print(f"Analysis results: {json.dumps(results, indent=2)}")

# Class example
class CodeFile:
    def __init__(self, name, language):
        self.name = name
        self.language = language
        self.created_at = datetime.datetime.now()
        self.lines = 0
    
    def count_lines(self, content):
        self.lines = len(content.split('\\n'))
        return self.lines
    
    def __str__(self):
        return f"{self.name} ({self.language}) - {self.lines} lines"

# Usage
file = CodeFile("example.py", "Python")
print(f"Created file: {file}")

# List comprehension example
squares = [x**2 for x in range(1, 11) if x % 2 == 0]
print(f"Even squares: {squares}")`,
    language: 'python',
    extension: '.py',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-css',
    name: 'styles.css',
    content: `/* Modern CSS Example - Dark Theme */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e293b;
  --accent-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --border-color: #334155;
  --border-radius: 8px;
  --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --transition: all 0.2s ease;
}

/* Base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
}

/* Modern button styles */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  box-shadow: var(--shadow);
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: #334155;
  color: var(--text-primary);
}

.btn-danger {
  background: var(--error-color);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Card component */
.card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  transition: var(--transition);
}

.card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

.card-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* Form styles */
.form-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: var(--transition);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #64748b;
}

/* Grid system */
.grid {
  display: grid;
  gap: 1rem;
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease;
}

.slide-in {
  animation: slideIn 0.3s ease;
}

/* Utility classes */
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }

.p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }

.m-2 { margin: 0.5rem; }
.m-4 { margin: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.mt-4 { margin-top: 1rem; }

.w-full { width: 100%; }
.h-full { height: 100%; }
.min-h-screen { min-height: 100vh; }

.rounded { border-radius: var(--border-radius); }
.shadow { box-shadow: var(--shadow); }

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}`,
    language: 'css',
    extension: '.css',
    createdAt: new Date().toISOString()
  }
];

// Initialize or reset storage
function initializeStorage() {
  if (!files) {
    files = [...defaultFiles];
  }
  return files;
}

// Get all files
function getFiles() {
  return initializeStorage();
}

// Get file by ID
function getFile(id) {
  const allFiles = getFiles();
  return allFiles.find(file => file.id === id);
}

// Create new file
function createFile(fileData) {
  const allFiles = getFiles();
  const newFile = {
    id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    ...fileData
  };
  allFiles.push(newFile);
  return newFile;
}

// Update file
function updateFile(id, updates) {
  const allFiles = getFiles();
  const index = allFiles.findIndex(file => file.id === id);
  if (index !== -1) {
    allFiles[index] = { ...allFiles[index], ...updates };
    return allFiles[index];
  }
  return null;
}

// Delete file
function deleteFile(id) {
  const allFiles = getFiles();
  const index = allFiles.findIndex(file => file.id === id);
  if (index !== -1) {
    const deletedFile = allFiles.splice(index, 1)[0];
    return deletedFile;
  }
  return null;
}

// Get file extension and determine language
function getLanguageFromExtension(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'kt': 'kotlin',
    'swift': 'swift',
    'css': 'css',
    'scss': 'scss',
    'html': 'html',
    'xml': 'xml',
    'json': 'json',
    'md': 'markdown',
    'sql': 'sql',
    'sh': 'bash',
    'yml': 'yaml',
    'yaml': 'yaml'
  };
  return languageMap[ext] || 'text';
}

module.exports = {
  getFiles,
  getFile,
  createFile,
  updateFile,
  deleteFile,
  getLanguageFromExtension,
  initializeStorage
};