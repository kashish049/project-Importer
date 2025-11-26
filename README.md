# Product Importer Application

A scalable web application for importing products from CSV files into a PostgreSQL database with real-time progress tracking, product management, and webhook notifications.

![Product Importer](https://img.shields.io/badge/status-production--ready-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)

## Features

- 📤 **CSV Upload**: Import large CSV files (500k+ records) with real-time progress tracking
- 🔄 **Async Processing**: Celery-based background task processing
- 📊 **Product Management**: Full CRUD operations with search and pagination
- 🔔 **Webhooks**: Configure webhooks for upload completion events
- 🎨 **Modern UI**: React frontend with Tailwind CSS
- 🐳 **Docker Ready**: Complete Docker Compose setup

## Tech Stack

**Backend:**
- FastAPI (Python web framework)
- PostgreSQL (Database)
- Celery (Async task queue)
- Redis (Message broker)
- SQLAlchemy (ORM)

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Axios

## Prerequisites

- Docker Desktop installed
- Git installed
- 4GB+ RAM available
- Ports 8000, 5173, 5432, 6379 available

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/suiisharma/ashishprojec1.git
cd ashishprojec1
```

### 2. Start the Application

```bash
docker-compose up --build
```

This will start all services:
- Backend API: http://localhost:8000
- Frontend UI: http://localhost:5173
- API Docs: http://localhost:8000/docs

### 3. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs

## Usage

### Upload CSV File

1. Click "Choose File" and select your CSV file
2. CSV must have columns: `sku`, `name`, `description`, `active`
3. Click "Upload CSV"
4. Watch real-time progress bar
5. Products appear in table below

**Example CSV Format:**
```csv
sku,name,description,active
PROD-001,Product Name,Product description,true
PROD-002,Another Product,Another description,false
```

### Manage Products

- **Add Product**: Click "Add Product" button
- **Edit Product**: Click pencil icon on any row
- **Delete Product**: Click trash icon on any row
- **Search**: Use search box to filter by SKU, name, or description
- **Delete All**: Click "Delete All" button (with confirmation)

### Configure Webhooks

1. Scroll to "Webhooks" section
2. Enter webhook URL (e.g., https://webhook.site/your-unique-url)
3. Select event type: "Upload Completed"
4. Click "Add"
5. Edit or delete webhooks as needed

## Development

### Run Locally (Without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Database & Redis:**
```bash
# Start PostgreSQL and Redis using Docker
docker-compose up db redis
```

### Environment Variables

Create `.env` file in project root:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/products_db
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

## API Endpoints

### Products
- `GET /api/products/` - List products (with pagination)
- `POST /api/products/` - Create product
- `PUT /api/products/{sku}` - Update product
- `DELETE /api/products/{sku}` - Delete product
- `DELETE /api/products/` - Delete all products

### Upload
- `POST /api/upload/` - Upload CSV file
- `GET /api/upload/{task_id}` - Get upload status

### Webhooks
- `GET /api/webhooks/` - List webhooks
- `POST /api/webhooks/` - Create webhook
- `PUT /api/webhooks/{id}` - Update webhook
- `DELETE /api/webhooks/{id}` - Delete webhook

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │─────▶│   FastAPI   │─────▶│ PostgreSQL  │
│  Frontend   │      │   Backend   │      │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐      ┌─────────────┐
                     │   Celery    │─────▶│    Redis    │
                     │   Worker    │      │   Broker    │
                     └─────────────┘      └─────────────┘
```

## Troubleshooting

### Port Already in Use
```bash
# Stop all containers
docker-compose down

# Check what's using the port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                  # Mac/Linux

# Kill the process or change port in docker-compose.yml
```

### Database Connection Error
```bash
# Reset database
docker-compose down -v
docker-compose up --build
```

### Frontend Not Loading
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Or rebuild frontend
docker-compose up --build frontend
```

## Testing

Run the test script to verify all endpoints:
```bash
python verify_api.py
```

## Production Deployment

### Using Docker

1. Update environment variables in `docker-compose.yml`
2. Set production database credentials
3. Deploy to your server:
```bash
docker-compose -f docker-compose.yml up -d
```

### Using Cloud Services

- **Backend**: Deploy to AWS ECS, Google Cloud Run, or Azure Container Instances
- **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL, Azure Database)
- **Redis**: Use managed Redis (AWS ElastiCache, Google Memorystore, Azure Cache)
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3 + CloudFront

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check API documentation at http://localhost:8000/docs

## Acknowledgments

Built with FastAPI, React, PostgreSQL, Celery, and Redis.
