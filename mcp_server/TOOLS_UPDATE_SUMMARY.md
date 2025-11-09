# MCP Server Tools Update Summary

This document summarizes the updates made to align the MCP server tools with the new version from the test notebook.

## Date: November 9, 2025

## Changes Made

### 1. New Tools Added

#### `recommendation.tool.ts`
Created a new tool file containing two AI-powered recommendation tools:

- **`recommend_card_products`**: 
  - Recommends top 3 suitable card products for a specific customer
  - Uses OpenAI GPT-4o to analyze customer profile and match with available card products
  - Returns Vietnamese-language recommendations
  - Parameters: `customerId`

- **`recommend_customers`**: 
  - Recommends top 3 suitable customers for a specific card product
  - Uses OpenAI GPT-4o to analyze card product profile and match with customers
  - Filters by relationship manager ID
  - Returns Vietnamese-language recommendations
  - Parameters: `cardProductId`

### 2. Updated Return Schema

All existing tools have been updated to include a `code` field in their return values to indicate success or failure:

- `code: "succeeded"` - Operation completed successfully
- `code: "failed"` - Operation failed

This change affects the following tools:

#### `customer.tool.ts` - `find_customer`
- Added `code` field to all return statements
- Updated success message format to match new schema

#### `card.tool.ts` - `find_card_product`
- Added `code` field to all return statements
- Updated success message format to match new schema

#### `rm_task.tool.ts`
Updated all four task-related tools:

- **`find_rm_task`**: Added `code` field to all return statements
- **`create_rm_task`**: 
  - Added `code` field
  - Added `ask_confirmation: true` for operations requiring user confirmation
  - Updated message from "Ask for confirmation" to "All input is now valid."
- **`update_rm_task`**: 
  - Added `code` field
  - Added `ask_confirmation: true` for operations requiring user confirmation
  - Updated message from "Ask for confirmation" to "All input is now valid."
- **`report_performance`**: Added `code` field to all return statements

### 3. Module Updates

#### `tool.module.ts`
- Added import for `RecommendationTool`
- Added `RecommendationTool` to providers array
- Added `RecommendationTool` to exports array

### 4. Key Features

#### OpenAI Integration
- The new recommendation tools use OpenAI GPT-4o model
- API key is read from environment variable `OPENAI_API_KEY`
- Temperature set to 0.7 for balanced creativity and consistency
- Prompts are in Vietnamese to match the banking context

#### Error Handling
- All tools have consistent error handling with appropriate error messages
- All error responses include the `code: "failed"` field
- All success responses include the `code: "succeeded"` field

#### Validation
- Customer ID validation
- Card product ID validation
- Relationship manager ID validation from request headers (`x-rm-id`)
- Date format validation (YYYY-MM-DD)
- Task status and type validation

### 5. Backward Compatibility

The changes maintain backward compatibility:
- All existing tool functionality remains unchanged
- New `code` field is additive and doesn't break existing implementations
- Tool names and parameters remain the same

## Testing Recommendations

1. Test the new recommendation tools with various customer and card product IDs
2. Verify that all tools return the `code` field correctly
3. Test confirmation flow for `create_rm_task` and `update_rm_task`
4. Ensure OpenAI API key is properly set in environment variables
5. Test error cases to verify proper error handling and `code: "failed"` responses

## Dependencies

- OpenAI package (already installed in package.json v6.8.1)
- All existing dependencies remain unchanged

## Configuration

### Environment Variables Setup

The application uses NestJS's `ConfigService` to read from a `.env` file. Create a `.env` file in the `mcp_server` directory with the following variables:

```bash
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

**Important Notes:**
- All variables listed above are **required** and validated on application startup
- The `OPENAI_API_KEY` is used by the new recommendation tools
- The ConfigService reads from the `.env` file automatically (configured in `app.module.ts`)
- For Docker deployment, the `.env` file is loaded via `env_file` in `docker-compose.yml`

## Tools Summary

### Existing Tools (Updated)
1. `find_customer` - Find customer by various criteria
2. `find_card_product` - Find card product by various criteria
3. `find_rm_task` - Find relationship manager task by criteria
4. `create_rm_task` - Create new task for relationship manager
5. `update_rm_task` - Update existing task
6. `report_performance` - Get performance report for RM

### New Tools
7. `recommend_card_products` - AI-powered card product recommendations for customers
8. `recommend_customers` - AI-powered customer recommendations for card products

## Migration Notes

No migration is required. The changes are additive and maintain full backward compatibility with existing implementations.

## Implementation Details

### ConfigService Integration

The `RecommendationTool` now properly uses NestJS's `ConfigService` instead of directly accessing `process.env`:

```typescript
constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly configService: ConfigService,  // ← Injected
) {
    // Read from ConfigService which loads from .env file
    const apiKey = this.configService.get<string>('openai.apiKey');
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set in .env file.");
    }
    this.openai = new OpenAI({ apiKey });
}
```

**Benefits:**
- ✅ Consistent with NestJS best practices
- ✅ Centralized configuration management
- ✅ Type-safe configuration access
- ✅ Validation on application startup
- ✅ Better testability with mock configurations

### Environment File Location

The `.env` file should be placed in the root of the `mcp_server` directory:

```
mcp_server/
├── .env                  ← Create this file
├── .env.example          ← Reference template (if exists)
├── src/
├── package.json
└── docker-compose.yml
```

**Quick Setup Command:**

```bash
# Navigate to mcp_server directory
cd mcp_server

# Create .env file from the template above
cat > .env << 'EOF'
APP_PORT=3000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_NAME=postgres
OPENAI_API_KEY=your-openai-api-key-here
EOF

# Update OPENAI_API_KEY with your actual key
# Edit the .env file and replace 'your-openai-api-key-here'
```

