
document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch("http://localhost:3000/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Login Successful!");
            localStorage.setItem("token", data.token);
            window.location.href = "chat.html"; // Redirect to chat page
        } else {
            alert(data.message || "Login failed");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        alert("Something went wrong. Please try again.");
    }
});
