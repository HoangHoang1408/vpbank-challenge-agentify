# Environment Setup Guide

## Quick Setup

### Step 1: Create .env File

Create a `.env` file in the `mcp_server` directory:

```bash
cd mcp_server
touch .env
```

### Step 2: Add Required Variables

Copy the following content into your `.env` file:

```env
# Application Configuration
APP_PORT=3000

# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_NAME=postgres

# OpenAI API Configuration
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your-openai-api-key-here
```

### Step 3: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Navigate to "API keys" section
4. Click "Create new secret key"
5. Copy the generated key
6. Replace `your-openai-api-key-here` in your `.env` file with the actual key

### Step 4: Verify Configuration

The application will automatically validate your environment variables on startup. If any required variables are missing, you'll see an error message like:

```
Error: The following environment variables are missing or invalid:
- OPENAI_API_KEY is required
```

## How It Works

### ConfigService Integration

The application uses NestJS's `ConfigService` to manage environment variables:

1. **Configuration Loading**: The `ConfigModule` in `app.module.ts` loads the `.env` file
2. **Validation**: Joi schema validates all required variables on startup
3. **Type-Safe Access**: Services access config through `ConfigService.get<T>('key')`

### Configuration Flow

```
.env file
    ↓
ConfigModule (loads file)
    ↓
Joi Validation (validates schema)
    ↓
ConfigService (provides type-safe access)
    ↓
Tools & Services (use configuration)
```

### Configuration Structure

The configuration is organized in `src/config/configuration.ts`:

```typescript
{
  app: {
    port: number
  },
  postgres: {
    host: string,
    port: number,
    username: string,
    password: string,
    database: string
  },
  openai: {
    apiKey: string  // ← Used by recommendation tools
  }
}
```

### Accessing Configuration in Tools

Example from `recommendation.tool.ts`:

```typescript
constructor(
    private readonly configService: ConfigService,
) {
    // Access nested config values
    const apiKey = this.configService.get<string>('openai.apiKey');
    
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY not set in .env file");
    }
    
    this.openai = new OpenAI({ apiKey });
}
```

## Docker Deployment

When using Docker Compose, the `.env` file is automatically loaded:

```yaml
services:
  mcp_server:
    env_file:
      - .env  # ← Loads .env automatically
```

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable is not set"

**Solution**: Make sure your `.env` file contains a valid OpenAI API key:
```env
OPENAI_API_KEY=sk-proj-...
```

### Error: "Cannot connect to database"

**Solution**: Check your PostgreSQL configuration:
```env
POSTGRES_HOST=localhost  # or 'postgres' if using Docker
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
```

### Error: "Port already in use"

**Solution**: Change the application port:
```env
APP_PORT=3001  # or any available port
```

## Security Best Practices

1. **Never commit `.env` to git**
   - The `.env` file is already in `.gitignore`
   - Use `.env.example` for documentation

2. **Use different keys for different environments**
   - Development: Use a separate API key
   - Production: Use a different, more restricted key

3. **Rotate keys regularly**
   - Change your OpenAI API key periodically
   - Update the `.env` file and restart the application

4. **Restrict API key permissions**
   - In OpenAI dashboard, set usage limits
   - Monitor API usage regularly

## Additional Resources

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)

