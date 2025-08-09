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
            // Save token
            localStorage.setItem('token', data.token);

            // Save username (make sure backend sends `username` in response)
            localStorage.setItem('username', data.username);

            // Redirect to chat page
            window.location.href = 'chat.html';
        } 
        else if (res.status === 404) {
            alert('User not found. Please sign up.');
        } 
        else if (res.status === 401) {
            alert('Incorrect password. Please try again.');
        } 
        else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error("Error logging in:", error);
        alert("Something went wrong. Please try again.");
    }
});
