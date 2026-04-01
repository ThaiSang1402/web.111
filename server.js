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
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Balancer Demo</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 3em;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .info-card {
            background: rgba(255,255,255,0.2);
            border-radius: 15px;
            padding: 30px;
            margin: 20px 0;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            font-size: 1.2em;
        }
        .label {
            font-weight: bold;
            opacity: 0.8;
        }
        .value {
            font-family: 'Courier New', monospace;
            background: rgba(0,0,0,0.2);
            padding: 5px 10px;
            border-radius: 5px;
        }
        .buttons {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            padding: 12px 24px;
            margin: 10px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1.1em;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .status {
            text-align: center;
            font-size: 1.5em;
            margin: 20px 0;
        }
        .online {
            color: #4CAF50;
            text-shadow: 0 0 10px #4CAF50;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        .pulse {
            animation: pulse 2s infinite;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Load Balancer</h1>
            <p>Hệ thống cân bằng tải & Auto Scaling</p>
        </div>
        
        <div class="status online pulse">
            ● SYSTEM ONLINE
        </div>
        
        <div class="info-card">
            <div class="info-row">
                <span class="label">Instance ID:</span>
                <span class="value">${INSTANCE_ID}</span>
            </div>
            <div class="info-row">
                <span class="label">Server:</span>
                <span class="value">Render-${Math.random().toString(36).substring(2, 7)}</span>
            </div>
            <div class="info-row">
                <span class="label">Uptime:</span>
                <span class="value">${Math.floor(process.uptime())} seconds</span>
            </div>
            <div class="info-row">
                <span class="label">Timestamp:</span>
                <span class="value">${new Date().toLocaleString('vi-VN')}</span>
            </div>
            <div class="info-row">
                <span class="label">Environment:</span>
                <span class="value">${process.env.NODE_ENV || 'development'}</span>
            </div>
        </div>
        
        <div class="buttons">
            <a href="/health" class="btn">🏥 Health Check</a>
            <a href="/load" class="btn">⚡ Load Test</a>
            <a href="/metrics" class="btn">📊 Metrics</a>
            <button class="btn" onclick="location.reload()">🔄 Refresh</button>
        </div>
        
        <div class="info-card">
            <h3>🔄 Test Load Balancing</h3>
            <p>Refresh trang này nhiều lần để thấy các instance khác nhau phản hồi. Mỗi lần refresh, bạn có thể thấy Instance ID hoặc Server ID thay đổi.</p>
            
            <h3>📈 Monitoring</h3>
            <p>Hệ thống thu thập metrics về performance, response time, và số lượng requests để monitoring và auto-scaling.</p>
        </div>
    </div>
    
    <script>
        setTimeout(() => {
            const refreshBtn = document.querySelector('button');
            if (refreshBtn) {
                refreshBtn.style.background = 'rgba(76, 175, 80, 0.3)';
                refreshBtn.innerHTML = '🔄 Auto Refresh in 10s';
            }
        }, 5000);
    </script>
</body>
</html>
  `);
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello from Load Balanced App!',
    instance: INSTANCE_ID,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    server: `Render-${Math.random().toString(36).substring(2, 7)}`
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