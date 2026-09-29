const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if (!users.length) {
    console.log('No user found');
    return;
  }

  for (const user of users) {
    const jobs = [
      {
        userId: user.id,
        company: 'Google',
        position: 'Senior AI Engineer',
        status: 'SAVED',
        jobType: 'FULL_TIME',
        location: 'Mountain View, CA',
        salary: '$180,000 - $250,000',
        description: 'We are looking for a Senior AI Engineer to join the DeepMind team. You will work on cutting edge language models and agentic workflows.\n\nRequirements:\n- 5+ years of experience with Python and PyTorch\n- Experience building LLM applications\n- Strong algorithmic foundation'
      },
      {
        userId: user.id,
        company: 'Vercel',
        position: 'Frontend Architect',
        status: 'INTERVIEWING',
        jobType: 'FULL_TIME',
        location: 'Remote',
        salary: '$160,000',
        description: 'Join Vercel to help build the future of the web. You will architect high performance Next.js frontends and work directly with the open source community.\n\nRequirements:\n- Deep expertise in React and Next.js\n- Experience with Tailwind CSS\n- Open source contributions'
      },
      {
        userId: user.id,
        company: 'Netflix',
        position: 'Backend Developer',
        status: 'APPLIED',
        jobType: 'FULL_TIME',
        location: 'Los Gatos, CA',
        salary: '$200,000',
        description: 'Build scalable microservices for Netflix streaming infrastructure.\n\nRequirements:\n- Experience with Node.js and Express\n- Strong database knowledge (PostgreSQL)\n- Understanding of distributed systems'
      }
    ];

    for (const job of jobs) {
      await prisma.job.create({ data: job });
    }
    console.log('Seeded 3 jobs for', user.email);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
