// Smooth Animation for Content on Page Load
window.addEventListener('load', () => {
    const content = document.querySelector('.content');
    content.style.opacity = 0;
    content.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      content.style.transition = 'opacity 1s ease, transform 1s ease';
      content.style.opacity = 1;
      content.style.transform = 'translateY(0)';
    }, 100);
  });
  
  // Button Hover Shadows (Extra Interaction)
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
    });
  
    button.addEventListener('mouseleave', () => {
      button.style.boxShadow = 'none';
    });
  });
  