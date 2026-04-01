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
  const healthData = {
    status: 'healthy',
    instance: INSTANCE_ID,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid
  };
  
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Check - Load Balancer</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
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
        .status-indicator {
            text-align: center;
            margin: 30px 0;
        }
        .status-icon {
            font-size: 4em;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        .status-text {
            font-size: 2em;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .health-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .health-card {
            background: rgba(255,255,255,0.2);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .health-title {
            font-weight: bold;
            margin-bottom: 10px;
            opacity: 0.9;
        }
        .health-value {
            font-size: 1.3em;
            font-family: 'Courier New', monospace;
            background: rgba(0,0,0,0.2);
            padding: 8px 12px;
            border-radius: 8px;
            margin: 5px 0;
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
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status-indicator">
            <div class="status-icon">✅</div>
            <div class="status-text">SYSTEM HEALTHY</div>
            <p>All systems operational</p>
        </div>
        
        <div class="health-grid">
            <div class="health-card">
                <div class="health-title">🏷️ Instance ID</div>
                <div class="health-value">${healthData.instance}</div>
            </div>
            
            <div class="health-card">
                <div class="health-title">⏰ Timestamp</div>
                <div class="health-value">${new Date(healthData.timestamp).toLocaleString('vi-VN')}</div>
            </div>
            
            <div class="health-card">
                <div class="health-title">⏱️ Uptime</div>
                <div class="health-value">${Math.floor(healthData.uptime)} seconds</div>
            </div>
            
            <div class="health-card">
                <div class="health-title">🔢 Process ID</div>
                <div class="health-value">${healthData.pid}</div>
            </div>
            
            <div class="health-card">
                <div class="health-title">💾 Memory (Heap)</div>
                <div class="health-value">${Math.round(healthData.memory.heapUsed / 1024 / 1024)} MB</div>
            </div>
            
            <div class="health-card">
                <div class="health-title">📊 Memory (RSS)</div>
                <div class="health-value">${Math.round(healthData.memory.rss / 1024 / 1024)} MB</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="btn">🏠 Back to Home</a>
            <a href="/metrics" class="btn">📊 View Metrics</a>
            <a href="/load" class="btn">⚡ Load Test</a>
            <button class="btn" onclick="location.reload()">🔄 Refresh Health</button>
        </div>
        
        <div class="health-card" style="margin-top: 30px;">
            <div class="health-title">📋 Raw Health Data (JSON)</div>
            <div style="font-family: monospace; font-size: 0.9em; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; white-space: pre-wrap;">
${JSON.stringify(healthData, null, 2)}
            </div>
        </div>
    </div>
    
    <script>
        setTimeout(() => location.reload(), 15000); // Auto refresh every 15 seconds
    </script>
</body>
</html>
  `);
});

app.get('/metrics', (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
  } catch (error) {
    res.status(500).send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Metrics - Load Balancer</title>
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
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .metric-card {
            background: rgba(255,255,255,0.2);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .metric-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #4CAF50;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
        }
        .metric-desc {
            opacity: 0.8;
            font-size: 0.9em;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 System Metrics</h1>
            <p>Load Balancer Performance Dashboard</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-title">🚀 Instance Info</div>
                <div class="metric-value">${INSTANCE_ID}</div>
                <div class="metric-desc">Current Instance ID</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">⏱️ Uptime</div>
                <div class="metric-value">${Math.floor(process.uptime())}s</div>
                <div class="metric-desc">Server running time</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">💾 Memory Usage</div>
                <div class="metric-value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</div>
                <div class="metric-desc">Heap memory used</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">🔄 Process ID</div>
                <div class="metric-value">${process.pid}</div>
                <div class="metric-desc">System process identifier</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">🌐 Environment</div>
                <div class="metric-value">${process.env.NODE_ENV || 'dev'}</div>
                <div class="metric-desc">Runtime environment</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">📈 Node Version</div>
                <div class="metric-value">${process.version}</div>
                <div class="metric-desc">Node.js runtime version</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="btn">🏠 Back to Home</a>
            <a href="/health" class="btn">🏥 Health Check</a>
            <a href="/load" class="btn">⚡ Load Test</a>
            <button class="btn" onclick="location.reload()">🔄 Refresh Metrics</button>
        </div>
        
        <div class="metric-card" style="margin-top: 30px;">
            <div class="metric-title">📊 Raw Prometheus Metrics</div>
            <div style="font-family: monospace; font-size: 0.8em; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; white-space: pre-wrap; max-height: 300px; overflow-y: auto;">
Error loading metrics: ${error.message}
            </div>
        </div>
    </div>
    
    <script>
        setTimeout(() => location.reload(), 30000); // Auto refresh every 30 seconds
    </script>
</body>
</html>
    `);
  }
});

app.get('/load', (req, res) => {
  const start = Date.now();
  const iterations = 1000000; // Fixed iterations for consistent testing
  
  // Simulate CPU load
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i);
  }
  
  const duration = Date.now() - start;
  
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test - Load Balancer</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
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
        .load-indicator {
            text-align: center;
            margin: 30px 0;
        }
        .load-icon {
            font-size: 4em;
            margin-bottom: 20px;
            animation: spin 2s linear infinite;
        }
        .load-text {
            font-size: 2em;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .result-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .result-card {
            background: rgba(255,255,255,0.2);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .result-title {
            font-weight: bold;
            margin-bottom: 10px;
            opacity: 0.9;
        }
        .result-value {
            font-size: 1.5em;
            font-family: 'Courier New', monospace;
            background: rgba(0,0,0,0.2);
            padding: 10px 15px;
            border-radius: 8px;
            margin: 5px 0;
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
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .performance-bar {
            width: 100%;
            height: 20px;
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .performance-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #FFC107, #FF5722);
            border-radius: 10px;
            width: ${Math.min(duration / 10, 100)}%;
            transition: width 1s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="load-indicator">
            <div class="load-icon">⚡</div>
            <div class="load-text">LOAD TEST COMPLETED</div>
            <p>CPU intensive task finished</p>
        </div>
        
        <div class="result-grid">
            <div class="result-card">
                <div class="result-title">🏷️ Instance ID</div>
                <div class="result-value">${INSTANCE_ID}</div>
            </div>
            
            <div class="result-card">
                <div class="result-title">⏱️ Processing Time</div>
                <div class="result-value">${duration}ms</div>
                <div class="performance-bar">
                    <div class="performance-fill"></div>
                </div>
            </div>
            
            <div class="result-card">
                <div class="result-title">🔢 Iterations</div>
                <div class="result-value">${iterations.toLocaleString()}</div>
            </div>
            
            <div class="result-card">
                <div class="result-title">📊 Result</div>
                <div class="result-value">${Math.floor(result).toLocaleString()}</div>
            </div>
            
            <div class="result-card">
                <div class="result-title">💾 Memory After</div>
                <div class="result-value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</div>
            </div>
            
            <div class="result-card">
                <div class="result-title">🚀 Performance</div>
                <div class="result-value">${duration < 100 ? 'Excellent' : duration < 500 ? 'Good' : 'Needs Optimization'}</div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="btn">🏠 Back to Home</a>
            <a href="/health" class="btn">🏥 Health Check</a>
            <a href="/metrics" class="btn">📊 View Metrics</a>
            <button class="btn" onclick="location.reload()">🔄 Run Again</button>
        </div>
        
        <div class="result-card" style="margin-top: 30px;">
            <div class="result-title">📈 Load Test Analysis</div>
            <p><strong>Test Type:</strong> CPU Intensive Mathematical Operations</p>
            <p><strong>Workload:</strong> ${iterations.toLocaleString()} square root calculations</p>
            <p><strong>Performance Rating:</strong> ${duration < 100 ? '🟢 Excellent (< 100ms)' : duration < 500 ? '🟡 Good (< 500ms)' : '🔴 Needs Optimization (> 500ms)'}</p>
            <p><strong>Recommendation:</strong> ${duration < 100 ? 'System performing optimally' : duration < 500 ? 'Consider scaling for higher loads' : 'Immediate optimization required'}</p>
        </div>
    </div>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server ${INSTANCE_ID} running on port ${PORT}`);
});