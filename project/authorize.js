// Form and Input Elements
const form = document.getElementById('form');
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_input = document.getElementById('repeat-input');
const error_message = document.getElementById('error-message');

// Signup Form Submission
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email-input').value.trim();
    const name = document.getElementById('firstname-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
    const repeatPassword = document.getElementById('repeat-input').value.trim();

    try {
        const response = await fetch('/add-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password, repeat_password: repeatPassword }),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('username', result.user.name);
            window.location.href = 'homepage.html';
        } else {
            alert(result.error || 'Signup failed!');
        }
    } catch (error) {
        console.error('Error during signup:', error.message);
        alert('An unexpected error occurred.');
    }
});

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value.trim();

    if (!email || !password) {
        document.getElementById('error-message').textContent = 'Email and password are required!';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('username', result.user.name);
            window.location.href = 'homepage.html';
        } else {
            document.getElementById('error-message').textContent = result.error || 'Login failed!';
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        document.getElementById('error-message').textContent = 'An unexpected error occurred. Please try again.';
    }
});


// Real-time Input Validation for Signup and Login Forms
const allInputs = [firstname_input, email_input, password_input, repeat_input].filter(input => input != null);
allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect');
            error_message.innerText = '';
        }
    });
});

// Signup Form Validation
function getSignupFormErrors(firstname, email, password, repeat_password) {
    const errors = [];

    if (!firstname) errors.push('First name is required.');
    if (!email) {
        errors.push('Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address.');
    }
    if (!password) {
        errors.push('Password is required.');
    } else if (password.length < 8) {
        errors.push('Password must be at least 8 characters long.');
    }
    if (password !== repeat_password) {
        errors.push('Passwords do not match.');
    }

    return errors;
}

// Login Form Validation
function getLoginFormErrors(email, password) {
    const errors = [];

    if (!email) {
        errors.push('Email is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address.');
    }
    if (!password) {
        errors.push('Password is required.');
    }

    return errors;
}
