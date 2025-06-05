// src/components/Footer/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';
import { Link } from 'react-router-dom';
// Import icons
import { FaTwitter, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa'; // Using FaLinkedinIn for better fit

function Footer() {

  // No need for handleSocialClick if using actual links
  // const handleSocialClick = (e) => { ... };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        {/* About Section */}
        <div className={`${styles.footerSection} ${styles.footerAboutSection}`}>
          <h4 className={styles.footerTitle}>Workopoly</h4>
          <p className={styles.footerAbout}>
            Transforming productivity into play. Manage tasks, track time, and achieve goals with engaging gamification. Join the fun!
          </p>
        </div>

        {/* Quick Links */}
        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/#features">Features</Link></li> {/* Link to section on Home */}
            <li><Link to="/#how-it-works">How It Works</Link></li> {/* Link to section on Home */}
            {/* Add Pricing link if applicable */}
            {/* <li><Link to="/pricing">Pricing</Link></li> */}
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/sign-up">Sign Up</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div className={styles.footerSection}>
          <h4 className={styles.footerTitle}>Resources</h4>
          <ul>
            <li><Link to="/blog">Blog</Link></li> {/* Example */}
            <li><Link to="/help-center">Help Center</Link></li> {/* Example */}
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Connect Section */}
        <div className={`${styles.footerSection} ${styles.footerConnectSection}`}>
          <h4 className={styles.footerTitle}>Connect With Us</h4>
          <p>Follow for updates, tips, and fun challenges:</p>
          <div className={styles.socialIcons}>
            {/* Replace # with your actual social media links */}
            <a href="#" aria-label="Visit our Twitter" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="#" aria-label="Visit our Instagram" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="#" aria-label="Visit our LinkedIn" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
             <a href="#" aria-label="Visit our GitHub" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Workopoly. Play Your Way to Productivity.</p>
      </div>
    </footer>
  );
}

export default Footer;
