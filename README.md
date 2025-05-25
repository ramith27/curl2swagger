# curl2swagger 🚀

Transform your cURL commands into comprehensive OpenAPI specifications with AI-powered analysis and quality insights.

## ✨ Features

- **Instant Conversion**: Drop in your cURL commands and get OpenAPI specs in seconds
- **Smart Merging**: Intelligently combines multiple endpoints into cohesive API documentation
- **Quality Analysis**: Built-in linting, security scanning, and performance recommendations
- **Real-time Collaboration**: WebSocket-powered live updates across team members
- **SDK Generation**: Generate client SDKs in multiple programming languages
- **Documentation Publishing**: Create beautiful, interactive API documentation

## 🛠️ Tech Stack

### Backend
- **NestJS 10** - Scalable Node.js framework
- **Prisma** - Type-safe database ORM
- **BullMQ** - Redis-based job queue
- **PostgreSQL** - Primary database
- **Redis** - Caching and job queue
- **Swagger/OpenAPI** - API documentation

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **TanStack Query** - Data fetching and caching
- **Socket.IO** - Real-time communication

### Architecture
- **Backend** - NestJS API with integrated utilities for cURL parsing, schema inference, and OpenAPI generation
- **Dashboard** - Next.js frontend with real-time collaboration features

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/curl2swagger.git
   cd curl2swagger
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start infrastructure services**
   ```bash
   cd infra
   docker-compose up -d postgres redis
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize the database**
   ```bash
   pnpm db:push
   ```

6. **Start development servers**
   ```bash
   pnpm dev
   ```

The application will be available at:
- **Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in development mode |
| `pnpm build` | Build all packages and applications |
| `pnpm lint` | Run linting across all packages |
| `pnpm test` | Run test suites |
| `pnpm db:push` | Push database schema changes |
| `pnpm spec` | Generate and build API documentation |

## 🏗️ Project Structure

```
curl2swagger/
├── apps/
│   ├── backend/          # NestJS API server
│   └── dashboard/        # Next.js frontend
├── packages/
│   ├── shared/           # Shared types and schemas
│   ├── parser/           # cURL parsing utilities
│   └── infer/            # Schema inference tools
├── infra/
│   └── docker-compose.yml # Infrastructure services
├── .github/
│   └── workflows/        # CI/CD pipelines
└── docs/                 # Additional documentation
```

## 🔄 Development Workflow

### Adding a New Feature

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Backend changes go in `apps/backend/`
   - Frontend changes go in `apps/dashboard/`
   - Shared utilities go in `packages/`

3. **Test your changes**
   ```bash
   pnpm test
   pnpm lint
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**

### Database Changes

1. **Update the Prisma schema**
   ```bash
   # Edit apps/backend/prisma/schema.prisma
   ```

2. **Push changes to database**
   ```bash
   pnpm db:push
   ```

3. **Generate new Prisma client**
   ```bash
   cd apps/backend
   pnpm prisma generate
   ```

## 📊 Usage Examples

### Basic cURL Conversion

```bash
curl -X POST "https://api.example.com/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }'
```

This would generate an OpenAPI specification with:
- Endpoint definition for `POST /users`
- Request body schema inferred from the JSON data
- Authentication scheme detected from headers
- Response schema (if response samples are provided)

### Advanced Features

- **Batch Processing**: Upload multiple cURL commands at once
- **Project Organization**: Group related endpoints into projects
- **Version Control**: Track changes to your API specifications
- **Quality Reports**: Get detailed analysis of your API design
- **Export Options**: Download as YAML, JSON, or generate SDKs

## 🚢 Deployment

### Using Docker

```bash
# Build and start all services
docker-compose -f infra/docker-compose.yml up -d

# Scale services
docker-compose -f infra/docker-compose.yml up -d --scale backend=3
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://curl2s:pass@localhost:5432/curl2swagger` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Required |
| `BACKEND_URL` | Backend API URL | `http://localhost:3001` |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [curlconverter](https://github.com/curlconverter/curlconverter) - cURL parsing
- [quicktype](https://github.com/quicktype/quicktype) - JSON schema inference
- [Spectral](https://github.com/stoplightio/spectral) - OpenAPI linting
- [Redocly](https://redocly.com/) - API documentation tools

## 📞 Support

- 📚 [Documentation](https://docs.curl2swagger.com)
- 💬 [Discord Community](https://discord.gg/curl2swagger)
- 🐛 [Issue Tracker](https://github.com/your-username/curl2swagger/issues)
- 📧 [Email Support](mailto:support@curl2swagger.com)

---

<p align="center">
  Made with ❤️ by the curl2swagger team
</p>
