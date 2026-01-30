import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/frontend_assets/assets';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const featuresSectionRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2 // Trigger when 20% of the section is visible
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add 'animate' class to all feature cards
          const cards = entry.target.querySelectorAll('.feature-card');
          cards.forEach(card => {
            card.classList.add('animate');
          });
          // Unobserve after animation is triggered (run once)
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (featuresSectionRef.current) {
      observer.observe(featuresSectionRef.current);
    }

    return () => {
      if (featuresSectionRef.current) {
        observer.unobserve(featuresSectionRef.current);
      }
    };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="fresh-pill">
            <span className="sparkle">✨</span> Your Everyday Hangout Spot
          </div>
          <h1>Welcome to <br /><span className="text-highlight">A1 Cafe</span></h1>
          <p className="hero-subtitle">From chill coffee breaks to quick snacks and cool shakes, A1 Cafe is your go-to spot to relax and enjoy.</p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/menu')}>Explore Menu ➜</button>
            <button className="btn-secondary" onClick={() => navigate('/menu')}>Order Online</button>
          </div>
        </div>
        <div className="hero-decoration"></div>
      </section>

      {/* Features Section - "Why Choose A1 Cafe?" */}
      <section className="features-section" ref={featuresSectionRef}>
        <div className="section-title-wrapper">
          <span className="section-tag">Experience</span>
          <h2 className="section-header">Why Choose A1 Cafe?</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌿</div>
            <h3>Clean & Fresh Choices</h3>
            <p>We use fresh, quality ingredients to make food that tastes good and feels good.</p>
          </div>
          <div className="feature-card featured">
            <div className="feature-icon">☕</div>
            <h3>Perfectly Brewed Coffee</h3>
            <p>From strong coffee to creamy cold brews, every cup is made just the way you like it.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🍰</div>
            <h3>Wide Variety Menu</h3>
            <p>From quick bites to refreshing drinks, there’s something for every mood.</p>
          </div>
        </div>
      </section>

      {/* Ready to Order Section */}
      <section className="ready-order-section">
        <div className="ready-order-glass">
          <div className="ready-order-content">
            <h2>Craving Something Delicious?</h2>
            <p>Simple ordering, fast service, and food you’ll love every time.</p>
            <button className="btn-gold" onClick={() => navigate('/menu')}>Order Online Now</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
