USE learnflow;

INSERT INTO users (name, email, password_hash, role)
VALUES
  (
    'Demo Learner',
    'learner@example.com',
    '$2a$10$rFx7pJVpMiBJEe.JNLslrOVXr70C5sbrPf5RR2KcTParBArHX9bvS',
    'student'
  )
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO courses
  (title, category, level, duration, instructor, description, lessons, rating, price, image)
VALUES
  (
    'Frontend Foundations',
    'Web Development',
    'Beginner',
    '6 weeks',
    'Aarav Mehta',
    'Learn semantic HTML, responsive CSS, and practical JavaScript by building real interface components.',
    18,
    4.8,
    0,
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'REST API Engineering',
    'Backend',
    'Intermediate',
    '5 weeks',
    'Nisha Rao',
    'Design, build, secure, and document RESTful APIs with Node.js, Express, authentication, and validation.',
    22,
    4.7,
    1499,
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Python for Data Workflows',
    'Python',
    'Beginner',
    '4 weeks',
    'Kabir Sen',
    'Use Python scripts to clean course data, automate reports, and prepare datasets for dashboards.',
    15,
    4.6,
    999,
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'MySQL Database Design',
    'Database',
    'Intermediate',
    '6 weeks',
    'Sara Kapoor',
    'Model users, courses, enrollments, lessons, and progress with normalized SQL tables and useful indexes.',
    20,
    4.9,
    1299,
    'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80'
  );

INSERT INTO enrollments (user_id, course_id, progress)
SELECT u.id, c.id, 72
FROM users u
JOIN courses c ON c.title = 'Frontend Foundations'
WHERE u.email = 'learner@example.com'
ON DUPLICATE KEY UPDATE progress = VALUES(progress);

INSERT INTO enrollments (user_id, course_id, progress)
SELECT u.id, c.id, 38
FROM users u
JOIN courses c ON c.title = 'REST API Engineering'
WHERE u.email = 'learner@example.com'
ON DUPLICATE KEY UPDATE progress = VALUES(progress);
