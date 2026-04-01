# Load Balancer & Monitoring Project

## Architecture
- **Node.js Application** with built-in load balancing simulation
- **Monitoring**: Prometheus metrics endpoint
- **Simple Deployment**: No Docker needed

## Local Development

### Prerequisites
- Node.js installed

### Run the application
```bash
cd app
npm install
npm start
```

### Access Points
- Application: http://localhost:3000
- Health check: http://localhost:3000/health
- Metrics: http://localhost:3000/metrics

### Test Load Balancing Simulation
```bash
# Multiple requests to see different responses
curl http://localhost:3000/
curl http://localhost:3000/load
```

## Render Deployment

### Simple Node.js Deployment
1. Push code to GitHub
2. Connect repository to Render
3. Render automatically detects `render.yaml`
4. Deploy with Node.js runtime

### Environment Variables
- `NODE_ENV=production`
- `PORT=10000` (Render's default)

## Testing

### Simple Test
```bash
node test-system.js
```

### Web Interface
Open `demo.html` in your browser for interactive testing

## Features
- ✅ Load balancing simulation
- ✅ Health checks
- ✅ Prometheus metrics
- ✅ Simple Node.js deployment
- ✅ No Docker complexity

## Endpoints
- `/` - Main application with instance info
- `/health` - Health check
- `/load` - CPU load test
- `/metrics` - Prometheus metrics