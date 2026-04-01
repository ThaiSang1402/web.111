const http = require('http');
const { spawn } = require('child_process');

// Test configuration
const TEST_CONFIG = {
  instances: [
    { id: 'app1', port: 3001 },
    { id: 'app2', port: 3002 }
  ],
  loadBalancerPort: 8080
};

// Simple load balancer
function createLoadBalancer() {
  let currentIndex = 0;
  
  const server = http.createServer((req, res) => {
    const instance = TEST_CONFIG.instances[currentIndex];
    currentIndex = (currentIndex + 1) % TEST_CONFIG.instances.length;
    
    console.log(`🔄 Routing request to ${instance.id} (port ${instance.port})`);
    
    const options = {
      hostname: 'localhost',
      port: instance.port,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      console.error(`❌ Error connecting to ${instance.id}:`, err.message);
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Service unavailable', 
        failedInstance: instance.id 
      }));
    });
    
    req.pipe(proxyReq);
  });
  
  server.listen(TEST_CONFIG.loadBalancerPort, () => {
    console.log(`🚀 Load Balancer running on port ${TEST_CONFIG.loadBalancerPort}`);
  });
  
  return server;
}

// Start app instances
function startAppInstances() {
  const processes = [];
  
  TEST_CONFIG.instances.forEach(instance => {
    const env = {
      ...process.env,
      PORT: instance.port,
      INSTANCE_ID: instance.id
    };
    
    const child = spawn('node', ['app/server.js'], { 
      env,
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('error', (err) => {
      console.error(`❌ Failed to start ${instance.id}:`, err.message);
    });
    
    processes.push(child);
    console.log(`✅ Started ${instance.id} on port ${instance.port}`);
  });
  
  return processes;
}

// Test the system
async function testSystem() {
  console.log('🧪 Testing Load Balancer System...\n');
  
  // Wait a bit for servers to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('📊 Running load balancer tests...');
  
  for (let i = 1; i <= 6; i++) {
    try {
      const response = await makeRequest(`http://localhost:${TEST_CONFIG.loadBalancerPort}/`);
      console.log(`Request ${i}: ${response.instance} - ${response.message}`);
    } catch (err) {
      console.error(`Request ${i} failed:`, err.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🔥 Testing CPU intensive endpoint...');
  
  try {
    const start = Date.now();
    const response = await makeRequest(`http://localhost:${TEST_CONFIG.loadBalancerPort}/cpu-intensive?iterations=1000000`);
    const duration = Date.now() - start;
    console.log(`CPU Test: ${response.instance} completed in ${duration}ms (server reported: ${response.duration})`);
  } catch (err) {
    console.error('CPU test failed:', err.message);
  }
  
  console.log('\n✅ System test completed!');
}

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

// Main execution
console.log('🚀 Starting Load Balancer Test System...\n');

// Start app instances
const appProcesses = startAppInstances();

// Start load balancer
const loadBalancer = createLoadBalancer();

// Run tests after a delay
setTimeout(testSystem, 3000);

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  appProcesses.forEach(child => child.kill());
  loadBalancer.close();
  process.exit(0);
});