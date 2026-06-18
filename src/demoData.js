const courses = [
  {
    id: 1,
    title: "Frontend Foundations",
    category: "Web Development",
    level: "Beginner",
    duration: "6 weeks",
    instructor: "Aarav Mehta",
    description:
      "Learn semantic HTML, responsive CSS, and practical JavaScript by building real interface components.",
    lessons: 18,
    rating: 4.8,
    price: 0,
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    title: "REST API Engineering",
    category: "Backend",
    level: "Intermediate",
    duration: "5 weeks",
    instructor: "Nisha Rao",
    description:
      "Design, build, secure, and document RESTful APIs with Node.js, Express, authentication, and validation.",
    lessons: 22,
    rating: 4.7,
    price: 1499,
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    title: "Python for Data Workflows",
    category: "Python",
    level: "Beginner",
    duration: "4 weeks",
    instructor: "Kabir Sen",
    description:
      "Use Python scripts to clean course data, automate reports, and prepare datasets for dashboards.",
    lessons: 15,
    rating: 4.6,
    price: 999,
    image:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 4,
    title: "MySQL Database Design",
    category: "Database",
    level: "Intermediate",
    duration: "6 weeks",
    instructor: "Sara Kapoor",
    description:
      "Model users, courses, enrollments, lessons, and progress with normalized SQL tables and useful indexes.",
    lessons: 20,
    rating: 4.9,
    price: 1299,
    image:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80"
  }
];

const users = [
  {
    id: 1,
    name: "Demo Learner",
    email: "learner@example.com",
    role: "student",
    passwordHash: "$2a$10$rFx7pJVpMiBJEe.JNLslrOVXr70C5sbrPf5RR2KcTParBArHX9bvS"
  }
];

const enrollments = [
  { id: 1, user_id: 1, course_id: 1, progress: 72 },
  { id: 2, user_id: 1, course_id: 2, progress: 38 }
];

module.exports = {
  courses,
  users,
  enrollments
};
