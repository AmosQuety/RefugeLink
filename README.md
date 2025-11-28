# Complete File Structure & Descriptions

## 📂 Root Directory

```
backend/
├── src/                          # Source code
├── scripts/                      # Utility scripts
├── tests/                        # Test files
├── logs/                         # Application logs (created automatically)
├── dist/                         # Compiled JavaScript (created on build)
├── node_modules/                 # Dependencies (created on install)
├── .env                          # Environment variables (create from .env.example)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore patterns
├── .eslintrc.json               # ESLint configuration
├── .prettierrc.json             # Prettier configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Project dependencies and scripts
├── Dockerfile                   # Docker container configuration
├── docker-compose.yml           # Docker Compose configuration
├── README.md                    # Main documentation
├── SETUP_GUIDE.md              # Step-by-step setup instructions
└── FILE_STRUCTURE.md           # This file
```

## 📁 Source Code (`src/`)

### Configuration (`src/config/`)

| File | Purpose | Key Features |
|------|---------|--------------|
| `env.ts` | Environment configuration | Zod validation, type-safe env vars |
| `logger.ts` | Winston logging setup | File rotation, log levels, formatting |
| `database.ts` | SQLite database setup | Connection pooling, WAL mode, table creation |

### Type Definitions (`src/types/`)

| File | Purpose | Exports |
|------|---------|---------|
| `index.ts` | TypeScript interfaces & types | Service, Contact, RegistrationStep, BotResponse, AppError classes |

### Data Access Layer (`src/repositories/`)

| File | Purpose | Methods |
|------|---------|---------|
| `ServiceRepository.ts` | Services table CRUD | findByCategory, findAll, create, update, delete |
| `ContactRepository.ts` | Contacts table CRUD | findByType, findUrgent, findAll, create, update, delete |
| `RegistrationStepRepository.ts` | Registration steps CRUD | findAll, findByStepNumber, create, update, delete |

**Pattern:** Repository pattern for clean separation of database logic

### Business Logic (`src/services/`)

| File | Purpose | Responsibilities |
|------|---------|------------------|
| `MessageService.ts` | Core chatbot logic | Intent detection, response generation, conversation logging |
| `TwilioService.ts` | Twilio integration | TwiML creation, message sending, signature validation |

**Key Features:**
- Intent-based routing
- Database queries via repositories
- Session management
- Conversation logging

### Request Handlers (`src/controllers/`)

| File | Purpose | Endpoints |
|------|---------|-----------|
| `WebhookController.ts` | HTTP request handling | WhatsApp webhook, health checks, status |

**Pattern:** Controller handles HTTP, delegates to services

### Routes (`src/routes/`)

| File | Purpose | Routes |
|------|---------|--------|
| `webhook.routes.ts` | Webhook endpoints | POST /whatsapp, GET /health |
| `index.ts` | Route aggregation | Mounts all routes, API info |

**Middleware Applied:**
- Rate limiting
- Twilio signature validation
- Error handling

### Middleware (`src/middleware/`)

| File | Purpose | Features |
|------|---------|----------|
| `errorHandler.ts` | Global error handling | AppError handling, logging, proper HTTP status |
| `twilioValidator.ts` | Webhook authentication | Signature verification, request validation |
| `rateLimiter.ts` | Rate limiting | Per-user limits, IP-based limits, custom responses |

### Application Entry (`src/`)

| File | Purpose | Features |
|------|---------|----------|
| `app.ts` | Main application | Express setup, middleware, graceful shutdown, health checks |

**Startup Flow:**
1. Load environment variables
2. Initialize logger
3. Connect to database
4. Setup middleware
5. Mount routes
6. Start server
7. Setup graceful shutdown handlers

## 📜 Scripts (`scripts/`)

| File | Purpose | Usage |
|------|---------|-------|
| `populateDatabase.ts` | Database seeding | `npm run populate-db` |

**What it does:**
- Clears existing data
- Inserts services (WFP, MTI, AVSI, etc.)
- Inserts contacts (OPM, UNHCR, MRRH)
- Inserts registration steps
- Inserts required documents
- Inserts FAQs

## 🧪 Tests (`tests/`)

```
tests/
├── unit/              # Unit tests (individual functions)
│   ├── services/
│   ├── repositories/
│   └── utils/
└── integration/       # Integration tests (API endpoints)
    └── webhook.test.ts
```

**Test Framework:** Jest with ts-jest

## 📊 Logs (`logs/`)

Auto-created on first run:

| File | Contents |
|------|----------|
| `combined.log` | All log levels |
| `error.log` | Error level only |
| `exceptions.log` | Uncaught exceptions |
| `rejections.log` | Unhandled promise rejections |

**Features:**
- 5MB max file size
- 5 file rotation
- JSON metadata
- Stack traces for errors

## 🔧 Configuration Files

### `.env.example`
Template for environment variables. Copy to `.env` and fill in values.

### `tsconfig.json`
TypeScript compiler configuration:
- Target: ES2022
- Module: ESNext
- Strict mode enabled
- Path aliases (@config/*, @services/*, etc.)

### `.eslintrc.json`
Code linting rules:
- TypeScript ESLint
- Recommended rules
- Custom overrides

### `.prettierrc.json`
Code formatting:
- Single quotes
- 2 space tabs
- 100 char line width
- Semicolons

### `package.json`
Project metadata and scripts:
- Dependencies
- Dev dependencies
- NPM scripts
- Engines requirements

### `Dockerfile`
Multi-stage Docker build:
- Builder stage: Compile TypeScript
- Production stage: Minimal runtime image
- Non-root user
- Health check

### `docker-compose.yml`
Local Docker development:
- Service definition
- Volume mounts
- Network configuration
- Environment variables

## 📝 Documentation Files

### `README.md`
Main project documentation:
- Quick start
- API endpoints
- Deployment guides
- Architecture overview

### `SETUP_GUIDE.md`
Step-by-step setup:
- Prerequisites
- Twilio setup
- Local development
- Production deployment
- Troubleshooting

### `FILE_STRUCTURE.md`
This file - complete file reference

## 🗃️ Database (`refugee_chatbot.db`)

SQLite database with tables:
- `services`
- `contacts`
- `registration_steps`
- `required_documents`
- `faqs`
- `conversation_logs`

**Auto-created files:**
- `refugee_chatbot.db` - Main database
- `refugee_chatbot.db-shm` - Shared memory (WAL mode)
- `refugee_chatbot.db-wal` - Write-ahead log

## 📦 Generated Directories

### `node_modules/`
NPM dependencies (git-ignored)

### `dist/`
Compiled JavaScript from TypeScript (git-ignored)

## 🎯 Import Path Aliases

Configured in `tsconfig.json`:

```typescript
import logger from '@config/logger.js';
import { MessageService } from '@services/MessageService.js';
import { ServiceRepository } from '@repositories/ServiceRepository.js';
import { BotResponse } from '@types/index.js';
```

## 🔒 Security Files (Git-ignored)

- `.env` - Environment variables with secrets
- `*.db` - Database files with user data
- `logs/*.log` - Log files with sensitive info
- `*.json` (Google Cloud credentials)

## 📏 Code Standards

### TypeScript
- Strict type checking
- Explicit return types for exports
- No `any` without justification
- Interfaces for data structures

### Error Handling
- Try-catch for async operations
- Custom AppError classes
- Proper HTTP status codes
- Detailed error logging

### Logging
- Info: Normal operations
- Warn: Unexpected but handled
- Error: Failures requiring attention
- Debug: Detailed debugging info

### Naming Conventions
- Files: PascalCase for classes, camelCase for utils
- Classes: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Interfaces: PascalCase (no I prefix)

---

**File count:** ~30 source files + configs
**Lines of code:** ~2,500 (excluding node_modules)
**Language:** TypeScript 5.3+
**Runtime:** Node.js 18+