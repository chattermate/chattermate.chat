# ChatterMate - AI-Powered Customer Support Platform

![ChatterMate Logo](frontend/public/assets/images/logo.svg)

ChatterMate is an intelligent customer support platform that combines AI agents with human oversight. It enables businesses to provide 24/7 support through AI agents that can handle common queries, escalate complex issues, and continuously learn from knowledge base articles.

## Demo
Watch our platform demo:
[![ChatterMate Demo](https://img.youtube.com/vi/bk40VSS2BLU/0.jpg)](https://youtu.be/bk40VSS2BLU)

## Features

- 🤖 **AI-Powered Responses**: Context-aware AI with multiple provider support (OpenAI GPT-4, Google AI, Ollama)
- 👥 **Human Handoff**: Seamless transition to human agents when needed
- 🔌 **Deep Integration**: Connect with Jira, Zendesk, Slack, and more
- 🎨 **Custom Theming**: Fully customizable chat interface
- 🔐 **Role-Based Access**: Granular control over user permissions
- 📊 **Analytics Dashboard**: Real-time monitoring and insights
- 💾 **Smart Memory**: Maintains conversation context across sessions
- 📚 **Knowledge Base**: Train the AI with your domain knowledge
- 🌐 **Open Source**: Self-hostable and community-driven

### Technical Features

**Backend (FastAPI)**
- Real-time WebSocket communication
- Knowledge base management with vector search (PGVector)
- OCR capabilities with RapidOCR
- JWT & Firebase Authentication
- PostgreSQL with SQLAlchemy ORM
- Firebase Cloud Storage
- Auto-generated API documentation

**Frontend (Vue 3)**
- Real-time chat widget with markdown support
- Agent dashboard for conversation monitoring
- Knowledge management interface
- White-label customizable widget
- Theming with PrimeVue and HeadlessUI
- Firebase Cloud Messaging integration
- Modern toast notifications (Vue Sonner)
- Comprehensive testing suite

## Prerequisites

- Python 3.12+
- Node.js 22+
- PostgreSQL 14+ (with Vector extension)
- Firebase Project
- Redis (Optional for rate limiting)

## Installation

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Configure .env with your credentials

# Database setup
alembic upgrade head

# To generate revisions if any model changes 
alembic revision --autogenerate -m "Changes description "
```

### Frontend Setup
```bash
cd frontend

npm install

# Configure environment
cp .env.example .env

```
For Web Push notification, generate a firebase config and keep in folder backend/app/config/firebase-config.json 


## Running the Application

**Backend**
```bash
# Development
uvicorn app.main:app --reload --port 8000

# Run Knowledge Processor (in a separate terminal)
python -m app.workers.run_knowledge_processor

# Production
# Install gunicorn if not already installed
pip install gunicorn

# Run with gunicorn (adjust workers based on CPU cores)
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --access-logfile - --error-logfile - --log-level info

# Run Knowledge Processor as a background service
nohup python -m app.workers.run_knowledge_processor > knowledge_processor.log 2>&1 &
```

**Frontend**
```bash
# Development
npm run dev

# Build Widget for chat to integrate in website
npm run build:widget

# Build Web Client to integrate in website
npm run build:webclient
```

## Testing

**Backend**
```bash
pytest tests/
```

**Frontend**
```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e
```

## Deployment

For production deployment without Docker:

**Backend**
```bash
# Install production dependencies
pip install gunicorn

# Run with gunicorn
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --timeout 120

# Run Knowledge Processor
# Option 1: Using systemd (recommended)
sudo tee /etc/systemd/system/chattermate-knowledge-processor.service << EOF
[Unit]
Description=ChatterMate Knowledge Processor
After=network.target

[Service]
User=chattermate
Group=chattermate
WorkingDirectory=/path/to/chattermate/backend
Environment="PATH=/path/to/chattermate/backend/venv/bin"
ExecStart=/path/to/chattermate/backend/venv/bin/python -m app.workers.run_knowledge_processor
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable chattermate-knowledge-processor
sudo systemctl start chattermate-knowledge-processor

# Option 2: Using supervisor
sudo tee /etc/supervisor/conf.d/chattermate-knowledge-processor.conf << EOF
[program:chattermate-knowledge-processor]
command=/path/to/chattermate/backend/venv/bin/python -m app.workers.run_knowledge_processor
directory=/path/to/chattermate/backend
user=chattermate
autostart=true
autorestart=true
stderr_logfile=/var/log/chattermate/knowledge-processor.err.log
stdout_logfile=/var/log/chattermate/knowledge-processor.out.log
EOF

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start chattermate-knowledge-processor

# Recommended worker count:
# - CPU bound: 1-2 workers per CPU core
# - I/O bound: 2-4 workers per CPU core
# Example: For a 4-core machine, use 4-16 workers depending on workload
```

**Frontend**
```bash
# Build for production
npm run build

# Serve using nginx or other web server
```

### Docker Deployment

You can run the project using either Docker Compose with local builds or pre-built Docker images.

#### Using Pre-built Images

The following Docker images are available on Docker Hub:
```bash
# Frontend Image
docker pull chattermate/frontend:latest

# Backend Image
docker pull chattermate/backend:latest

# Knowledge Processor Image
docker pull chattermate/knowledge-processor:latest
```

To run using pre-built images:

1. Create a `docker-compose.prod.yml` file:
```yaml
services:
  frontend:
    image: chattermate/frontend:latest
    ports:
      - "80:80"
    env_file:
      - ./frontend/.env
    depends_on:
      - backend
    networks:
      - chattermate-network
    restart: unless-stopped

  backend:
    image: chattermate/backend:latest
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - chattermate-network
    restart: unless-stopped
    volumes:
      - backend_data:/app/uploads

  knowledge-processor:
    image: chattermate/knowledge-processor:latest
    env_file:
      - ./backend/.env
    depends_on:
      - backend
      - db
    networks:
      - chattermate-network
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=chattermate
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - chattermate-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - chattermate-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  chattermate-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  backend_data:
```

2. Start the services:
```bash
docker compose -f docker-compose.prod.yml up -d
```

#### Local Development with Docker

For local development, you can build the images yourself:

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f db     # PostgreSQL logs
docker-compose logs -f redis  # Redis logs
docker-compose logs -f backend # Backend logs
docker-compose logs -f frontend # frontend logs
```

The Docker setup includes:
- Custom PostgreSQL image with pg_vector extension pre-installed
- Redis for caching and rate limiting
- FastAPI backend with all dependencies
- Vue.js frontend with automatic builds
- Automatic database migrations on startup
- Health checks for all services
- Proper service startup order

The startup process:
1. PostgreSQL starts and initializes with vector extension
2. Redis starts and becomes ready
3. Backend service waits for PostgreSQL to be healthy
4. Database migrations run automatically
5. FastAPI application starts
6. Frontend builds and waits for backend
7. Frontend application starts

Service URLs:
```
Frontend: http://localhost:80
Backend API: http://localhost:8000
Database: localhost:5432
Redis: localhost:6379
```

Database connection details:
```
Host: localhost
Port: 5432
Database: chattermate
Username: postgres
Password: postgres
```

Make sure to set up your environment variables in a `.env` file before running Docker.

## Documentation

- API Documentation: `http://localhost:8000/docs`
- Project Documentation: [docs.chattermate.chat](https://docs.chattermate.chat)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 style guide
- Write tests for new features
- Update documentation as needed
- Add type hints to new functions

## Support

- 💬 Discord: [Join our community](https://discord.gg/XNCMg8jV8U)
- 🐛 Issues: [GitHub Issues](https://github.com/chattermate/chattermate/issues)
- 📧 Email: support@chattermate.chat



---

Made with ❤️ by the ChatterMate team 