# Load Balancer & Monitoring Project

## Architecture
- **Load Balancer**: Nginx distributing traffic across 2 Node.js instances
- **Monitoring**: Prometheus + Grafana for metrics and visualization

## Local Development

### Prerequisites
- Docker and Docker Compose installed

### Run the application
```bash
docker-compose up --build
```

### Access Points
- Application: http://localhost
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin123)

### Test Load Balancing
```bash
# Multiple requests to see different instances
curl http://localhost/
curl http://localhost/load
```

## Render Deployment

1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Use Docker environment
4. Set Dockerfile path to `./app/Dockerfile`

### Environment Variables for Render
- `NODE_ENV=production`
- `PORT=10000` (Render's default)

## Testing

### Simple Test
```bash
node test-system.js
```

### Web Interface
Open `demo.html` in your browser for interactive testing

## Health Checks
- App health: `/health`
- Load test: `/load`
- Metrics: `/metrics`