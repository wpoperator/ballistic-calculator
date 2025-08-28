# Ballistics Calculator

A production-ready web application for advanced ballistic trajectory calculations using the [py-ballisticcalc](https://github.com/o-murphy/py-ballisticcalc) Python package.

## Features

- **Advanced Ballistics Calculations**: Powered by py-ballisticcalc for accurate trajectory modeling
- **Modern Web Interface**: Built with Next.js 15+ and shadcn/ui components
- **Interactive Charts**: Visualize trajectory data with responsive charts
- **Form Validation**: Comprehensive input validation using Zod
- **Production Ready**: Docker containerization, CI/CD, and security best practices
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **py-ballisticcalc**: Professional ballistics calculation library
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server for production deployment

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **shadcn/ui**: Modern UI components built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Responsive chart library
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ballistic-calculator
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements-dev.txt
   
   # Copy environment file
   cp .env.example .env
   
   # Run the development server
   uvicorn app.main:app --reload --port 8000
   ```

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Copy environment file
   cp .env.example .env.local
   
   # Run the development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Docker Development

Run the entire application with Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Endpoints

### Health & Information
- `GET /api/health` - Health check
- `GET /api/info` - System information

### Ballistics Calculations
- `POST /api/calculate` - Calculate trajectory
- `GET /api/drag-models` - Available drag models
- `POST /api/validate` - Validate parameters

### Example API Request

```json
{
  "weapon": {
    "sight_height": 2.0,
    "twist": 12.0
  },
  "ammo": {
    "bc": 0.5,
    "drag_model": "G1",
    "muzzle_velocity": 2800,
    "bullet_weight": 150
  },
  "atmosphere": {
    "temperature": 59,
    "pressure": 29.92,
    "humidity": 0.5,
    "altitude": 0
  },
  "wind": {
    "speed": 10,
    "direction": 3
  },
  "zero_distance": 100,
  "max_range": 1000,
  "step_size": 25
}
```

## Configuration

### Backend Environment Variables

```bash
# App Configuration
APP_NAME=Ballistics Calculator API
VERSION=1.0.0
ENVIRONMENT=development
DEBUG=true

# Security
SECRET_KEY=your-super-secret-key
ALLOWED_HOSTS=["*"]
ALLOWED_ORIGINS=["http://localhost:3000"]

# Calculation Limits
MAX_RANGE_YARDS=3000.0
MIN_RANGE_YARDS=25.0
MAX_STEP_SIZE=100.0
MIN_STEP_SIZE=1.0
```

### Frontend Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing

### Backend Tests

```bash
cd backend

# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api.py -v
```

### Frontend Tests

```bash
cd frontend

# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## Production Deployment

### Docker Production

1. **Update environment variables**
   ```bash
   # Update docker-compose.prod.yml with your domains
   # Set SECRET_KEY environment variable
   export SECRET_KEY="your-production-secret-key"
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

#### Backend Production

```bash
cd backend

# Install production dependencies
pip install -r requirements.txt

# Set environment variables
export ENVIRONMENT=production
export DEBUG=false
export SECRET_KEY="your-production-secret-key"

# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

#### Frontend Production

```bash
cd frontend

# Build for production
npm run build

# Start production server
npm start
```

## Security Considerations

- ✅ Input validation with Pydantic and Zod
- ✅ CORS configuration
- ✅ Rate limiting ready
- ✅ Environment-based configuration
- ✅ Docker security best practices
- ✅ Dependency vulnerability scanning
- ✅ Production/development environment separation

## Project Structure

```
ballistic-calculator/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── core/           # Core configuration and utilities
│   │   ├── models/         # Pydantic models
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Business logic
│   │   └── main.py         # FastAPI application
│   ├── tests/              # Backend tests
│   ├── requirements.txt    # Production dependencies
│   ├── requirements-dev.txt # Development dependencies
│   └── Dockerfile
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js 15 App Router
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
│   ├── public/            # Static assets
│   ├── package.json
│   └── Dockerfile
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.yml     # Development environment
├── docker-compose.prod.yml # Production environment
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Workflow

1. **Backend Development**
   - Make changes to FastAPI code
   - Add tests for new features
   - Run `pytest` to ensure tests pass
   - Update API documentation if needed

2. **Frontend Development**
   - Make changes to React components
   - Ensure TypeScript types are correct
   - Run `npm run lint` and `npm run build`
   - Test API integration

3. **Testing Changes**
   - Test locally with development servers
   - Test with Docker Compose
   - Verify API endpoints work correctly
   - Check responsive design

## Troubleshooting

### Common Issues

1. **Backend fails to start**
   - Check Python version (3.11+ required)
   - Verify virtual environment is activated
   - Ensure all dependencies are installed
   - Check environment variables

2. **Frontend build errors**
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Verify environment variables

3. **API connection issues**
   - Verify backend is running on port 8000
   - Check CORS configuration
   - Verify NEXT_PUBLIC_API_URL is correct

4. **Docker issues**
   - Ensure Docker is running
   - Check for port conflicts
   - Verify Docker Compose file syntax

### Performance Optimization

- Enable caching for API responses
- Optimize Docker images for production
- Use CDN for static assets
- Implement API rate limiting
- Add database for user sessions and saved calculations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [py-ballisticcalc](https://github.com/o-murphy/py-ballisticcalc) - Excellent ballistics calculation library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [FastAPI](https://fastapi.tiangolo.com/) - Modern web framework
- [Next.js](https://nextjs.org/) - React framework

## Support

For support, please open an issue on GitHub or contact [your-email@example.com].

---

**Note**: This application is for educational and recreational purposes. Always verify calculations with additional sources for critical applications.
