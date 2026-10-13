async function loginUser() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if (!email || !password) {
        message.textContent = "Please enter email and password.";
        message.style.color = "red";
        return;
    }

    const user = {
        email: email,
        password: password
    };

    message.textContent = "Connecting to server...";
    message.style.color = "blue";

    try {
        const response = await fetch(
            "https://ecommerce-store-hui4.onrender.com/api/users/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            }
        );

        const responseText = await response.text();

        if (!response.ok) {
            message.textContent =
                "Login failed (" + response.status + "): " + responseText;
            message.style.color = "red";
            return;
        }

        let data;

        try {
            data = JSON.parse(responseText);
        } catch {
            message.textContent =
                "Server response format is incorrect. Please check backend.";
            message.style.color = "red";
            console.error("Unexpected response:", responseText);
            return;
        }

        localStorage.setItem("loggedInUser", data.email || email);

        message.textContent = "Login successful!";
        message.style.color = "green";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (error) {
        console.error("Login error:", error);

        message.textContent =
            "Connection failed. Check browser Console (F12) for details.";

        message.style.color = "red";
    }
}