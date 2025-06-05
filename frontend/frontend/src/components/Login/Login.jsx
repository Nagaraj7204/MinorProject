// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/components/Login/Login.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/authApi'; // Import the login API function
import styles from './Login.module.css'; // Assuming you have styles
import { FiMail, FiLock, FiLogIn, FiShield, FiInfo } from 'react-icons/fi'; // Added FiInfo

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [isAdminLogin, setIsAdminLogin] = useState(false); // Keep commented out unless specifically needed
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // For messages from redirects (e.g., signup)
  const navigate = useNavigate();
  const location = useLocation(); // Get location state
  const { login } = useAuth();

  // Check for messages passed via navigation state (e.g., after signup)
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state so it doesn't reappear on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage(''); // Clear success message on new attempt
    setIsLoading(true);

    try {
      // Call the login API function
      const data = await loginUser({ email, password });

      console.log("Login successful:", data);

      // Ensure backend returns the token and user data with a role
      if (data.token && data.user && data.user.role) { // Check for token existence
        // Call login from context with the TOKEN STRING and USER DATA to update auth state
        login(data.token, data.user); // Pass both token and user object

        // Navigate based on the actual role returned from the backend
        if (data.user.role === 'admin') {
          console.log("Admin login successful, navigating to /admin/dashboard");
          navigate('/admin/dashboard'); // Navigate admin
        } else { // Assume default role is 'user' or similar
          console.log("User login successful, navigating to /dashboard");
          navigate('/dashboard'); // Navigate regular user
        }
      } else {
        // Handle cases where backend response might be missing token, user/role
        console.error("Login response missing token, user data, or role:", data);
        throw new Error('Login failed: Invalid response from server.');
      }
    } catch (err) {
      console.error("Login error:", err);
      // Use the specific error message thrown by loginUser
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h2 className={styles.loginHeadline}>Welcome Back!</h2>

        {/* Display success message (e.g., from signup redirect) */}
        {successMessage && (
          <p className={styles.successMessage}> {/* Add styles for success messages */}
            <FiInfo size="1em" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {successMessage}
          </p>
        )}

        {/* Display error message */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Email Input */}
        <div className={styles.inputWrapper}>
          <label htmlFor="email">
            <FiMail size="0.9em" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Email
          </label>
          <input
            type="email" id="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            required placeholder="you@example.com" disabled={isLoading}
            aria-label="Email" // Accessibility improvement
          />
        </div>

        {/* Password Input */}
        <div className={styles.inputWrapper}>
          <label htmlFor="password">
            <FiLock size="0.9em" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Password
          </label>
          <input
            type="password" id="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            required placeholder="Enter your password" disabled={isLoading}
            aria-label="Password" // Accessibility improvement
          />
        </div>

        {/* Admin Login Checkbox - Keep commented out unless your backend specifically needs it */}
        {/* <div className={styles.adminCheckboxContainer}>
          <input
            type="checkbox"
            id="isAdminLogin"
            checked={isAdminLogin}
            onChange={(e) => setIsAdminLogin(e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="isAdminLogin" style={{ marginTop: 0, marginBottom: 0, fontWeight: 'normal', cursor: 'pointer' }}>
             <FiShield size="0.9em" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
             Log in as Admin
          </label>
        </div> */}

        <button type="submit" disabled={isLoading}>
          <FiLogIn size="1.1em" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          {isLoading ? 'Logging In...' : 'Login'}
        </button>

        <div className={styles.signUpLinkContainer}>
          <p>Don't have an account? <Link to="/signup" className={styles.signUpLink}>Sign up</Link></p>
        </div>
      </form>
    </div>
  );
}

export default Login;
