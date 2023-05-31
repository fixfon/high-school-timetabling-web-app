<p align="center">
<img align="center" height="120" src="./public/logo-light.svg">
</p>
<h1 align="center">
  TimetablePRO
</h1>
<h3 align="center">Optimized Timetable Creator Web Application for High Schools
</h3>
<p align="center"><b>Deployed at <a href="https://timetablepro.vercel.app/">TimetablePRO</a></b></p>

## Table of Contents

- <a href="#stack">The Stack</a>
- <a href="#quick-start">Quick Start</a>
- <a href="#about-the-project">About the Project</a>
- <a href="#features">Features</a>
- <a href="#further-more">Further More</a>

<h2 id="stack">The Stack</h2>

The project was built using the [create-t3-app](https://github.com/t3-oss/create-t3-app) boilerplate. The boilerplate is a full-stack web application template based on Next.js. Our project contains following stacks to solve certain problems.

- [Next.js](https://nextjs.org/) - React Framework for Production
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [TailwindCSS](https://tailwindcss.com/) - Utility-First CSS Framework
- [RadixUI](https://github.com/radix-ui/primitives) - Primitive UI Components
- [shadcn/ui](https://github.com/shadcn/ui) - UI Components built with TailwindCSS and RadixUI
- [Next-Auth](https://github.com/nextauthjs/next-auth) - Session and JWT based Authentication for Next.js
- [tRPC](https://trpc.io/) - End-to-End Typed RPC for secured client-server communication with React Query
- [React Hook Form](https://react-hook-form.com/) - Manageable Forms with React Hooks
- [Zod](https://zod.dev/) - TypeScript-first Schema Validation for both client and server
- [Argon2](https://github.com/ranisalt/node-argon2) - Password Hashing Algorithm
- [Axios](https://github.com/axios/axios) - Promise based HTTP client for out-of-the-box API calls
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Typescript and Node.js
- [PostgreSQL](https://www.postgresql.org/) - Open Source Relational Database
- [Railway](https://railway.app/) - Managed PostgreSQL Database Hosting
- [Vercel](https://vercel.com/) - Serverless Deployment Platform
- [AWS Lambda](https://aws.amazon.com/lambda/) - Serverless Compute Service to run backend algorithm

<h2 id="quick-start">Quick Start</h2>

### 1. Clone the repository

```bash
git clone https://github.com/fixfon/high-school-timetabling-web-app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup environment variables

```bash
# Create a .env file
DATABASE_URL=""
SERVERLESS_FUNCTION_URL=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

```

### 4. Setup database

```bash
prisma migrate dev --name init
prisma generate
```

### 5. Run the development server

```bash
pnpm dev
```

### 6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 7. Deploy to Vercel

### 8. Deploy to AWS Lambda

Deploy your serverless function to AWS Lambda. You can use the example function in `serverless.py` file. You can set an API Gateway to your function and provide it to the `SERVERLESS_FUNCTION_URL` environment variable.
In your 'createTimetable' router (in `src/server/api/routers/timetable.ts`), the function sends a post request to the serverless function. You can change the request and response type in the `./utils/create-timetable-request.ts` file.

<h2 id="about-the-project">About the Project</h2>

<h2 id="features">Features</h2>

<h2 id="further-more">Further More</h2>
