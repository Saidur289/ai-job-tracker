# 🚀 AI Job Tracker

![AI Job Tracker](https://img.shields.io/badge/AI-Powered-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

**AI Job Tracker** is a comprehensive, full-stack application designed to transform the chaotic job search process into a streamlined, data-driven, and highly organized workflow. By leveraging modern web technologies and Google's Generative AI, it acts as your personal career assistant—helping you track applications, optimize resumes, prepare for interviews, and land your dream job faster.

## 💡 Why Use AI Job Tracker? (User Benefits)

The modern job search is overwhelming. Juggling dozens of applications, tailoring resumes, and preparing for different interviews can easily lead to burnout and missed opportunities. AI Job Tracker solves this by providing:

- **Complete Organization**: No more messy spreadsheets. Centralize your entire job search pipeline—from the moment you save a listing to the final offer.
- **AI-Driven Edge**: Get intelligent feedback on your resumes and generate tailored interview questions based on the specific role you applied for, giving you a massive competitive advantage.
- **Reduced Anxiety**: With an integrated calendar and status boards, you always know exactly what your next step is, when your deadlines are, and who you need to follow up with.
- **Better Decision Making**: Track your ATS (Applicant Tracking System) scores and keep detailed notes on company culture, salary expectations, and interview performance to make informed career choices.

## ✨ Core Features

- **Job Application Dashboard**: A Kanban-style board to track applications across various stages (Saved, Applied, Screening, Interviewing, Offer, Rejected). Log critical details like salary, location, job type, and ATS scores.
- **AI-Powered Resume Analysis**: Upload your resumes and leverage Google GenAI to parse the text, provide actionable reviews, and evaluate how well you match specific job descriptions.
- **Intelligent Interview Prep**: Track upcoming interviews (Phone, Video, Technical, Onsite) and automatically generate **AI-tailored interview questions** and answers to practice before the big day.
- **Calendar & Timeline Integration**: Visualize your job search timeline. Keep track of application deadlines, scheduled interviews, and follow-up reminders in one intuitive calendar view.
- **Knowledge Base & Notes**: Create and pin personalized notes for companies, recruiters, technical concepts, or personal reflections, linked directly to specific job applications.
- **Beautiful, Fast UI**: Enjoy a stunning, responsive interface built with Next.js 16, Tailwind CSS v4, and smooth Framer Motion animations.
- **Secure Authentication**: Your career data is protected with robust JWT-based authentication and encrypted passwords.

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
