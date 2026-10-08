async function registerUser() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if (!name || !email || !password) {
        message.textContent = "Please fill all fields.";
        message.style.color = "red";
        return;
    }

    const user = {
        name: name,
        email: email,
        password: password
    };

    try {

        const response = await fetch("/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {

            message.textContent =
                "Registration successful! Redirecting to login...";

            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } else {

            const error = await response.text();

            message.textContent = error;
            message.style.color = "red";
        }

    } catch (error) {

        message.textContent =
            "Unable to connect to server.";

        message.style.color = "red";
    }
}