# TestFlow Frontend

The web application for TestFlow, a mobile-first computer-based testing platform. It provides student and administrator experiences, including authentication, examinations, results, question management, and analytics.

## Stack

- React 19 and Vite
- Tailwind CSS
- React Router and TanStack Query
- Axios, React Hook Form, and Zod
- Progressive Web App support

## Run locally

Requirements: Node.js 20 or later and npm.

```bash
git clone https://github.com/Testflow-ng/testflow-frontend.git
cd testflow-frontend
npm install
cp .env.example .env.development
npm run dev
```

The development server is normally available at `http://localhost:5173`.

## Configuration

Set `VITE_API_URL` in `.env.development` to the TestFlow API address:

```env
VITE_API_URL=http://localhost:5000
```

## Useful commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
npm run format   # Format source files
```

## Related repositories

- [Backend API](https://github.com/Testflow-ng/testflow-backend)
- [Mobile app](https://github.com/Testflow-ng/testflow-mobile)
