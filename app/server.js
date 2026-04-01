const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;
const INSTANCE_ID = process.env.INSTANCE_ID || 'unknown';

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'instance'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'instance'],
  registers: [register]
});

// Middleware for metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
      instance: INSTANCE_ID
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path,
      instance: INSTANCE_ID
    }, duration);
  });
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Load Balanced App!',
    instance: INSTANCE_ID,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    server: `Render-${Math.random().toString(36).substr(2, 5)}`
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    instance: INSTANCE_ID,
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});

app.get('/load', (req, res) => {
  // Simulate some CPU load
  const start = Date.now();
  while (Date.now() - start < 100) {
    Math.random();
  }
  
  res.json({
    message: 'Load test completed',
    instance: INSTANCE_ID,
    processingTime: '100ms'
  });
});

app.listen(PORT, () => {
  console.log(`Server ${INSTANCE_ID} running on port ${PORT}`);
});