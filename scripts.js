// login page

const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username === "admin" && password === "admin123") {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "main.html";
    } else {
      alert("Invalid Username or Password");
    }
  });
}

function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}

// main page access control

const API = "https://phi-lab-server.vercel.app/api/v1/lab/issues";

const container = document.getElementById("issuesContainer");
const count = document.getElementById("issueCount");
const loading = document.getElementById("loading");
const tabButtons = document.querySelectorAll(".tabBtn");

async function loadIssues(type = "all") {
  if (!container) return;

  container.innerHTML = "";
  loading.classList.remove("hidden");

  try {
    const response = await fetch(API);
    const result = await response.json();
    let issues = result.data || [];

    // filtering

    if (type === "open") {
      issues = issues.filter((issue) => {
        return issue.status && issue.status.toLowerCase() === "open";
      });
    }

    if (type === "closed") {
      issues = issues.filter((issue) => {
        return issue.status && issue.status.toLowerCase() === "closed";
      });
    }

    // btn active status

    tabButtons.forEach((btn) => {
      btn.classList.remove("btn-primary");
    });

    if (type === "all") tabButtons[0].classList.add("btn-primary");
    if (type === "open") tabButtons[1].classList.add("btn-primary");
    if (type === "closed") tabButtons[2].classList.add("btn-primary");

    loading.classList.add("hidden");

    count.innerText = issues.length + " Issues";

    issues.forEach((issue) => {
      createCard(issue);
    });
  } catch (err) {
    console.error("Issue load failed:", err);
    loading.classList.add("hidden");
  }
}

function getCategoryColor(category) {
  if (!category) {
    return "badge badge-neutral";
  }

  const value = category.toLowerCase();

  if (value.includes("bug")) {
    return "badge badge-error";
  }

  if (value.includes("enhancement")) {
    return "badge badge-success";
  }

  if (value.includes("help")) {
    return "badge badge-warning";
  }

  return "badge badge-neutral";
}

// labels function

function getLabels(issue) {
  let html = "";

  if (issue.category) {
    html += `
      <span class="${getCategoryColor(issue.category)}">
        ${issue.category}
      </span>
    `;
  }

  if (issue.labels && issue.labels.length > 0) {
    issue.labels.forEach((label) => {
      html += `
        <span class="${getCategoryColor(label)}">
          ${label}
        </span>
      `;
    });
  }

  return html;
}

// create card issue

function createCard(issue) {
  const status = issue.status ? issue.status.toLowerCase() : "";

  let borderClass = "border-t-4";

  if (status === "open") {
    borderClass += " border-[#00A96E]";
  } else {
    borderClass += " border-[#8B5CF6]";
  }

  const icon =
    status === "open"
      ? "./assets/Open-Status.png"
      : "./assets/Closed-Status.png";

  let priorityClass = "badge";

  if (issue.priority) {
    const priority = issue.priority.toLowerCase();

    if (priority === "high") {
      priorityClass = "badge badge-error";
    } else if (priority === "medium") {
      priorityClass = "badge badge-warning";
    } else {
      priorityClass = "badge badge-ghost";
    }
  }

  const card = document.createElement("div");

  card.className = `
    bg-white
    p-5
    rounded-lg
    shadow
    hover:shadow-md
    transition
    cursor-pointer
    ${borderClass}
  `;

  card.innerHTML = `

    <div class="flex justify-between items-center">

      <img src="${icon}" class="w-5 h-5">

      <span class="${priorityClass}">
        ${issue.priority}
      </span>

    </div>

    <h2 class="font-semibold mt-2">
      ${issue.title}
    </h2>

    <p class="text-sm text-[#64748B] mt-2">
      ${issue.description ? issue.description.slice(0, 90) : ""}...
    </p>

    <div class="flex gap-2 mt-4">
      ${getLabels(issue)}
    </div>

    <div class="flex justify-between mt-4 text-[12px] text-[#64748B]">

      <span>#${issue.id} by ${issue.author}</span>

      <span>${issue.createdAt}</span>

    </div>

  `;

  card.onclick = function () {
    openModal(issue.id);
  };

  container.appendChild(card);
}

// Modal

async function openModal(id) {
  try {
    const res = await fetch(
      `https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`,
    );

    const data = await res.json();
    const issue = data.data;

    document.getElementById("modalTitle").innerText = issue.title;
    document.getElementById("modalDesc").innerText = issue.description;
    document.getElementById("modalStatus").innerText = issue.status;
    document.getElementById("modalCategory").innerText = issue.category;
    document.getElementById("modalAuthor").innerText = issue.author;
    document.getElementById("modalAssignee").innerText = issue.author;
    document.getElementById("modalPriority").innerText = issue.priority;
    document.getElementById("modalDate").innerText = issue.createdAt;

    document.getElementById("issueModal").showModal();
  } catch (error) {
    console.error("Modal load failed:", error);
  }
}

// search issue

async function searchIssue() {
  const input = document.getElementById("searchInput");
  const text = input.value.trim();

  if (!text) return;

  loading.classList.remove("hidden");

  try {
    const res = await fetch(
      `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${text}`,
    );

    const data = await res.json();

    container.innerHTML = "";

    const issues = data.data || [];

    issues.forEach((issue) => {
      createCard(issue);
    });

    count.innerText = issues.length + " Issues";
  } catch (err) {
    console.error("Search error:", err);
  }

  loading.classList.add("hidden");
}

// initial load

if (container) {
  loadIssues();
}
