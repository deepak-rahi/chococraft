/**
 * ChocoCraft - Premium Chocolate Brand
 * Main JavaScript Module
 * 
 * @author ChocoCraft Team
 * @version 1.0.0
 */

'use strict';

/**
 * Application Configuration
 */
const CONFIG = {
  ANIMATION: {
    DURATION: {
      FAST: 150,
      BASE: 300,
      SLOW: 500,
      SLOWER: 700,
      PARTICLE_LIFE: 1000,
      RIPPLE_LIFE: 600
    },
    EASING: {
      EASE_OUT: 'ease-out',
      CUBIC_BEZIER: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
  },
  PARTICLES: {
    COUNT: 8,
    DISTANCE_BASE: 100,
    DISTANCE_RANDOM: 50,
    SIZE: '20px'
  },
  OBSERVER: {
    THRESHOLD: 0.1,
    ROOT_MARGIN: '0px 0px -50px 0px'
  }
};

/**
 * Utility Functions
 */
const Utils = {
  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Get element's bounding rectangle safely
   * @param {Element} element - DOM element
   * @returns {DOMRect|null} Bounding rectangle or null
   */
  getBoundingRect(element) {
    try {
      return element.getBoundingClientRect();
    } catch (error) {
      console.warn('Error getting bounding rect:', error);
      return null;
    }
  },

  /**
   * Create DOM element with attributes
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {string} content - Element content
   * @returns {Element} Created element
   */
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });

    if (content) {
      element.innerHTML = content;
    }

    return element;
  }
};

/**
 * Animation Controller
 */
class AnimationController {
  constructor() {
    this.observers = new Map();
    this.init();
  }

  /**
   * Initialize animation systems
   */
  init() {
    this.setupIntersectionObserver();
    this.setupParallaxScrolling();
  }

  /**
   * Setup Intersection Observer for fade-in animations
   */
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: CONFIG.OBSERVER.THRESHOLD,
      rootMargin: CONFIG.OBSERVER.ROOT_MARGIN
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          // Unobserve after animation to improve performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in-up').forEach(element => {
      observer.observe(element);
    });

    this.observers.set('fadeIn', observer);
  }

  /**
   * Setup parallax scrolling effects
   */
  setupParallaxScrolling() {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          
          // Hero parallax with smoother movement
          const heroContent = document.querySelector('.hero__content');
          if (heroContent) {
            heroContent.style.transform = `translate3d(0, ${scrolled * 0.1}px, 0)`;
          }

          // Texture parallax
          const textures = document.querySelectorAll('.hero__texture, .cta__texture');
          textures.forEach(texture => {
            texture.style.transform = `translate3d(0, ${scrolled * 0.05}px, 0)`;
          });
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * Create particle animation
   * @param {Element} element - Source element
   */
  createParticleAnimation(element) {
    const rect = Utils.getBoundingRect(element);
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const particles = [];

    for (let i = 0; i < CONFIG.PARTICLES.COUNT; i++) {
      const particle = this.createParticle(centerX, centerY, i);
      particles.push(particle);
      document.body.appendChild(particle);
    }

    // Cleanup particles after animation
    setTimeout(() => {
      particles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    }, CONFIG.ANIMATION.DURATION.PARTICLE_LIFE);
  }

  /**
   * Create individual particle
   * @param {number} centerX - Center X coordinate
   * @param {number} centerY - Center Y coordinate
   * @param {number} index - Particle index
   * @returns {Element} Particle element
   */
  createParticle(centerX, centerY, index) {
    const particle = Utils.createElement('div', {
      className: 'particle',
      style: `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        font-size: ${CONFIG.PARTICLES.SIZE};
        pointer-events: none;
        z-index: 1000;
        transition: all ${CONFIG.ANIMATION.DURATION.PARTICLE_LIFE}ms ${CONFIG.ANIMATION.EASING.EASE_OUT};
      `
    }, '🍫');

    // Animate particle
    requestAnimationFrame(() => {
      const angle = (360 / CONFIG.PARTICLES.COUNT) * index;
      const distance = CONFIG.PARTICLES.DISTANCE_BASE + Math.random() * CONFIG.PARTICLES.DISTANCE_RANDOM;
      const x = Math.cos(angle * Math.PI / 180) * distance;
      const y = Math.sin(angle * Math.PI / 180) * distance;

      particle.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg) scale(0)`;
      particle.style.opacity = '0';
    });

    return particle;
  }

  /**
   * Create ripple effect
   * @param {Element} button - Button element
   * @param {Event} event - Click event
   */
  createRippleEffect(button, event) {
    const rect = Utils.getBoundingRect(button);
    if (!rect) return;

    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = Utils.createElement('div', {
      className: 'ripple',
      style: `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple ${CONFIG.ANIMATION.DURATION.RIPPLE_LIFE}ms ease-out;
        pointer-events: none;
      `
    });

    // Ensure button has relative positioning
    const originalPosition = button.style.position;
    button.style.position = 'relative';
    button.style.overflow = 'hidden';

    button.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
      button.style.position = originalPosition;
    }, CONFIG.ANIMATION.DURATION.RIPPLE_LIFE);
  }
}

/**
 * Product Card Controller
 */
class ProductCardController {
  constructor(animationController) {
    this.animationController = animationController;
    this.init();
  }

  /**
   * Initialize product card interactions
   */
  init() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => this.setupCardInteractions(card));
  }

  /**
   * Setup interactions for a single product card
   * @param {Element} card - Product card element
   */
  setupCardInteractions(card) {
    // Hover effects for placeholder elements
    const placeholder = card.querySelector('.product-card__image[alt*="placeholder"]');
    
    if (placeholder) {
      card.addEventListener('mouseenter', () => this.handleCardHover(placeholder, true));
      card.addEventListener('mouseleave', () => this.handleCardHover(placeholder, false));
    }

    // Click interaction
    card.addEventListener('click', (event) => {
      // Prevent default if it's a button click
      if (event.target.tagName === 'BUTTON') return;
      
      this.handleCardClick(card);
    });

    // Keyboard support
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.handleCardClick(card);
      }
    });
  }

  /**
   * Handle card hover state
   * @param {Element} placeholder - Placeholder element
   * @param {boolean} isHovering - Hover state
   */
  handleCardHover(placeholder, isHovering) {
    if (isHovering) {
      placeholder.style.transform = 'scale(1.1) rotate(5deg)';
      placeholder.style.transition = `transform ${CONFIG.ANIMATION.DURATION.BASE}ms ease`;
    } else {
      placeholder.style.transform = 'scale(1) rotate(0deg)';
    }
  }

  /**
   * Handle card click
   * @param {Element} card - Product card element
   */
  handleCardClick(card) {
    this.animationController.createParticleAnimation(card);
    
    // Add click feedback
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
      card.style.transform = '';
    }, CONFIG.ANIMATION.DURATION.FAST);
  }
}

/**
 * Button Controller
 */
class ButtonController {
  constructor(animationController) {
    this.animationController = animationController;
    this.init();
  }

  /**
   * Initialize button interactions
   */
  init() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => this.setupButtonInteractions(button));
  }

  /**
   * Setup interactions for a single button
   * @param {Element} button - Button element
   */
  setupButtonInteractions(button) {
    button.addEventListener('click', (event) => {
      this.animationController.createRippleEffect(button, event);
      this.addButtonPressEffect(button);
    });

    // Enhanced hover effects for luxury buttons
    if (button.classList.contains('btn--luxury')) {
      button.addEventListener('mouseenter', () => this.handleLuxuryButtonHover(button, true));
      button.addEventListener('mouseleave', () => this.handleLuxuryButtonHover(button, false));
    }
  }

  /**
   * Add button press animation
   * @param {Element} button - Button element
   */
  addButtonPressEffect(button) {
    button.style.transform = 'scale(0.98)';
    setTimeout(() => {
      button.style.transform = '';
    }, CONFIG.ANIMATION.DURATION.FAST);
  }

  /**
   * Handle luxury button hover effects
   * @param {Element} button - Button element
   * @param {boolean} isHovering - Hover state
   */
  handleLuxuryButtonHover(button, isHovering) {
    if (isHovering) {
      button.style.boxShadow = 'var(--shadow-gold), 0 0 30px hsl(45, 85%, 55%, 0.4)';
    } else {
      button.style.boxShadow = 'var(--shadow-gold)';
    }
  }
}

/**
 * Scroll Controller
 */
class ScrollController {
  constructor() {
    this.init();
  }

  /**
   * Initialize scroll interactions
   */
  init() {
    this.setupScrollIndicator();
    this.setupSmoothScrolling();
  }

  /**
   * Setup scroll indicator functionality
   */
  setupScrollIndicator() {
    const scrollIndicator = document.querySelector('.hero__scroll-indicator');
    if (!scrollIndicator) return;

    const handleScrollIndicatorClick = () => {
      const productsSection = document.querySelector('.products');
      if (productsSection) {
        productsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    scrollIndicator.addEventListener('click', handleScrollIndicatorClick);
    scrollIndicator.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleScrollIndicatorClick();
      }
    });
  }

  /**
   * Setup smooth scrolling for anchor links
   */
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (event) => {
        event.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
}

/**
 * Image Error Handler
 */
class ImageErrorHandler {
  constructor() {
    this.init();
  }

  /**
   * Initialize image error handling
   */
  init() {
    const images = document.querySelectorAll('img');
    images.forEach(img => this.setupImageErrorHandling(img));
  }

  /**
   * Setup error handling for a single image
   * @param {Element} img - Image element
   */
  setupImageErrorHandling(img) {
    img.addEventListener('error', () => this.handleImageError(img), { once: true });
  }

  /**
   * Handle image loading errors
   * @param {Element} img - Failed image element
   */
  handleImageError(img) {
    const fallback = this.createFallbackElement(img);
    if (fallback && img.parentNode) {
      img.parentNode.replaceChild(fallback, img);
    }
  }

  /**
   * Create fallback element for failed images
   * @param {Element} img - Failed image element
   * @returns {Element|null} Fallback element
   */
  createFallbackElement(img) {
    const alt = img.alt.toLowerCase();
    
    if (alt.includes('truffle') || alt.includes('praline') || alt.includes('bark')) {
      return Utils.createElement('div', {
        className: 'product-card__placeholder',
        style: `
          font-size: 6rem;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          animation: float 4s ease-in-out infinite;
        `
      }, '🍫');
    } else if (alt.includes('hero') || alt.includes('chocolate') || alt.includes('artisan')) {
      return Utils.createElement('div', {
        className: 'image-fallback',
        style: `
          background: var(--gradient-chocolate);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
        `
      }, '🍫');
    }

    return null;
  }
}

/**
 * Newsletter Controller
 */
class NewsletterController {
  constructor() {
    this.form = document.querySelector('.newsletter__form');
    this.container = document.querySelector('.newsletter');
    this.init();
  }

  /**
   * Initialize newsletter functionality
   */
  init() {
    if (!this.form || !this.container) return;
    
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  /**
   * Handle form submission
   */
  handleSubmit() {
    const emailInput = this.form.querySelector('.newsletter__input');
    const email = emailInput.value.trim();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Replace newsletter content with thank you message
    this.container.innerHTML = `
      <div class="newsletter__thank-you">
        <div class="newsletter__content">
          <h4 class="newsletter__title">🎉 Thank You for Subscribing!</h4>
          <p class="newsletter__description">Welcome to the ChocoCraft family. You'll receive our premium updates soon.</p>
        </div>
      </div>
    `;
  }
}

/**
 * Navigation Controller
 */
class NavigationController {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.toggle = document.querySelector('.navbar__toggle');
    this.menu = document.querySelector('.navbar__menu');
    this.links = document.querySelectorAll('.navbar__link');
    this.init();
  }

  /**
   * Initialize navigation
   */
  init() {
    if (!this.navbar) return;
    
    this.setupMobileToggle();
    this.setupSmoothScrolling();
    this.setupScrollEffect();
  }

  /**
   * Setup mobile menu toggle
   */
  setupMobileToggle() {
    if (!this.toggle || !this.menu) return;

    this.toggle.addEventListener('click', () => {
      const isExpanded = this.toggle.getAttribute('aria-expanded') === 'true';
      
      this.toggle.setAttribute('aria-expanded', !isExpanded);
      this.menu.classList.toggle('active');
    });

    // Close menu when clicking links
    this.links.forEach(link => {
      link.addEventListener('click', () => {
        this.menu.classList.remove('active');
        this.toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /**
   * Setup smooth scrolling for navigation links
   */
  setupSmoothScrolling() {
    this.links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href === '#main-content' ? '.hero' : href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  /**
   * Setup scroll effect for navbar
   */
  setupScrollEffect() {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        this.navbar.style.background = 'rgba(25, 30, 15, 0.9)';
      } else {
        this.navbar.style.background = 'rgba(25, 30, 15, 0.1)';
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }
}

/**
 * Testimonial Carousel Controller
 */
class TestimonialCarouselController {
  constructor() {
    this.currentIndex = 0;
    this.slides = [];
    this.dots = [];
    this.autoPlayInterval = null;
    this.init();
  }

  /**
   * Initialize testimonial carousel
   */
  init() {
    const carousel = document.querySelector('#testimonialCarousel');
    if (!carousel) return;

    this.slides = carousel.querySelectorAll('.testimonial-slide');
    this.dots = document.querySelectorAll('.carousel-dots .dot');

    if (this.slides.length === 0) return;

    this.setupEventListeners();
    this.startAutoPlay();
    this.updateCarousel();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });

    // Pause auto-play on hover
    const carousel = document.querySelector('.testimonial-carousel-container');
    if (carousel) {
      carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
      carousel.addEventListener('mouseleave', () => this.startAutoPlay());
    }
  }

  /**
   * Go to specific slide
   * @param {number} index - Slide index
   */
  goToSlide(index) {
    this.currentIndex = index;
    this.updateCarousel();
  }

  /**
   * Go to next slide
   */
  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.updateCarousel();
  }

  /**
   * Update carousel display
   */
  updateCarousel() {
    this.slides.forEach((slide, index) => {
      slide.classList.remove('active', 'prev', 'next');
      
      if (index === this.currentIndex) {
        slide.classList.add('active');
      } else if (index === (this.currentIndex - 1 + this.slides.length) % this.slides.length) {
        slide.classList.add('prev');
      } else if (index === (this.currentIndex + 1) % this.slides.length) {
        slide.classList.add('next');
      }
    });

    this.dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  /**
   * Start auto-play
   */
  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 2500);
  }

  /**
   * Stop auto-play
   */
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

/**
 * Application Main Class
 */
class ChocoCraftApp {
  constructor() {
    this.controllers = new Map();
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeControllers());
    } else {
      this.initializeControllers();
    }
  }

  /**
   * Initialize all controllers
   */
  initializeControllers() {
    try {
      // Initialize controllers in order
      const animationController = new AnimationController();
      this.controllers.set('animation', animationController);

      this.controllers.set('navigation', new NavigationController());
      this.controllers.set('newsletter', new NewsletterController());
      this.controllers.set('productCard', new ProductCardController(animationController));
      this.controllers.set('button', new ButtonController(animationController));
      this.controllers.set('scroll', new ScrollController());
      this.controllers.set('imageError', new ImageErrorHandler());
      this.controllers.set('testimonialCarousel', new TestimonialCarouselController());

      this.addGlobalStyles();
      
      console.log('ChocoCraft application initialized successfully');
    } catch (error) {
      console.error('Error initializing ChocoCraft application:', error);
    }
  }

  /**
   * Add global styles for dynamic elements
   */
  addGlobalStyles() {
    const style = Utils.createElement('style', {}, `
      @keyframes ripple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      .product-card__placeholder {
        animation: float 4s ease-in-out infinite;
      }
      
      .btn:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
      }
      
      .hero__scroll-indicator:focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
        border-radius: var(--radius-sm);
      }
      
      /* Smooth transitions for interactive elements */
      .btn,
      .product-card,
      .testimonial,
      .feature__icon,
      .brand-story__icon,
      .testimonial__avatar {
        transition: all var(--transition-base);
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .fade-in-up {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `);

    document.head.appendChild(style);
  }

  /**
   * Cleanup method for destroying the application
   */
  destroy() {
    this.controllers.forEach(controller => {
      if (controller.destroy && typeof controller.destroy === 'function') {
        controller.destroy();
      }
    });
    this.controllers.clear();
  }
}

// Initialize the application
const app = new ChocoCraftApp();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChocoCraftApp, Utils, CONFIG };
}
