// src/components/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../../assets/logo1.jpg'; // Make sure this path is correct
// Import useAuth if you need to show different links based on login status
// import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // const { isLoggedIn } = useAuth(); // Example: Get auth state

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  return (
    // Apply a class that indicates the theme, e.g., 'gradientTheme'
    // This allows Navbar.module.css to potentially override variables
    <nav className={`${styles.navbar} ${styles.gradientTheme}`}>
      <Link to="/" className={styles.logoContainer}>
        <img src={logo} alt="Workopoly Logo" className={styles.logoImage} />
        <span className={styles.logoText}>Workopoly</span>
      </Link>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li className={styles.dropdown} ref={dropdownRef}>
          <button className={styles.dropbtn} onClick={toggleDropdown} aria-haspopup="true" aria-expanded={isDropdownOpen}>
            Features
          </button>
          <div
            className={`${styles.dropdownContent} ${
              isDropdownOpen ? styles.show : ''
            }`}
            role="menu"
          >
            {/* You might want to link these to sections on the homepage using #ids */}
            <Link to="/features/task-management" className={styles.dropdownItem} role="menuitem" onClick={() => setIsDropdownOpen(false)}>
              Task Management
            </Link>
            <Link to="/features/time-management" className={styles.dropdownItem} role="menuitem" onClick={() => setIsDropdownOpen(false)}>
              Time Management
            </Link>
             <Link to="/features/gamification" className={styles.dropdownItem} role="menuitem" onClick={() => setIsDropdownOpen(false)}>
              Gamification
            </Link>
          </div>
        </li>
        {/* REMOVED User Type Link */}
        {/* <li>
          <Link to="/user-type">User Type</Link>
        </li> */}

        {/* Example: Conditionally show Login/Signup vs Dashboard/Logout */}
        {/* {isLoggedIn ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><button onClick={logout} className={styles.logoutButton}>Logout</button></li>
          </>
        ) : ( */}
          <>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </>
        {/* )} */}
      </ul>
    </nav>
  );
}

export default Navbar;
