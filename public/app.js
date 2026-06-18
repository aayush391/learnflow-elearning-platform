const state = {
  courses: [],
  token: localStorage.getItem("learnflow_token"),
  user: JSON.parse(localStorage.getItem("learnflow_user") || "null"),
  authMode: "login"
};

const courseGrid = document.querySelector("#courseGrid");
const courseCount = document.querySelector("#courseCount");
const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const authForm = document.querySelector("#authForm");
const authMessage = document.querySelector("#authMessage");
const authSubmit = document.querySelector("#authSubmit");
const authTitle = document.querySelector("#authTitle");
const accountSummary = document.querySelector("#accountSummary");
const accountName = document.querySelector("#accountName");
const accountEmail = document.querySelector("#accountEmail");
const tabs = document.querySelectorAll(".tab");
const registerOnly = document.querySelectorAll(".register-only");
const enrollmentList = document.querySelector("#enrollmentList");
const dashboardTitle = document.querySelector("#dashboardTitle");
const logoutButton = document.querySelector("#logoutButton");
const panelLogoutButton = document.querySelector("#panelLogoutButton");
const refreshEnrollments = document.querySelector("#refreshEnrollments");

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function formatPrice(price) {
  return Number(price) === 0 ? "Free" : `INR ${Number(price).toLocaleString("en-IN")}`;
}

function renderCourses() {
  courseCount.textContent = state.courses.length;

  if (!state.courses.length) {
    courseGrid.innerHTML = '<p class="muted">No courses match your filters.</p>';
    return;
  }

  courseGrid.innerHTML = state.courses
    .map(
      (course) => `
        <article class="course-card">
          <img src="${course.image}" alt="${course.title}" loading="lazy" />
          <div class="course-body">
            <div class="course-meta">
              <span class="badge">${course.category}</span>
              <span>${course.level}</span>
              <span>${course.duration}</span>
            </div>
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <div class="course-meta">
              <span>${course.lessons} lessons</span>
              <span>Rating ${course.rating}</span>
              <span>${course.instructor}</span>
            </div>
            <div class="course-footer">
              <span class="price">${formatPrice(course.price)}</span>
              <button class="button primary" type="button" data-enroll="${course.id}">
                Enroll
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

async function loadCourses() {
  const params = new URLSearchParams({
    search: searchInput.value,
    category: categorySelect.value
  });
  state.courses = await api(`/api/courses?${params.toString()}`);
  renderCourses();
}

function setAuthMode(mode) {
  state.authMode = mode;
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  registerOnly.forEach((field) => {
    field.hidden = mode !== "register";
  });
  authSubmit.textContent = mode === "login" ? "Login" : "Create account";
  authMessage.textContent = "";
  authMessage.classList.remove("success");
}

function saveSession(payload) {
  state.token = payload.token;
  state.user = payload.user;
  localStorage.setItem("learnflow_token", state.token);
  localStorage.setItem("learnflow_user", JSON.stringify(state.user));
  updateSessionUI();
}

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem("learnflow_token");
  localStorage.removeItem("learnflow_user");
  authForm.reset();
  authForm.elements.email.value = "learner@example.com";
  authForm.elements.password.value = "password123";
  authMessage.textContent = "";
  authMessage.classList.remove("success");
  updateSessionUI();
  enrollmentList.innerHTML = '<p class="muted">Login to view your enrolled courses.</p>';
}

function updateSessionUI() {
  const isLoggedIn = Boolean(state.user);

  logoutButton.hidden = !isLoggedIn;
  tabs.forEach((tab) => {
    tab.hidden = isLoggedIn;
  });
  authForm.hidden = isLoggedIn;
  accountSummary.hidden = !isLoggedIn;
  authTitle.textContent = isLoggedIn ? "You are signed in" : "Sign in or create an account";
  dashboardTitle.textContent = isLoggedIn ? `${state.user.name}'s dashboard` : "Demo dashboard";

  if (isLoggedIn) {
    accountName.textContent = state.user.name;
    accountEmail.textContent = state.user.email;
  }
}

async function loadEnrollments() {
  if (!state.token) {
    enrollmentList.innerHTML = '<p class="muted">Login to view your enrolled courses.</p>';
    return;
  }

  const enrollments = await api("/api/me/enrollments");
  if (!enrollments.length) {
    enrollmentList.innerHTML = '<p class="muted">You have not enrolled in a course yet.</p>';
    return;
  }

  enrollmentList.innerHTML = enrollments
    .map((enrollment) => {
      const course = enrollment.course || enrollment;
      const progress = Number(enrollment.progress || 0);
      return `
        <article class="enrollment-item">
          <div>
            <strong>${course.title}</strong>
            <p class="muted">${course.category} - ${course.instructor}</p>
          </div>
          <div class="progress-track" aria-label="${progress}% complete">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <span class="muted">${progress}% complete</span>
        </article>
      `;
    })
    .join("");
}

async function enroll(courseId) {
  if (!state.token) {
    location.hash = "#dashboard";
    authMessage.textContent = "Please login before enrolling.";
    return;
  }

  await api(`/api/courses/${courseId}/enroll`, { method: "POST" });
  await loadEnrollments();
  location.hash = "#dashboard";
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setAuthMode(tab.dataset.mode));
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(authForm);
  const body = Object.fromEntries(formData.entries());
  body.email = String(body.email || "").trim().toLowerCase();
  body.name = String(body.name || "").trim();
  const endpoint = state.authMode === "login" ? "/api/auth/login" : "/api/auth/register";

  if (state.authMode === "register" && body.name.length < 2) {
    authMessage.textContent = "Please enter your name.";
    authMessage.classList.remove("success");
    return;
  }

  try {
    const payload = await api(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });
    saveSession(payload);
    authMessage.textContent = state.authMode === "login" ? "Logged in successfully." : "Account created.";
    authMessage.classList.add("success");
    await loadEnrollments();
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.classList.remove("success");
  }
});

courseGrid.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-enroll]");
  if (!button) {
    return;
  }

  try {
    await enroll(button.dataset.enroll);
  } catch (error) {
    alert(error.message);
  }
});

searchInput.addEventListener("input", loadCourses);
categorySelect.addEventListener("change", loadCourses);
logoutButton.addEventListener("click", clearSession);
panelLogoutButton.addEventListener("click", clearSession);
refreshEnrollments.addEventListener("click", loadEnrollments);

updateSessionUI();
setAuthMode("login");
loadCourses().catch((error) => {
  courseGrid.innerHTML = `<p class="muted">${error.message}</p>`;
});
loadEnrollments().catch(() => {});
