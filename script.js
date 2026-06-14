// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
  document.body.classList.add('light');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#contact' && document.querySelector(href)) {
      e.preventDefault();
      const target = document.querySelector(href);
      target?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add scroll animation to elements
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe cards and items
document.querySelectorAll('.project-card, .experience-item, .opensource-card, .highlight-item, .skill-category, .stat-box').forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
  let current = '';
  const sections = document.querySelectorAll('section[id]');
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= (sectionTop - 200)) {
      current = section.getAttribute('id');
    }
  });

  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.style.color = 'var(--fg)';
    if (link.getAttribute('href').slice(1) === current) {
      link.style.color = 'var(--accent-light)';
    }
  });
});

// Add ripple effect to buttons
document.querySelectorAll('.btn, .theme-toggle').forEach(button => {
  button.addEventListener('mousedown', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = ripple.style.height = '0px';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.pointerEvents = 'none';
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    const animate = () => {
      let size = parseInt(ripple.style.width);
      size += 5;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.opacity = 1 - (size / 300);
      
      if (size < 300) {
        requestAnimationFrame(animate);
      } else {
        ripple.remove();
      }
    };
    animate();
  });
});

// ===== SKILL NAVIGATION FEATURE =====

// Handle skill clicks
document.querySelectorAll('.tag.clickable').forEach(skillTag => {
  skillTag.addEventListener('click', async function() {
    const skill = this.getAttribute('data-skill');
    
    // Add active state to clicked skill
    document.querySelectorAll('.tag.clickable').forEach(tag => {
      tag.classList.remove('skill-active');
    });
    this.classList.add('skill-active');
    
    // Step 1: Scroll to experience section
    const experienceSection = document.getElementById('experience');
    experienceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Wait for scroll to complete
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Step 2: Highlight ALL experience sections completely
    await highlightExperienceBySkill(skill);
    
    // Wait before moving to projects
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Scroll to projects section
    const projectsSection = document.getElementById('projects');
    projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Wait for scroll to complete
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Step 4: Highlight projects
    await highlightProjectsBySkill(skill);
  });
});

// Function to highlight experience items by skill
function highlightExperienceBySkill(skill) {
  const experienceItems = document.querySelectorAll('.experience-item');
  let matchedLines = [];
  
  // Find ONLY lines that contain the skill text
  experienceItems.forEach(item => {
    const skills = item.getAttribute('data-skills')?.split(',').map(s => s.trim()) || [];
    
    if (skills.includes(skill)) {
      const lines = item.querySelectorAll('.highlight-line');
      lines.forEach(line => {
        // Only add lines that mention the skill in their text
        if (line.textContent.toLowerCase().includes(skill.toLowerCase())) {
          matchedLines.push(line);
        }
      });
    }
  });
  
  // Return a Promise that resolves when all lines are animated
  return animateReadingSequence(matchedLines);
}

// Animate lines with reading effect (hand moves across text)
// Returns a Promise that resolves when all lines are complete
function animateReadingSequence(lines) {
  return new Promise((resolve) => {
    let currentLineIndex = 0;
    
    function animateNextLine() {
      if (currentLineIndex >= lines.length) {
        // All lines completed
        resolve();
        return;
      }
      
      const line = lines[currentLineIndex];
      const originalText = line.textContent.trim();
      
      // Wait for scroll and rendering
      line.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add yellow highlight
      line.classList.add('active-yellow');
      
      // Delay to ensure scroll completes
      setTimeout(() => {
        // Clear and rebuild line with character spans
        line.innerHTML = '';
        const charSpans = [];
        
        for (let i = 0; i < originalText.length; i++) {
          const charSpan = document.createElement('span');
          charSpan.className = 'char-span';
          charSpan.textContent = originalText[i];
          line.appendChild(charSpan);
          charSpans.push(charSpan);
        }
        
        // Create reading hand tooltip with proper styling
        const tooltip = document.createElement('div');
        tooltip.className = 'reading-tooltip';
        tooltip.textContent = '👆🏻';
        tooltip.style.display = 'block';
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
        document.body.appendChild(tooltip);
        
        let charIndex = 0;
        const readingSpeed = 50; // Speed of character reading
        
        const readInterval = setInterval(() => {
          // Remove previous highlight
          if (charIndex > 0 && charSpans[charIndex - 1]) {
            charSpans[charIndex - 1].classList.remove('reading-char');
          }
          
          if (charIndex < charSpans.length) {
            charSpans[charIndex].classList.add('reading-char');
            
            // Position hand above current character
            const charRect = charSpans[charIndex].getBoundingClientRect();
            if (charRect.top > 0) { // Only update if visible
              tooltip.style.top = (charRect.top + window.scrollY - 50) + 'px';
              tooltip.style.left = (charRect.left + window.scrollX + charRect.width / 2 - 20) + 'px';
              tooltip.style.visibility = 'visible';
            }
          }
          
          charIndex += 1;
          
          if (charIndex >= charSpans.length) {
            clearInterval(readInterval);
            if (charSpans[charSpans.length - 1]) {
              charSpans[charSpans.length - 1].classList.remove('reading-char');
            }
          }
        }, readingSpeed);
        
        // After reading completes
        const readDuration = originalText.length * readingSpeed + 500;
        setTimeout(() => {
          // Remove tooltip
          if (tooltip && tooltip.parentNode) {
            tooltip.remove();
          }
          
          // Restore original text and remove highlight
          line.textContent = originalText;
          line.classList.remove('active-yellow');
          
          // Pause before moving to next line
          setTimeout(() => {
            currentLineIndex += 1;
            animateNextLine();
          }, 800); // 0.8 second pause between lines
        }, readDuration);
      }, 300); // Wait for scroll to complete
    }
    
    // Start animation sequence
    animateNextLine();
  });
}

// Function to highlight projects by skill
function highlightProjectsBySkill(skill) {
  const projectCards = document.querySelectorAll('.project-card');
  const projectsSection = document.getElementById('projects');
  let matchingProjects = [];
  
  projectCards.forEach(card => {
    const skills = card.getAttribute('data-skills')?.split(',').map(s => s.trim()) || [];
    if (skills.includes(skill)) {
      matchingProjects.push(card);
    }
  });
  
  // Return a Promise that resolves when all projects are highlighted
  return new Promise((resolve) => {
    // Create medal popup at corner of projects section
    if (matchingProjects.length > 0) {
      createMedalPopup(projectsSection);
    }
    
    // If no matching projects, resolve immediately
    if (matchingProjects.length === 0) {
      resolve();
      return;
    }
    
    // Animate project highlights one by one with green glow
    matchingProjects.forEach((card, index) => {
      setTimeout(() => {
        // Apply green glow highlight
        card.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.3)';
        card.style.borderColor = 'rgba(16, 185, 129, 0.8)';
        card.style.borderWidth = '2px';
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          card.style.boxShadow = '';
          card.style.borderColor = '';
          card.style.borderWidth = '';
          
          // Resolve when last project animation completes
          if (index === matchingProjects.length - 1) {
            resolve();
          }
        }, 3000);
      }, index * 1200); // Stagger by 1.2 seconds with pause between
    });
  });
}

// Create medal popup at projects section corner
function createMedalPopup(targetSection) {
  if (!targetSection) {
    return;
  }

  // Get the bounding rectangle of projects section
  const rect = targetSection.getBoundingClientRect();
  
  // Create medal popup element
  const medal = document.createElement('div');
  medal.className = 'medal-popup';
  document.body.appendChild(medal);
  
  // Position at top-right corner of projects section
  const topPosition = rect.top + window.scrollY + 30;
  const leftPosition = rect.left + window.scrollX + rect.width - 120;
  
  medal.style.top = topPosition + 'px';
  medal.style.left = leftPosition + 'px';
  
  // Remove the medal after animation completes
  setTimeout(() => {
    medal.remove();
  }, 4000);
  // Reset as normal
  

}
