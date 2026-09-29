# 🚀 AI Job Tracker

![AI Job Tracker](https://img.shields.io/badge/AI-Powered-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

AI Job Tracker is a full-stack, AI-powered application designed to streamline the job search process. By leveraging modern web technologies and generative AI, it helps users track job applications, manage resumes, schedule interviews, and generate intelligent insights.

## ✨ Features

- **Job Application Dashboard**: Keep track of all your applications, their statuses, and deadlines in one place.
- **AI-Powered Resume Analysis**: Leverage Google GenAI to parse, evaluate, and optimize resumes for specific job descriptions.
- **Interview Management**: Track upcoming interviews, store notes, and prepare effectively.
- **Calendar Integration**: Visualize your job search timeline and upcoming events.
- **Notes & Documentation**: Keep personalized notes for companies, recruiters, and technical concepts.
- **Secure Authentication**: JWT-based authentication with encrypted passwords.

## 💻 Tech Stack

### Frontend (Client)
- **Framework**: [Next.js 16](https://nextjs.org/) & [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [React Query](https://tanstack.com/query/latest)
- **Data Visualization**: [Recharts](https://recharts.org/)

### Backend (Server)
- **Framework**: [Express.js](https://expressjs.com/) with TypeScript
- **Database**: [Prisma ORM](https://www.prisma.io/)
- **AI Integration**: [@google/genai](https://ai.google.dev/)
- **Security**: Helmet, bcryptjs, JWT (JSON Web Tokens), Express Rate Limit
- **Validation**: [Zod](https://zod.dev/)
- **File Uploads**: Multer

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Database (PostgreSQL/MySQL/etc. depending on your Prisma config)
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Saidur289/ai-job-tracker.git
   cd ai-job-tracker
   ```

2. **Install dependencies**
   Install dependencies for both the client and server.
   ```bash
   npm install -w client
   npm install -w server
   npm install # in the root directory
   ```

3. **Environment Variables**
   Set up your `.env` files for both the server and the root (if applicable) using `.env.example` as a template.
   ```bash
   # Add your Google GenAI API Key, Database URL, and JWT Secret
   ```

4. **Database Setup**
   Run the Prisma migrations to set up your database schema.
   ```bash
   npm run db:push -w server
   # To seed the database (optional)
   npm run db:seed -w server
   ```

5. **Run the application**
   You can start both the client and server concurrently from the root directory:
   ```bash
   npm run dev
   ```
   - Client will be available at `http://localhost:3000`
   - Server will be available at `http://localhost:5000` (or your configured port)

## 📁 Project Structure

This project is organized as a monorepo.
- `/client`: Next.js frontend application.
- `/server`: Express.js backend API and Prisma schema.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is [MIT](LICENSE) licensed.
