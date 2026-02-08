# MycoMiner Deployment Guide

## Prerequisites

- Node.js 18+ and npm 9+
- Docker (for containerized deployment)
- A running Agent Runtime service (default: localhost:8080)
- Vercel account (for serverless deployment) or VPS (for traditional deployment)

---

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and update values:

```bash
cp .env.example .env.local
```

Set your agent runtime URL:
```
AGENT_RUNTIME_URL=http://localhost:8080
```

### 3. Run Development Server

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

### 4. Verify System

- **Agent Console**: Test sending messages
- **Governance Panel**: Check logs appear in real-time
- **Explainability Viewer**: Verify graph nodes are created
- **Stats Bar**: Confirm live metrics

---

## Build for Production

### 1. Type Check

```bash
npm run type-check
```

### 2. Lint Code

```bash
npm run lint
```

### 3. Build Application

```bash
npm run build
```

This generates optimized production bundle in `.next/` folder.

### 4. Verify Build

```bash
npm start
```

---

## Docker Deployment

### Build Docker Image

```bash
docker build -t mycominer:latest .
```

### Run Container

```bash
docker run \
  -p 3000:3000 \
  -e AGENT_RUNTIME_URL=http://host.docker.internal:8080 \
  -e NODE_ENV=production \
  mycominer:latest
```

### Push to Registry

```bash
# Docker Hub
docker tag mycominer:latest username/mycominer:latest
docker push username/mycominer:latest

# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag mycominer:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/mycominer:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/mycominer:latest
```

---

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel --prod
```

### 4. Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add `AGENT_RUNTIME_URL` with your agent runtime URL
3. Redeploy: `vercel --prod`

### 5. Monitor Deployment

```bash
vercel list
vercel logs mycominer.vercel.app
```

---

## Traditional VPS Deployment (Ubuntu 22.04)

### 1. SSH into Server

```bash
ssh user@your-vps-ip
```

### 2. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 4. Clone Repository

```bash
git clone https://github.com/username/mycominer.git
cd mycominer
```

### 5. Install Dependencies and Build

```bash
npm install
npm run build
```

### 6. Create PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'mycominer',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      AGENT_RUNTIME_URL: 'http://your-agent-runtime:8080',
      PORT: 3000,
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
  }]
};
```

### 7. Start Application with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Nginx Reverse Proxy

Install Nginx:
```bash
sudo apt-get install -y nginx
```

Configure `/etc/nginx/sites-available/mycominer`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API routes with longer timeout for streaming responses
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/mycominer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## AWS ECS Deployment

### 1. Create ECR Repository

```bash
aws ecr create-repository --repository-name mycominer --region us-east-1
```

### 2. Push Image to ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker build -t mycominer:latest .
docker tag mycominer:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/mycominer:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/mycominer:latest
```

### 3. Create ECS Task Definition

```json
{
  "family": "mycominer",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "mycominer",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/mycominer:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "AGENT_RUNTIME_URL",
          "value": "http://your-agent-runtime:8080"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mycominer",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 4. Register Task Definition

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### 5. Create ECS Service

```bash
aws ecs create-service \
  --cluster mycominer-cluster \
  --service-name mycominer \
  --task-definition mycominer \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED} \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=mycominer,containerPort=3000
```

---

## Kubernetes Deployment

### 1. Create Docker Image and Push to Registry

```bash
docker build -t your-registry/mycominer:1.0.0 .
docker push your-registry/mycominer:1.0.0
```

### 2. Create Kubernetes Deployment

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mycominer
  labels:
    app: mycominer
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mycominer
  template:
    metadata:
      labels:
        app: mycominer
    spec:
      containers:
      - name: mycominer
        image: your-registry/mycominer:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: AGENT_RUNTIME_URL
          value: "http://agent-runtime-service:8080"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: mycominer-service
spec:
  selector:
    app: mycominer
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### 3. Deploy to Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
kubectl get pods
kubectl get svc mycominer-service
```

---

## Health Checks & Monitoring

### Application Health

```bash
curl http://localhost:3000
# Expected: HTML response

curl http://localhost:3000/api/governance
# Expected: JSON with logs and stats
```

### PM2 Monitoring (VPS)

```bash
pm2 monit          # Real-time monitoring
pm2 logs           # View logs
pm2 status         # Current status
```

### Vercel Analytics

Dashboard: https://vercel.com/dashboard

---

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] Agent runtime service running and accessible
- [ ] Database backups configured (if applicable)
- [ ] Monitoring and alerting setup
- [ ] Log aggregation configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Load balancing configured (if multi-instance)
- [ ] Auto-scaling policies set
- [ ] Disaster recovery tested

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Cannot Connect to Agent Runtime

1. Verify agent runtime is running:
   ```bash
   curl http://AGENT_RUNTIME_URL/health
   ```

2. Check network connectivity:
   ```bash
   nc -zv AGENT_RUNTIME_HOST AGENT_RUNTIME_PORT
   ```

3. Update `AGENT_RUNTIME_URL` environment variable

### High Memory Usage

```bash
# Check Node.js memory
node --max-old-space-size=4096 node_modules/next/dist/bin/next start

# Or configure in PM2/Docker
```

### SSL/TLS Issues

```bash
# Verify certificate
openssl s_client -connect your-domain.com:443

# Renew Let's Encrypt certificate
sudo certbot renew --dry-run
```

---

## Performance Optimization

### Enable Caching

```javascript
// next.config.js
const headers = [
  {
    source: '/api/:path*',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=60, s-maxage=600'
      }
    ]
  }
];
```

### Database Connection Pooling

Configure in environment variables for any external database services.

### CDN Integration

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  images: {
    domains: ['cdn.your-domain.com'],
  }
});
```

---

## Rollback Procedure

### Vercel

```bash
vercel rollback
```

### VPS/PM2

```bash
cd /path/to/mycominer
git checkout previous-commit-hash
npm install
npm run build
pm2 restart mycominer
```

### Docker

```bash
docker run \
  -p 3000:3000 \
  your-registry/mycominer:previous-version
```

---

## Support & Monitoring

- **Logs**: Check `/var/log/` or PM2 logs
- **Metrics**: Use Vercel Analytics or custom monitoring
- **Status**: Check `/api/governance` and `/api/explainability` for system health
- **Updates**: Pull latest, run `npm install && npm run build`, restart

---

## Next Steps

1. Deploy to staging environment first
2. Run full integration tests
3. Monitor for 24-48 hours before production release
4. Set up automated backups and monitoring
5. Document custom configurations
