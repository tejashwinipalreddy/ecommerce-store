async function loginUser() {

    const email = document.getElementById("email").value;
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

    try {

        const response = await fetch("https://ecommerce-store-hui4.onrender.com/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {

            const data = await response.json();

            // Login successful
            localStorage.setItem("loggedInUser", data.email);

            message.textContent = "Login successful!";
            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

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