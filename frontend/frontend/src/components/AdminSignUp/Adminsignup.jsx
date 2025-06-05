// src/components/AdminSignup/AdminSignup.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import styles from './AdminSignup.module.css'; // Create this CSS file

function AdminSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // ... (More validation if needed)

    try {
      // Send signup request to backend (replace with your actual API endpoint)
      const response = await fetch('/api/admin/signup', { // Replace with your actual API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        // Signup successful - redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        const data = await response.json();
        setError(data.message || 'Signup failed.');
      }
    } catch (err) {
      setError('An error occurred during signup.');
    }
  };

  return (
    <div className={styles.adminSignupContainer}>
      <div className={styles.formContainer}>
        <h2>Admin Signup</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className={styles.signupButton}>Signup</button>
        </form>
        <p className={styles.loginLink}>
          Already have an account? <Link to="/admin/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminSignup;
