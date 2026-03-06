const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

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
