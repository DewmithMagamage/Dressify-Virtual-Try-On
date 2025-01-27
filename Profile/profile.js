// script.js
document.querySelector('.delete-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account?')) {
      alert('Account deleted successfully.');
    }
  });
  