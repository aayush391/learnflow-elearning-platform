require("dotenv").config();

const path = require("path");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const { getPool, hasDatabaseConfig } = require("./db");
const demoData = require("./demoData");

const app = express();
const jwtSecret = process.env.JWT_SECRET || "learnflow-demo-secret";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || "student" },
    jwtSecret,
    { expiresIn: "2h" }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "student"
  };
}

async function query(sql, params = {}) {
  const pool = getPool();
  if (!pool) {
    return null;
  }

  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: hasDatabaseConfig ? "mysql" : "demo-memory"
  });
});

app.get("/api/courses", async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim().toLowerCase();
    const category = String(req.query.category || "").trim();

    if (!hasDatabaseConfig) {
      const filtered = demoData.courses.filter((course) => {
        const matchesSearch =
          !search ||
          course.title.toLowerCase().includes(search) ||
          course.description.toLowerCase().includes(search) ||
          course.instructor.toLowerCase().includes(search);
        const matchesCategory = !category || course.category === category;
        return matchesSearch && matchesCategory;
      });

      return res.json(filtered);
    }

    const rows = await query(
      `SELECT id, title, category, level, duration, instructor, description,
              lessons, rating, price, image
       FROM courses
       WHERE (:search = '' OR LOWER(title) LIKE :likeSearch OR LOWER(description) LIKE :likeSearch)
         AND (:category = '' OR category = :category)
       ORDER BY created_at DESC`,
      { search, likeSearch: `%${search}%`, category }
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/courses/:id", async (req, res, next) => {
  try {
    const courseId = Number(req.params.id);

    if (!hasDatabaseConfig) {
      const course = demoData.courses.find((item) => item.id === courseId);
      return course
        ? res.json(course)
        : res.status(404).json({ message: "Course not found" });
    }

    const rows = await query(
      `SELECT id, title, category, level, duration, instructor, description,
              lessons, rating, price, image
       FROM courses
       WHERE id = :courseId`,
      { courseId }
    );

    return rows[0]
      ? res.json(rows[0])
      : res.status(404).json({ message: "Course not found" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (name.length < 2) {
      return res.status(400).json({ message: "Please enter your name" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (!hasDatabaseConfig) {
      const exists = demoData.users.some((user) => user.email === email);
      if (exists) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const user = {
        id: demoData.users.length + 1,
        name,
        email,
        role: "student",
        passwordHash
      };
      demoData.users.push(user);
      return res.status(201).json({ user: publicUser(user), token: createToken(user) });
    }

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (:name, :email, :passwordHash, 'student')`,
      { name, email, passwordHash }
    );

    const user = { id: result.insertId, name, email, role: "student" };
    res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already registered" });
    }
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    let user;
    if (!hasDatabaseConfig) {
      user = demoData.users.find((item) => item.email === email);
    } else {
      const rows = await query(
        "SELECT id, name, email, role, password_hash AS passwordHash FROM users WHERE email = :email",
        { email }
      );
      user = rows[0];
    }

    const validPassword = user && (await bcrypt.compare(password, user.passwordHash));
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({ user: publicUser(user), token: createToken(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/me/enrollments", requireAuth, async (req, res, next) => {
  try {
    const userId = Number(req.user.id);

    if (!hasDatabaseConfig) {
      const rows = demoData.enrollments
        .filter((enrollment) => enrollment.user_id === userId)
        .map((enrollment) => ({
          ...enrollment,
          course: demoData.courses.find((course) => course.id === enrollment.course_id)
        }));
      return res.json(rows);
    }

    const rows = await query(
      `SELECT e.id, e.user_id, e.course_id, e.progress, e.created_at,
              c.title, c.category, c.level, c.duration, c.instructor, c.image
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = :userId
       ORDER BY e.created_at DESC`,
      { userId }
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/courses/:id/enroll", requireAuth, async (req, res, next) => {
  try {
    const courseId = Number(req.params.id);
    const userId = Number(req.user.id);

    if (!hasDatabaseConfig) {
      const course = demoData.courses.find((item) => item.id === courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      let enrollment = demoData.enrollments.find(
        (item) => item.course_id === courseId && item.user_id === userId
      );
      if (!enrollment) {
        enrollment = {
          id: demoData.enrollments.length + 1,
          user_id: userId,
          course_id: courseId,
          progress: 0
        };
        demoData.enrollments.push(enrollment);
      }

      return res.status(201).json({ ...enrollment, course });
    }

    await query(
      `INSERT INTO enrollments (user_id, course_id, progress)
       VALUES (:userId, :courseId, 0)
       ON DUPLICATE KEY UPDATE course_id = course_id`,
      { userId, courseId }
    );

    res.status(201).json({ message: "Enrollment saved" });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }

  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: "Something went wrong",
    detail: process.env.NODE_ENV === "production" ? undefined : error.message
  });
});

module.exports = app;
