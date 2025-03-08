
const togglePasswordVisibility = (passwordField, toggleIcon) => {
  const inputField = document.querySelector(passwordField);
  const icon = document.querySelector(toggleIcon);

  icon.addEventListener('click', () => {
    const type = inputField.type === 'password' ? 'text' : 'password';
    inputField.type = type;


    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });
};

document.addEventListener('DOMContentLoaded', () => {
  togglePasswordVisibility('#password', '#toggle-password');
  togglePasswordVisibility('#confirm-password', '#toggle-confirm-password');


  const form = document.querySelector('#signup-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault(); 
    console.log('Form Submitted:', {
      fullName: form.fullName.value,
      email: form.email.value,
      password: form.password.value,
    });
  });

  // Social button click handlers
  document.querySelector('#google-btn').addEventListener('click', () => {
    window.location.href = 'https://accounts.google.com/';
  });

  document.querySelector('#facebook-btn').addEventListener('click', () => {
    window.location.href = 'https://www.facebook.com/';
  });

  // Language toggle
  const languageDropdown = document.querySelector('#language-toggle');
  languageDropdown.addEventListener('click', () => {
    alert('Language selection dropdown clicked!');
  });
});
