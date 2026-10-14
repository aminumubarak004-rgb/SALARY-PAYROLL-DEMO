const form = document.getElementById('login-form');
const requestedPage = new URLSearchParams(window.location.search).get('redirect');
const allowedPages = new Set(['index.html', 'employees.html', 'company.html', 'payroll.html']);
const redirectAfterLogin = allowedPages.has(requestedPage) ? requestedPage : 'index.html';
const passwordInput = document.getElementById('login-password');
const passwordToggle = document.getElementById('password-toggle');

if (passwordToggle && passwordInput) {
  passwordToggle.addEventListener('click', () => {
    const shouldShow = passwordInput.type === 'password';
    passwordInput.type = shouldShow ? 'text' : 'password';
    passwordToggle.textContent = shouldShow ? 'Hide' : 'Show';
    passwordToggle.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
    passwordInput.focus();
  });
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = passwordInput.value;
    const errorElement = document.getElementById('login-error');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, redirect: redirectAfterLogin }),
        credentials: 'same-origin',
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        errorElement.textContent = result.message || 'The email or password is incorrect, or the account is inactive.';
        return;
      }

      window.location.href = result.redirect || redirectAfterLogin;
    } catch (error) {
      errorElement.textContent = 'The sign-in service is not available at the moment. Please try again in a moment.';
    }
  });
}