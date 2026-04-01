// ========================================
// Task Management System - Documentation Scripts
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Initialize sidebar toggle for mobile
    initSidebarToggle();
    
    // Initialize code copy buttons
    initCodeCopy();
    
    // Initialize scroll spy
    initScrollSpy();
});

// Navigation active state
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    });
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 20;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Sidebar toggle for mobile
function initSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 99;
        display: none;
    `;
    document.body.appendChild(overlay);
    
    // Create mobile toggle button
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-btn';
    mobileToggle.innerHTML = '☰';
    mobileToggle.style.cssText = `
        position: fixed;
        top: 15px;
        left: 15px;
        z-index: 101;
        background: var(--primary);
        color: white;
        border: none;
        width: 45px;
        height: 45px;
        border-radius: 8px;
        font-size: 24px;
        cursor: pointer;
        display: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(mobileToggle);
    
    // Show mobile toggle on small screens
    function checkMobile() {
        if (window.innerWidth <= 768) {
            mobileToggle.style.display = 'block';
        } else {
            mobileToggle.style.display = 'none';
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
        }
    }
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Toggle sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    }
    
    mobileToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    
    if (toggle) {
        toggle.addEventListener('click', toggleSidebar);
    }
}

// Copy code to clipboard
function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('.code-block, .code-example, .endpoint-section pre');
    
    codeBlocks.forEach(block => {
        // Create copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: #94a3b8;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        `;
        
        // Make parent relative for positioning
        block.style.position = 'relative';
        block.appendChild(copyBtn);
        
        // Copy functionality
        copyBtn.addEventListener('click', async function() {
            const code = block.querySelector('code') || block.querySelector('pre');
            if (code) {
                try {
                    await navigator.clipboard.writeText(code.textContent);
                    copyBtn.innerHTML = '✅ Copied!';
                    copyBtn.style.background = 'rgba(16, 185, 129, 0.2)';
                    copyBtn.style.borderColor = '#10b981';
                    copyBtn.style.color = '#10b981';
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = '📋 Copy';
                        copyBtn.style.background = 'rgba(255,255,255,0.1)';
                        copyBtn.style.borderColor = 'rgba(255,255,255,0.2)';
                        copyBtn.style.color = '#94a3b8';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            }
        });
        
        // Hover effect
        copyBtn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255,255,255,0.2)';
        });
        
        copyBtn.addEventListener('mouseleave', function() {
            if (!this.innerHTML.includes('Copied')) {
                this.style.background = 'rgba(255,255,255,0.1)';
            }
        });
    });
}

// Scroll spy for navigation
function initScrollSpy() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveLink() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 100) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Throttle scroll event
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial check
    updateActiveLink();
}

// Animate elements on scroll
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.card, .endpoint, .tech-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// Search functionality (optional enhancement)
function initSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search documentation...';
    searchInput.className = 'search-input';
    searchInput.style.cssText = `
        width: calc(100% - 20px);
        margin: 10px;
        padding: 10px 15px;
        border: 1px solid var(--gray-700);
        border-radius: 8px;
        background: var(--gray-800);
        color: white;
        font-size: 14px;
    `;
    
    const navMenu = document.querySelector('.nav-menu');
    navMenu.parentNode.insertBefore(searchInput, navMenu);
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const sections = document.querySelectorAll('.section');
        
        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            const navLink = document.querySelector(`a[href="#${section.id}"]`);
            
            if (text.includes(searchTerm) || searchTerm === '') {
                section.style.display = 'block';
                if (navLink) navLink.parentElement.style.display = 'block';
            } else {
                section.style.display = 'none';
                if (navLink) navLink.parentElement.style.display = 'none';
            }
        });
    });
}

// Print-friendly version
function printDocs() {
    window.print();
}

// Dark/Light mode toggle (optional)
function initThemeToggle() {
    const themeBtn = document.createElement('button');
    themeBtn.innerHTML = '🌙';
    themeBtn.className = 'theme-toggle';
    themeBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 100;
    `;
    document.body.appendChild(themeBtn);
    
    let isDark = false;
    
    themeBtn.addEventListener('click', function() {
        isDark = !isDark;
        document.body.classList.toggle('dark-mode');
        themeBtn.innerHTML = isDark ? '☀️' : '🌙';
    });
}

// Table of contents generator
function generateTOC() {
    const toc = document.createElement('div');
    toc.className = 'table-of-contents';
    
    const headings = document.querySelectorAll('.section-header h1');
    const tocList = document.createElement('ul');
    
    headings.forEach(heading => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.closest('.section').id}`;
        a.textContent = heading.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
    });
    
    toc.appendChild(tocList);
    return toc;
}

// Console welcome message
console.log('%c📋 Task Management System Documentation', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cBuilt with React, Node.js, Express, Prisma & SQLite', 'font-size: 12px; color: #64748b;');
console.log('%chttps://github.com/SauravDnj/Task-Management-System', 'font-size: 12px; color: #10b981;');
