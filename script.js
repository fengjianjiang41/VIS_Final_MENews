document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll('.page');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // When a section comes into view, add a class or trigger an animation
          entry.target.classList.add('in-view');
        } else {
          // When a section is out of view, remove the class or reset the animation
          entry.target.classList.remove('in-view');
        }
      });
    }, {
      threshold: 0.5  // Trigger when 50% of the section is in view
    });
  
    // Observe all sections
    sections.forEach(section => observer.observe(section));
  });
  