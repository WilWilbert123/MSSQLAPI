require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/dbConfig');
const visaRoutes = require('./routes/visaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for the other system to access this API
app.use(express.json({ type: '*/*' })); // Force parse incoming payloads as JSON even if Content-Type header is missing

// Log all incoming requests so they appear in pm2 logs
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Connect to the database
connectDB();

const requireApiKey = require('./middleware/authMiddleware');

// Apply API Key protection globally to all routes (including the root health check)
app.use(requireApiKey);

// API Routes
app.use('/api/visa-transactions', visaRoutes);

// Basic health check route (now protected)
app.get('/', (req, res) => {
    res.json({ message: 'MSSQL Web Service is running.' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
