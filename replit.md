# Spirit Cloud

## Overview

Spirit Cloud is an introspective web application that guides users through a philosophical questionnaire to generate a personalized "Spirit" persona. Users answer deep, reflective questions (in Korean) about their desires, regrets, masks, and existence. The application then uses AI to analyze these responses and create a unique spirit character, which becomes an AI chat companion for ongoing conversations.

The experience flows: Landing → Questionnaire (4 questions with voice/text input) → Spirit Generation → Chat with your Spirit.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and spirit visualizations
- **Voice Input**: Web Speech API (native browser support) for Korean speech recognition

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **Build**: Vite for frontend, esbuild for server bundling
- **API Pattern**: REST endpoints with SSE (Server-Sent Events) for streaming chat responses

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` and `shared/models/chat.ts`
- **Key Tables**:
  - `sessions`: Stores questionnaire answers and spirit generation results
  - `conversations`: Chat conversation metadata
  - `messages`: Individual chat messages with role (user/assistant)

### AI Integration
- **Provider**: OpenAI API via Replit AI Integrations
- **Features**:
  - Spirit persona generation from questionnaire answers
  - Streaming chat responses with SSE
  - Speech-to-text for voice input
  - Text-to-speech capabilities
  - Image generation support

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` folder used by both client and server
- **API Routes**: Centralized route definitions in `shared/routes.ts` with Zod validation
- **Modular Integrations**: AI features organized in `server/replit_integrations/` (chat, audio, image, batch)
- **Storage Abstraction**: Database operations wrapped in storage classes for testability

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and migrations

### AI Services
- **OpenAI API**: Accessed through Replit AI Integrations
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
  - Used for: Chat completions, speech-to-text, text-to-speech, image generation

### Third-Party Libraries
- **shadcn/ui + Radix UI**: Comprehensive UI component library
- **Framer Motion**: Animation library for spirit visualizations
- **FFmpeg**: Audio format conversion for voice input (server-side)
- **connect-pg-simple**: PostgreSQL session storage for Express

### Browser APIs
- **Web Speech API**: Client-side Korean speech recognition
- **MediaRecorder API**: Voice recording in WebM/Opus format
- **AudioWorklet**: Low-latency audio playback for streaming responses