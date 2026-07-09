const express = require('express');
const cors = require('cors');
const computerRoutes = require('./routes/computerRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '1.0.0',
        service: 'Computer Room Management API',
        timestamp: new Date()
    });
});

// API Routes
app.use('/api/computers', computerRoutes);

module.exports = app;
