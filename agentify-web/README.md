# Agentify Web - Frontend Application

Modern, responsive web interface for the Agentify AI-powered CRM system.

## Overview

The Agentify Web frontend provides an intuitive interface for VPBank Relationship Managers to interact with the AI copilot, manage customers, handle tasks, and generate personalized communications.

## Features

- 💬 **Real-time Chat Interface**: Interact with the AI agent using natural Vietnamese language
- 🔄 **Streaming Responses**: Real-time response generation with SSE (Server-Sent Events)
- 👥 **Customer Management**: Search, view, and manage customer profiles
- 💳 **Card Product Recommendations**: AI-powered card suggestions
- 📧 **Email Generation**: Automated email and message creation with customization
- ✅ **Task Management**: Create, track, and manage tasks with performance metrics
- ⚙️ **Settings**: Customize tone, email signatures, and preferences
- 🎨 **Modern UI**: Built with Ant Design and Tailwind CSS

## Technology Stack

- **Next.js 16.0.1** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5.x** - Type-safe development
- **Ant Design 5.28.0** - Professional UI component library
- **TanStack Query 5.90.6** - Data fetching and caching
- **Zustand 5.0.8** - Lightweight state management
- **Axios 1.13.1** - HTTP client
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Sass 1.93.3** - CSS preprocessor

## Prerequisites

- Node.js 18+ or higher
- Yarn or npm package manager
- Agentify Backend running on port 8000
- MCP Server running on port 3000

## Installation

### 1. Install Dependencies

```bash
# Using Yarn (recommended)
yarn install

# Or using npm
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# MCP Server URL
NEXT_PUBLIC_MCP_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
# Using Yarn
yarn dev

# Or using npm
npm run dev
```

The application will be available at **http://localhost:3001**

## Project Structure

```
agentify-web/
├── app/                          # Next.js App Router
│   ├── (main)/                  # Main application pages
│   │   ├── _components/         # Page-specific components
│   │   ├── layout.tsx          # Main layout
│   │   └── page.tsx            # Home page
│   ├── api/                    # API routes
│   │   └── proxy/              # API proxy handlers
│   ├── globals.css             # Global styles
│   └── layout.tsx              # Root layout
│
├── components/                  # Reusable components
│   ├── agent/                  # Chat components
│   │   ├── Chat.tsx           # Main chat interface
│   │   └── ChatMessage.tsx    # Message display
│   ├── layout/                # Layout components
│   │   ├── Header.tsx         # Application header
│   │   └── MainLayout.tsx     # Main layout wrapper
│   ├── provider/              # Context providers
│   │   ├── AntdProvider.tsx   # Ant Design config
│   │   └── ReactQueryProvider.tsx  # React Query setup
│   └── setting/               # Settings components
│       ├── EmailSignatureSetting.tsx
│       └── ToneSetting.tsx
│
├── lib/                        # Utilities and APIs
│   ├── api/                   # API client functions
│   │   ├── axios.ts          # Axios configuration
│   │   ├── chat.ts           # Chat API
│   │   ├── customer.ts       # Customer API
│   │   ├── gen-email.ts      # Email generation API
│   │   ├── rm.ts             # RM API
│   │   └── task.ts           # Task API
│   └── utils/                # Helper functions
│       └── class-name.ts     # CSS class utilities
│
├── stores/                    # Zustand state stores
│   └── setting.ts            # Settings store
│
├── types/                     # TypeScript definitions
│   ├── chat.type.ts
│   ├── customer.type.ts
│   ├── gen-email.type.ts
│   ├── rm.type.ts
│   ├── task.type.ts
│   └── tone.type.ts
│
├── constants/                 # Application constants
│   ├── customer.constant.ts
│   └── tone.constant.ts
│
├── public/                    # Static assets
│   └── images/
│
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## Available Scripts

```bash
# Development
yarn dev              # Start development server with hot reload
yarn build            # Build for production
yarn start            # Start production server

# Code Quality
yarn lint             # Run ESLint
yarn format           # Format code with Prettier (if configured)

# Type Checking
yarn type-check       # Run TypeScript compiler check
```

## Key Features

### 1. Chat Interface

The main interface for interacting with the AI agent:

```typescript
import { Chat } from '@/components/agent';

<Chat 
  rmId={1} 
  onMessageSent={(message) => console.log(message)}
/>
```

Features:
- Real-time streaming responses
- Message history
- Tool execution visualization
- Confirmation dialogs for critical actions

### 2. Customer Search

Search and view customer information:

```typescript
import { useCustomers } from '@/lib/api/customer';

const { data: customers, isLoading } = useCustomers({
  name: 'Nguyễn',
  segment: 'DIAMOND'
});
```

### 3. Email Generation

Manage automated emails:

```typescript
import { useGeneratedEmails } from '@/lib/api/gen-email';

const { data: emails } = useGeneratedEmails({
  rmId: 1,
  status: 'DRAFT'
});
```

### 4. Task Management

Create and track tasks:

```typescript
import { useTasks } from '@/lib/api/task';

const { data: tasks } = useTasks({
  rmId: 1,
  status: 'PENDING'
});
```

## API Integration

### Chat API

```typescript
// Send message to AI agent
const response = await chatApi.sendMessage({
  message: 'Tìm khách hàng tên Thắng',
  thread_id: 'user-123',
  rm_id: 1
});

// Stream responses
const stream = chatApi.streamMessage({
  message: 'Hiệu suất của tôi như thế nào?',
  thread_id: 'user-123',
  rm_id: 1
});
```

### Customer API

```typescript
// Find customers
const customers = await customerApi.findCustomers({
  name: 'Nguyễn Văn A',
  segment: 'DIAMOND'
});

// Get customer details
const customer = await customerApi.getCustomer(customerId);
```

### Email API

```typescript
// List generated emails
const emails = await emailApi.listEmails({
  rmId: 1,
  status: 'DRAFT'
});

// Regenerate email
const newEmail = await emailApi.regenerateEmail(emailId, {
  customPrompt: 'Làm ngắn gọn hơn'
});

// Update status
await emailApi.updateStatus(emailId, 'SENT');
```

## State Management

Using Zustand for global state:

```typescript
// stores/setting.ts
import { create } from 'zustand';

interface SettingState {
  tone: string;
  emailSignature: string;
  setTone: (tone: string) => void;
  setEmailSignature: (signature: string) => void;
}

export const useSettingStore = create<SettingState>((set) => ({
  tone: 'professional',
  emailSignature: '',
  setTone: (tone) => set({ tone }),
  setEmailSignature: (signature) => set({ emailSignature: signature }),
}));
```

## Styling

### Ant Design Customization

```typescript
// components/provider/AntdProvider.tsx
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 8,
    },
  }}
>
  {children}
</ConfigProvider>
```

### Tailwind CSS

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600;
  }
}
```

## Performance Optimization

### Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const Chat = dynamic(() => import('@/components/agent/Chat'), {
  loading: () => <p>Loading chat...</p>,
  ssr: false
});
```

### React Query Configuration

```typescript
// components/provider/ReactQueryProvider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

## Docker Deployment

### Build Docker Image

```bash
# Build image
docker build -t agentify-web .

# Run container
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  -e NEXT_PUBLIC_MCP_URL=http://localhost:3000 \
  agentify-web
```

### Docker Compose

```yaml
services:
  agentify-web:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL=http://agentify-backend:8000
      - NEXT_PUBLIC_MCP_URL=http://mcp-server:3000
    depends_on:
      - agentify-backend
      - mcp-server
```

## Troubleshooting

### Common Issues

#### 1. API Connection Failed

```bash
# Check if backend is running
curl http://localhost:8000/health

# Check environment variables
cat .env.local
```

#### 2. Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
yarn install

# Rebuild
yarn build
```

#### 3. Type Errors

```bash
# Run type check
yarn type-check

# Update TypeScript
yarn add -D typescript@latest
```

## Best Practices

### Component Structure

```typescript
// components/example/Example.tsx
import { FC } from 'react';

interface ExampleProps {
  title: string;
  onAction: () => void;
}

export const Example: FC<ExampleProps> = ({ title, onAction }) => {
  return (
    <div className="example">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### API Error Handling

```typescript
import { useQuery } from '@tanstack/react-query';
import { message } from 'antd';

const { data, error } = useQuery({
  queryKey: ['customers'],
  queryFn: fetchCustomers,
  onError: (error) => {
    message.error(`Failed to load customers: ${error.message}`);
  },
});
```

### Loading States

```typescript
if (isLoading) return <Spin size="large" />;
if (error) return <Alert type="error" message="Failed to load data" />;
if (!data) return null;

return <DataDisplay data={data} />;
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checks
4. Test thoroughly
5. Submit a pull request

## License

Internal use only - VPBank Hackathon Project

---

**Part of the Agentify System**  
VPBank Technology Hackathon 2025 - Team #22
