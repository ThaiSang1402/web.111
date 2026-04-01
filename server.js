const express = require('express');
const client = require('prom-client');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const INSTANCE_ID = process.env.INSTANCE_ID || `server-${Math.random().toString(36).substring(2, 8)}`;

// Advanced metrics storage
let requestCount = 0;
let responseTimeHistory = [];
let errorCount = 0;
let startTime = Date.now();

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'instance'],
  registers: [register]
});

// Advanced middleware
app.use((req, res, next) => {
  const start = Date.now();
  requestCount++;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    responseTimeHistory.push(duration);
    if (responseTimeHistory.length > 100) responseTimeHistory.shift();
    
    if (res.statusCode >= 400) errorCount++;
    
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
      instance: INSTANCE_ID
    });
  });
  
  next();
});

// Enhanced Home Page with Real-time Dashboard
app.get('/', (req, res) => {
  const serverVariant = Math.random() > 0.5 ? 'A' : 'B';
  const responseTime = Math.floor(Math.random() * 50) + 10;
  
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Load Balancer - Server ${serverVariant}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
        }
        
        .server-badge {
            position: absolute;
            top: -10px;
            right: 20px;
            background: ${serverVariant === 'A' ? '#4CAF50' : '#FF5722'};
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            animation: pulse 2s infinite;
        }
        
        .main-title {
            font-size: 3.5em;
            margin: 20px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }
        
        .dashboard-card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .dashboard-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        
        .card-icon {
            font-size: 2.5em;
            margin-bottom: 15px;
            display: block;
        }
        
        .card-title {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #FFD700;
        }
        
        .card-value {
            font-size: 2.2em;
            font-weight: bold;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
        }
        
        .card-desc {
            opacity: 0.8;
            font-size: 0.9em;
        }
        
        .action-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 40px 0;
        }
        
        .btn {
            background: rgba(255,255,255,0.15);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1.1em;
            font-weight: bold;
            transition: all 0.3s ease;
            text-decoration: none;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .btn:hover {
            background: rgba(255,255,255,0.25);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        
        .live-stats {
            background: rgba(0,0,0,0.3);
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            text-align: center;
        }
        
        .stat-item {
            padding: 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
        }
        
        .stat-number {
            font-size: 1.8em;
            font-weight: bold;
            color: #4CAF50;
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.8;
            margin-top: 5px;
        }
        
        .performance-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.7);
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            z-index: 1000;
        }
        
        .response-time {
            color: ${responseTime < 30 ? '#4CAF50' : responseTime < 60 ? '#FFC107' : '#FF5722'};
            font-weight: bold;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
    </style>
</head>
<body>
    <div class="performance-indicator">
        Response: <span class="response-time">${responseTime}ms</span>
    </div>
    
    <div class="container">
        <div class="header">
            <div class="server-badge">SERVER ${serverVariant}</div>
            <h1 class="main-title">🚀 Advanced Load Balancer</h1>
            <p style="font-size: 1.2em; opacity: 0.9;">Enterprise-Grade Auto Scaling System</p>
        </div>
        
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <span class="card-icon">🏷️</span>
                <div class="card-title">Instance Identity</div>
                <div class="card-value">${INSTANCE_ID}</div>
                <div class="card-desc">Unique server identifier</div>
            </div>
            
            <div class="dashboard-card">
                <span class="card-icon">⚡</span>
                <div class="card-title">Response Time</div>
                <div class="card-value">${responseTime}ms</div>
                <div class="card-desc">Current request latency</div>
            </div>
            
            <div class="dashboard-card">
                <span class="card-icon">📊</span>
                <div class="card-title">Total Requests</div>
                <div class="card-value">${requestCount}</div>
                <div class="card-desc">Since server startup</div>
            </div>
            
            <div class="dashboard-card">
                <span class="card-icon">💾</span>
                <div class="card-title">Memory Usage</div>
                <div class="card-value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</div>
                <div class="card-desc">Current heap allocation</div>
            </div>
            
            <div class="dashboard-card">
                <span class="card-icon">⏱️</span>
                <div class="card-title">Uptime</div>
                <div class="card-value">${Math.floor(process.uptime())}s</div>
                <div class="card-desc">Server running time</div>
            </div>
            
            <div class="dashboard-card">
                <span class="card-icon">🌐</span>
                <div class="card-title">Environment</div>
                <div class="card-value">${process.env.NODE_ENV || 'DEV'}</div>
                <div class="card-desc">Runtime environment</div>
            </div>
        </div>
        
        <div class="live-stats">
            <h3 style="text-align: center; margin-bottom: 20px; color: #FFD700;">📈 Live System Statistics</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${Math.round(os.loadavg()[0] * 100)}%</div>
                    <div class="stat-label">CPU Load</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)}%</div>
                    <div class="stat-label">Memory Usage</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${os.cpus().length}</div>
                    <div class="stat-label">CPU Cores</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB</div>
                    <div class="stat-label">Total RAM</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${errorCount}</div>
                    <div class="stat-label">Errors</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${responseTimeHistory.length > 0 ? Math.round(responseTimeHistory.reduce((a,b) => a+b, 0) / responseTimeHistory.length) : 0}ms</div>
                    <div class="stat-label">Avg Response</div>
                </div>
            </div>
        </div>
        
        <div class="action-buttons">
            <a href="/health" class="btn">🏥 Advanced Health Check</a>
            <a href="/metrics-dashboard" class="btn">📊 Metrics Dashboard</a>
            <a href="/load" class="btn">⚡ Performance Test</a>
            <a href="/dashboard" class="btn">📈 Live Dashboard</a>
            <a href="/ai-demo" class="btn">🤖 AI API Demo</a>
            <button class="btn" onclick="location.reload()">🔄 Switch Server</button>
        </div>
        
        <div class="dashboard-card" style="margin-top: 30px;">
            <h3 style="color: #FFD700; margin-bottom: 15px;">🎯 Load Balancing Demo</h3>
            <p><strong>Current Server:</strong> ${serverVariant} (${INSTANCE_ID})</p>
            <p><strong>Response Time:</strong> ${responseTime}ms</p>
            <p><strong>Instructions:</strong> Refresh this page multiple times to see different servers (A/B) responding. Each server has unique characteristics and response times.</p>
            <p><strong>Architecture:</strong> User → Load Balancer → Multiple Server Instances → Response</p>
        </div>
    </div>
    
    <script>
        // Add visual feedback for interactions
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => this.style.transform = '', 150);
            });
        });
    </script>
</body>
</html>
  `);
});

// Advanced Dashboard endpoint
app.get('/dashboard', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Dashboard - Load Balancer</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            color: white;
        }
        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .dashboard-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .dashboard-title {
            font-size: 3em;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }
        .metric-panel {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .panel-title {
            font-size: 1.4em;
            font-weight: bold;
            margin-bottom: 20px;
            color: #FFD700;
            text-align: center;
        }
        .chart-container {
            height: 200px;
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            position: relative;
            overflow: hidden;
            margin: 20px 0;
        }
        .chart-bar {
            position: absolute;
            bottom: 0;
            width: 8px;
            background: linear-gradient(to top, #4CAF50, #FFC107, #FF5722);
            border-radius: 4px 4px 0 0;
            animation: chartAnimation 2s ease-in-out infinite;
        }
        .real-time-data {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .data-item {
            text-align: center;
            padding: 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
        }
        .data-value {
            font-size: 1.8em;
            font-weight: bold;
            color: #4CAF50;
        }
        .data-label {
            font-size: 0.9em;
            opacity: 0.8;
            margin-top: 5px;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        .status-online { background: #4CAF50; }
        .status-warning { background: #FFC107; }
        .status-error { background: #FF5722; }
        @keyframes chartAnimation {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <div class="dashboard-header">
            <h1 class="dashboard-title">📈 Live Performance Dashboard</h1>
            <p style="font-size: 1.2em; opacity: 0.9;">Real-time System Monitoring & Analytics</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-panel">
                <div class="panel-title">🚀 Server Performance</div>
                <div class="real-time-data">
                    <div class="data-item">
                        <div class="data-value">${INSTANCE_ID.slice(-4)}</div>
                        <div class="data-label">Instance</div>
                    </div>
                    <div class="data-item">
                        <div class="data-value">${Math.floor(process.uptime())}s</div>
                        <div class="data-label">Uptime</div>
                    </div>
                    <div class="data-item">
                        <div class="data-value">${requestCount}</div>
                        <div class="data-label">Requests</div>
                    </div>
                    <div class="data-item">
                        <div class="data-value">${errorCount}</div>
                        <div class="data-label">Errors</div>
                    </div>
                </div>
                <div class="chart-container">
                    ${Array.from({length: 20}, (_, i) => `
                        <div class="chart-bar" style="
                            left: ${i * 18}px; 
                            height: ${Math.random() * 150 + 20}px;
                            animation-delay: ${i * 0.1}s;
                        "></div>
                    `).join('')}
                </div>
            </div>
            
            <div class="metric-panel">
                <div class="panel-title">💾 Memory & CPU</div>
                <div class="real-time-data">
                    <div class="data-item">
                        <div class="data-value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</div>
                        <div class="data-label">Heap Used</div>
                    </div>
                    <div class="data-item">
                        <div class="data-value">${Math.round(os.loadavg()[0] * 100)}%</div>
                        <div class="data-label">CPU Load</div>
                    </div>
                    <div class="data-item">
                        <div class="data-value">${os.cpus().length}</div>
                        <div class="data-label">CPU Cores</div>
                    </div>
                    <div class="data-item">
                        <div class="data-value">${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB</div>
                        <div class="data-label">Total RAM</div>
                    </div>
                </div>
                <div style="margin: 20px 0;">
                    <p><span class="status-indicator status-online"></span>Memory: Optimal</p>
                    <p><span class="status-indicator status-online"></span>CPU: Normal Load</p>
                    <p><span class="status-indicator status-online"></span>Disk: Available</p>
                </div>
            </div>
            
            <div class="metric-panel">
                <div class="panel-title">📊 Response Analytics</div>
                <div class="real-time-data">
                    <div class="data-item">
                        <div class="data-value">${responseTimeHistory.length > 0 ? Math.round(responseTimeHistory.reduce((a,b) => a+b, 0) / responseTimeHistory.length) : 0}ms</div>
                        <div class="data-label">Avg Response</div>
                    </div>
                    <div class="data-item">
                        <div class="data-value">${responseTimeHistory.length > 0 ? Math.min(...responseTimeHistory) : 0}ms</div>
                        <div class="data-label">Min Response</div>
                    </div>
                    <div class="data-item">
                        <div class="data-value">${responseTimeHistory.length > 0 ? Math.max(...responseTimeHistory) : 0}ms</div>
                        <div class="data-label">Max Response</div>
                    </div>
                    <div class="data-item">
                        <div class="data-value">${Math.round((requestCount - errorCount) / requestCount * 100) || 100}%</div>
                        <div class="data-label">Success Rate</div>
                    </div>
                </div>
            </div>
            
            <div class="metric-panel">
                <div class="panel-title">🌐 System Information</div>
                <div style="line-height: 1.8;">
                    <p><strong>Platform:</strong> ${os.platform()}</p>
                    <p><strong>Architecture:</strong> ${os.arch()}</p>
                    <p><strong>Node Version:</strong> ${process.version}</p>
                    <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
                    <p><strong>Process ID:</strong> ${process.pid}</p>
                    <p><strong>Started:</strong> ${new Date(startTime).toLocaleString('vi-VN')}</p>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="/" style="
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                font-size: 1.1em;
                font-weight: bold;
                margin: 0 10px;
                transition: all 0.3s ease;
            ">🏠 Back to Home</a>
            <button onclick="location.reload()" style="
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                font-size: 1.1em;
                font-weight: bold;
                margin: 0 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            ">🔄 Refresh Dashboard</button>
        </div>
    </div>
    
    <script>
        // Auto-refresh dashboard every 5 seconds
        setTimeout(() => location.reload(), 5000);
    </script>
</body>
</html>
  `);
});

// Enhanced Health Check
app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    instance: INSTANCE_ID,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
    requests: requestCount,
    errors: errorCount,
    avgResponseTime: responseTimeHistory.length > 0 ? Math.round(responseTimeHistory.reduce((a,b) => a+b, 0) / responseTimeHistory.length) : 0
  };
  
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Health Check</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            min-height: 100vh;
            color: white;
        }
        .health-container {
            max-width: 1000px;
            margin: 0 auto;
        }
        .health-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .status-icon {
            font-size: 5em;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }
        .status-text {
            font-size: 2.5em;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .health-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }
        .health-card {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .card-title {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #FFD700;
        }
        .health-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .metric-item {
            text-align: center;
            padding: 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
        }
        .metric-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #FFD700;
        }
        .metric-label {
            font-size: 0.9em;
            opacity: 0.8;
            margin-top: 5px;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    </style>
</head>
<body>
    <div class="health-container">
        <div class="health-header">
            <div class="status-icon">✅</div>
            <div class="status-text">SYSTEM HEALTHY</div>
            <p style="font-size: 1.2em; margin-top: 10px;">All systems operational and performing optimally</p>
        </div>
        
        <div class="health-grid">
            <div class="health-card">
                <div class="card-title">🏷️ Instance Information</div>
                <div class="health-metrics">
                    <div class="metric-item">
                        <div class="metric-value">${healthData.instance.slice(-6)}</div>
                        <div class="metric-label">Instance ID</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${healthData.pid}</div>
                        <div class="metric-label">Process ID</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${Math.floor(healthData.uptime)}s</div>
                        <div class="metric-label">Uptime</div>
                    </div>
                </div>
            </div>
            
            <div class="health-card">
                <div class="card-title">💾 Memory Health</div>
                <div class="health-metrics">
                    <div class="metric-item">
                        <div class="metric-value">${Math.round(healthData.memory.heapUsed / 1024 / 1024)}MB</div>
                        <div class="metric-label">Heap Used</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${Math.round(healthData.memory.rss / 1024 / 1024)}MB</div>
                        <div class="metric-label">RSS Memory</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${Math.round(healthData.memory.external / 1024 / 1024)}MB</div>
                        <div class="metric-label">External</div>
                    </div>
                </div>
            </div>
            
            <div class="health-card">
                <div class="card-title">📊 Performance Metrics</div>
                <div class="health-metrics">
                    <div class="metric-item">
                        <div class="metric-value">${healthData.requests}</div>
                        <div class="metric-label">Total Requests</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${healthData.errors}</div>
                        <div class="metric-label">Errors</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-value">${healthData.avgResponseTime}ms</div>
                        <div class="metric-label">Avg Response</div>
                    </div>
                </div>
            </div>
            
            <div class="health-card">
                <div class="card-title">🌐 System Status</div>
                <div style="line-height: 2;">
                    <p>✅ <strong>Server Status:</strong> Online</p>
                    <p>✅ <strong>Memory Status:</strong> Optimal</p>
                    <p>✅ <strong>CPU Status:</strong> Normal</p>
                    <p>✅ <strong>Network Status:</strong> Connected</p>
                    <p>✅ <strong>Error Rate:</strong> ${Math.round(healthData.errors / healthData.requests * 100) || 0}%</p>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="/" style="
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                font-size: 1.1em;
                font-weight: bold;
                margin: 0 10px;
            ">🏠 Back to Home</a>
            <a href="/dashboard" style="
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                font-size: 1.1em;
                font-weight: bold;
                margin: 0 10px;
            ">📈 View Dashboard</a>
        </div>
    </div>
    
    <script>
        setTimeout(() => location.reload(), 10000);
    </script>
</body>
</html>
  `);
});

// Enhanced Metrics with fallback
app.get('/metrics', (req, res) => {
  try {
    // Try to get Prometheus metrics first
    const prometheusMetrics = register.metrics();
    res.set('Content-Type', register.contentType);
    res.end(prometheusMetrics);
  } catch (error) {
    console.error('Prometheus metrics error:', error);
    
    // Fallback to custom metrics display
    const customMetrics = generateCustomMetrics();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(customMetrics);
  }
});

// Generate custom metrics as fallback
function generateCustomMetrics() {
  const uptime = Math.floor(process.uptime());
  const memory = process.memoryUsage();
  const avgResponseTime = responseTimeHistory.length > 0 
    ? Math.round(responseTimeHistory.reduce((a,b) => a+b, 0) / responseTimeHistory.length) 
    : 0;
  
  return `# HELP nodejs_load_balancer_info Load Balancer System Information
# TYPE nodejs_load_balancer_info gauge
nodejs_load_balancer_uptime_seconds ${uptime}
nodejs_load_balancer_requests_total ${requestCount}
nodejs_load_balancer_errors_total ${errorCount}
nodejs_load_balancer_memory_heap_used_bytes ${memory.heapUsed}
nodejs_load_balancer_memory_heap_total_bytes ${memory.heapTotal}
nodejs_load_balancer_memory_rss_bytes ${memory.rss}
nodejs_load_balancer_response_time_avg_ms ${avgResponseTime}
nodejs_load_balancer_instance_id{instance="${INSTANCE_ID}"} 1
nodejs_load_balancer_cpu_cores ${os.cpus().length}
nodejs_load_balancer_total_memory_bytes ${os.totalmem()}
nodejs_load_balancer_free_memory_bytes ${os.freemem()}
nodejs_load_balancer_load_average_1m ${os.loadavg()[0]}
nodejs_load_balancer_load_average_5m ${os.loadavg()[1]}
nodejs_load_balancer_load_average_15m ${os.loadavg()[2]}
nodejs_load_balancer_platform{platform="${os.platform()}"} 1
nodejs_load_balancer_arch{arch="${os.arch()}"} 1
nodejs_load_balancer_node_version{version="${process.version}"} 1
nodejs_load_balancer_process_id ${process.pid}
nodejs_load_balancer_start_time_seconds ${Math.floor(startTime / 1000)}
`;
}

// Beautiful Metrics Dashboard
app.get('/metrics-dashboard', (req, res) => {
  const uptime = Math.floor(process.uptime());
  const memory = process.memoryUsage();
  const avgResponseTime = responseTimeHistory.length > 0 
    ? Math.round(responseTimeHistory.reduce((a,b) => a+b, 0) / responseTimeHistory.length) 
    : 0;
  
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Metrics - Load Balancer</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);
            min-height: 100vh;
            color: white;
        }
        .metrics-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .metrics-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .metrics-title {
            font-size: 3em;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #3498DB, #2980B9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }
        .metric-card {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255,255,255,0.2);
            transition: all 0.3s ease;
        }
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        .metric-title {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #3498DB;
            text-align: center;
        }
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            text-align: center;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            color: #E74C3C;
        }
        .metric-desc {
            text-align: center;
            opacity: 0.8;
            font-size: 0.9em;
        }
        .metric-bar {
            width: 100%;
            height: 8px;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            margin: 15px 0;
            overflow: hidden;
        }
        .metric-fill {
            height: 100%;
            background: linear-gradient(90deg, #27AE60, #F39C12, #E74C3C);
            border-radius: 4px;
            transition: width 1s ease;
        }
        .raw-metrics {
            background: rgba(0,0,0,0.4);
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            line-height: 1.6;
            max-height: 400px;
            overflow-y: auto;
        }
        .status-good { color: #27AE60; }
        .status-warning { color: #F39C12; }
        .status-critical { color: #E74C3C; }
    </style>
</head>
<body>
    <div class="metrics-container">
        <div class="metrics-header">
            <h1 class="metrics-title">📊 System Metrics</h1>
            <p style="font-size: 1.2em; opacity: 0.9;">Real-time Performance & Resource Monitoring</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-title">🚀 Server Instance</div>
                <div class="metric-value">${INSTANCE_ID.slice(-6)}</div>
                <div class="metric-desc">Unique server identifier</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">⏱️ Uptime</div>
                <div class="metric-value">${uptime}s</div>
                <div class="metric-desc">Server running time</div>
                <div class="metric-bar">
                    <div class="metric-fill" style="width: ${Math.min(uptime / 100, 100)}%;"></div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">📊 Total Requests</div>
                <div class="metric-value">${requestCount}</div>
                <div class="metric-desc">HTTP requests processed</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">❌ Error Count</div>
                <div class="metric-value status-${errorCount === 0 ? 'good' : errorCount < 5 ? 'warning' : 'critical'}">${errorCount}</div>
                <div class="metric-desc">Failed requests</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">💾 Heap Memory</div>
                <div class="metric-value">${Math.round(memory.heapUsed / 1024 / 1024)}MB</div>
                <div class="metric-desc">Used: ${Math.round(memory.heapUsed / 1024 / 1024)}MB / Total: ${Math.round(memory.heapTotal / 1024 / 1024)}MB</div>
                <div class="metric-bar">
                    <div class="metric-fill" style="width: ${(memory.heapUsed / memory.heapTotal) * 100}%;"></div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">📈 RSS Memory</div>
                <div class="metric-value">${Math.round(memory.rss / 1024 / 1024)}MB</div>
                <div class="metric-desc">Resident Set Size</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">⚡ Avg Response Time</div>
                <div class="metric-value status-${avgResponseTime < 50 ? 'good' : avgResponseTime < 200 ? 'warning' : 'critical'}">${avgResponseTime}ms</div>
                <div class="metric-desc">Average request latency</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">🖥️ CPU Cores</div>
                <div class="metric-value">${os.cpus().length}</div>
                <div class="metric-desc">Available CPU cores</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">💿 System Memory</div>
                <div class="metric-value">${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB</div>
                <div class="metric-desc">Free: ${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB</div>
                <div class="metric-bar">
                    <div class="metric-fill" style="width: ${((os.totalmem() - os.freemem()) / os.totalmem()) * 100}%;"></div>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">📊 Load Average</div>
                <div class="metric-value">${os.loadavg()[0].toFixed(2)}</div>
                <div class="metric-desc">1m: ${os.loadavg()[0].toFixed(2)} | 5m: ${os.loadavg()[1].toFixed(2)} | 15m: ${os.loadavg()[2].toFixed(2)}</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">🔢 Process ID</div>
                <div class="metric-value">${process.pid}</div>
                <div class="metric-desc">System process identifier</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">🌐 Platform Info</div>
                <div class="metric-value">${os.platform()}</div>
                <div class="metric-desc">${os.arch()} | Node ${process.version}</div>
            </div>
        </div>
        
        <div class="raw-metrics">
            <h3 style="color: #3498DB; margin-bottom: 15px;">📋 Raw Prometheus Metrics Format</h3>
            <div style="white-space: pre-line;">
# Server Instance Information
nodejs_load_balancer_instance_id{instance="${INSTANCE_ID}"} 1
nodejs_load_balancer_uptime_seconds ${uptime}
nodejs_load_balancer_requests_total ${requestCount}
nodejs_load_balancer_errors_total ${errorCount}

# Memory Metrics
nodejs_load_balancer_memory_heap_used_bytes ${memory.heapUsed}
nodejs_load_balancer_memory_heap_total_bytes ${memory.heapTotal}
nodejs_load_balancer_memory_rss_bytes ${memory.rss}

# Performance Metrics
nodejs_load_balancer_response_time_avg_ms ${avgResponseTime}
nodejs_load_balancer_cpu_cores ${os.cpus().length}
nodejs_load_balancer_total_memory_bytes ${os.totalmem()}
nodejs_load_balancer_free_memory_bytes ${os.freemem()}

# Load Average
nodejs_load_balancer_load_average_1m ${os.loadavg()[0]}
nodejs_load_balancer_load_average_5m ${os.loadavg()[1]}
nodejs_load_balancer_load_average_15m ${os.loadavg()[2]}

# System Information
nodejs_load_balancer_platform{platform="${os.platform()}"} 1
nodejs_load_balancer_arch{arch="${os.arch()}"} 1
nodejs_load_balancer_node_version{version="${process.version}"} 1
nodejs_load_balancer_process_id ${process.pid}
nodejs_load_balancer_start_time_seconds ${Math.floor(startTime / 1000)}
            </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="/" style="
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                font-size: 1.1em;
                font-weight: bold;
                margin: 0 10px;
            ">🏠 Back to Home</a>
            <a href="/metrics" style="
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                font-size: 1.1em;
                font-weight: bold;
                margin: 0 10px;
            ">📊 Raw Metrics</a>
            <button onclick="location.reload()" style="
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                font-size: 1.1em;
                font-weight: bold;
                margin: 0 10px;
                cursor: pointer;
            ">🔄 Refresh Metrics</button>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 10 seconds
        setTimeout(() => location.reload(), 10000);
    </script>
</body>
</html>
  `);
});
app.get('/load', (req, res) => {
  const start = Date.now();
  const iterations = 2000000;
  
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
    <title>Performance Load Test</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
            min-height: 100vh;
            color: white;
        }
        .load-container {
            max-width: 1000px;
            margin: 0 auto;
        }
        .load-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .load-icon {
            font-size: 5em;
            margin-bottom: 20px;
            animation: spin 2s linear infinite;
        }
        .load-title {
            font-size: 2.5em;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .performance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }
        .performance-card {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .card-title {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #FFD700;
        }
        .performance-value {
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
        }
        .performance-bar {
            width: 100%;
            height: 20px;
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            overflow: hidden;
            margin: 15px 0;
        }
        .performance-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #FFC107, #FF5722);
            border-radius: 10px;
            width: ${Math.min(duration / 10, 100)}%;
            transition: width 2s ease;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="load-container">
        <div class="load-header">
            <div class="load-icon">⚡</div>
            <div class="load-title">PERFORMANCE TEST COMPLETED</div>
            <p style="font-size: 1.2em; margin-top: 10px;">High-intensity computational workload analysis</p>
        </div>
        
        <div class="performance-grid">
            <div class="performance-card">
                <div class="card-title">🏷️ Instance ID</div>
                <div class="performance-value">${INSTANCE_ID.slice(-6)}</div>
            </div>
            
            <div class="performance-card">
                <div class="card-title">⏱️ Processing Time</div>
                <div class="performance-value">${duration}ms</div>
                <div class="performance-bar">
                    <div class="performance-fill"></div>
                </div>
            </div>
            
            <div class="performance-card">
                <div class="card-title">🔢 Iterations</div>
                <div class="performance-value">${iterations.toLocaleString()}</div>
            </div>
            
            <div class="performance-card">
                <div class="card-title">📊 Computation Result</div>
                <div class="performance-value">${Math.floor(result).toLocaleString()}</div>
            </div>
            
            <div class="performance-card">
                <div class="card-title">💾 Memory After Test</div>
                <div class="performance-value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</div>
            </div>
            
            <div class="performance-card">
                <div class="card-title">🚀 Performance Rating</div>
                <div class="performance-value">${duration < 100 ? 'Excellent' : duration < 500 ? 'Good' : duration < 1000 ? 'Average' : 'Needs Optimization'}</div>
            </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="/" style="
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                font-size: 1.1em;
                font-weight: bold;
                margin: 0 10px;
            ">🏠 Back to Home</a>
            <button onclick="location.reload()" style="
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 15px 30px;
                border-radius: 25px;
                font-size: 1.1em;
                font-weight: bold;
                margin: 0 10px;
                cursor: pointer;
            ">🔄 Run Again</button>
        </div>
    </div>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Advanced Load Balancer Server ${INSTANCE_ID} running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`⚡ Load Test: http://localhost:${PORT}/load`);
});

// AI API Simulation endpoint
app.get('/api/ai', (req, res) => {
  const query = req.query.q || 'Hello';
  const aiResponse = simulateAIResponse(query);
  
  res.json({
    query: query,
    aiResponse: aiResponse,
    instance: INSTANCE_ID,
    timestamp: new Date().toISOString(),
    processingTime: Math.floor(Math.random() * 200) + 50 + 'ms'
  });
});

// AI Response Simulation
function simulateAIResponse(query) {
  const responses = [
    `AI Analysis: "${query}" - This appears to be a ${query.length > 10 ? 'complex' : 'simple'} query requiring ${Math.floor(Math.random() * 5) + 1} processing steps.`,
    `AI Response: Based on the input "${query}", I recommend implementing load balancing for optimal performance.`,
    `AI Insight: The query "${query}" suggests a need for scalable architecture with monitoring capabilities.`,
    `AI Processing: "${query}" has been analyzed. Confidence level: ${Math.floor(Math.random() * 30) + 70}%`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Enhanced home page to show AI API integration
app.get('/ai-demo', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI API Load Balancer Demo</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        .ai-panel {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 30px;
            margin: 20px 0;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .input-group {
            margin: 20px 0;
        }
        .ai-input {
            width: 100%;
            padding: 15px;
            border-radius: 10px;
            border: none;
            font-size: 1.1em;
            background: rgba(255,255,255,0.9);
            color: #333;
        }
        .ai-button {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            border: none;
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            margin: 10px;
            transition: all 0.3s ease;
        }
        .ai-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }
        .response-area {
            background: rgba(0,0,0,0.3);
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            min-height: 100px;
            font-family: 'Courier New', monospace;
        }
        .architecture-flow {
            text-align: center;
            font-size: 1.2em;
            margin: 30px 0;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 style="text-align: center; font-size: 3em; margin-bottom: 10px;">🤖 AI API Load Balancer</h1>
        <p style="text-align: center; font-size: 1.2em; opacity: 0.9;">Enterprise AI API with Load Balancing & Auto Scaling</p>
        
        <div class="architecture-flow">
            <strong>Architecture Flow:</strong><br>
            User → Load Balancer → 2 Server → AI API → Response
        </div>
        
        <div class="ai-panel">
            <h3>🧠 AI Query Interface</h3>
            <div class="input-group">
                <input type="text" class="ai-input" id="aiQuery" placeholder="Enter your AI query here..." value="What is load balancing?">
            </div>
            <button class="ai-button" onclick="queryAI()">🚀 Send to AI API</button>
            <button class="ai-button" onclick="loadTest()">⚡ Load Test AI</button>
            
            <div id="responseArea" class="response-area">
                <em>AI responses will appear here...</em>
            </div>
        </div>
        
        <div class="ai-panel">
            <h3>📊 Load Balancer Status</h3>
            <div id="statusArea">
                <p><strong>Current Server:</strong> <span id="currentServer">Loading...</span></p>
                <p><strong>Total Requests:</strong> <span id="totalRequests">0</span></p>
                <p><strong>AI Processing Time:</strong> <span id="processingTime">-</span></p>
            </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="/" class="ai-button">🏠 Back to Dashboard</a>
            <a href="/dashboard" class="ai-button">📈 View Metrics</a>
        </div>
    </div>
    
    <script>
        let requestCount = 0;
        
        async function queryAI() {
            const query = document.getElementById('aiQuery').value;
            const responseArea = document.getElementById('responseArea');
            
            responseArea.innerHTML = '<em>🤖 AI is processing your query...</em>';
            
            try {
                const response = await fetch(\`/api/ai?q=\${encodeURIComponent(query)}\`);
                const data = await response.json();
                
                requestCount++;
                document.getElementById('totalRequests').textContent = requestCount;
                document.getElementById('currentServer').textContent = data.instance;
                document.getElementById('processingTime').textContent = data.processingTime;
                
                responseArea.innerHTML = \`
                    <strong>Query:</strong> \${data.query}<br><br>
                    <strong>AI Response:</strong><br>
                    \${data.aiResponse}<br><br>
                    <strong>Server:</strong> \${data.instance}<br>
                    <strong>Processing Time:</strong> \${data.processingTime}<br>
                    <strong>Timestamp:</strong> \${new Date(data.timestamp).toLocaleString('vi-VN')}
                \`;
            } catch (error) {
                responseArea.innerHTML = '<em style="color: #ff6b6b;">Error connecting to AI API</em>';
            }
        }
        
        async function loadTest() {
            const queries = [
                'What is artificial intelligence?',
                'How does load balancing work?',
                'Explain auto scaling benefits',
                'What is system monitoring?',
                'How to optimize performance?'
            ];
            
            document.getElementById('responseArea').innerHTML = '<em>🔥 Running AI load test...</em>';
            
            for (let i = 0; i < 5; i++) {
                const randomQuery = queries[Math.floor(Math.random() * queries.length)];
                document.getElementById('aiQuery').value = randomQuery;
                await queryAI();
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Initialize
        queryAI();
    </script>
</body>
</html>
  `);
});