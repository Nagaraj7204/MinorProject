// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/components/SignUp/SignUp.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import { signupUser } from '../../api/authApi'; // Import the signup API function
import { GoogleLogin } from '@react-oauth/google'; // Import GoogleLogin
import styles from './SignUp.module.css'; // Assuming styles are correct
import { FiUser, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';

// Placeholder for your backend API call for Google Sign-In
// This function will send the Google ID token to your backend
async function signInWithGoogleOnBackend(googleIdToken) {
  // Replace with your actual backend API endpoint
  const response = await fetch('/api/auth/google-signin', { // Example endpoint
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: googleIdToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Google Sign-In failed on backend.' }));
    throw new Error(errorData.message || 'Google Sign-In failed on backend.');
  }
  return response.json(); // Expected: { token: "yourAppToken", user: { ... } }
}

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic client-side validation example (optional)
    if (password.length < 6) { // Example minimum length
        setError('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
    }

    try {
      // Call the signup API function
      // Ensure your backend expects 'name' for the username field
      const data = await signupUser({ name: username, email, password });

      console.log("Signup successful:", data);

      // Redirect to OTP verification page after successful signup
      // Pass the email needed for verification/resend API calls
      navigate('/verify-otp', { state: { email: email } });

    } catch (err) {
      console.error("Sign up error:", err);
      // Use the specific error message thrown by signupUser
      setError(err.message || 'An unexpected error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google Sign-In Success on Frontend (credentialResponse):", credentialResponse);
    const googleIdToken = credentialResponse.credential;
    setIsGoogleLoading(true);
    setError('');

    try {
      // Send the Google ID token to your backend for verification and user processing
      const backendResponse = await signInWithGoogleOnBackend(googleIdToken);
      // CRITICAL LOGGING: Let's see what the backend sent
      console.log("SignUp.jsx - Backend response from /api/auth/google-signin:", JSON.stringify(backendResponse, null, 2));


      // Assuming your backend responds with { token: "yourAppToken", user: { ... } }
      if (backendResponse.token && backendResponse.user) {
        // CRITICAL LOGGING: Let's see what's being passed to the AuthContext
        console.log("SignUp.jsx - Token being sent to AuthContext login:", backendResponse.token);
        console.log("SignUp.jsx - User data being sent to AuthContext login:", JSON.stringify(backendResponse.user, null, 2));
        login(backendResponse.token, backendResponse.user); // Use AuthContext's login
        navigate('/dashboard'); // Or your desired redirect path after login
      } else {
        // Log the problematic response if it doesn't have the expected structure
        console.error("SignUp.jsx - Invalid response structure from backend:", JSON.stringify(backendResponse, null, 2));
        throw new Error("Invalid response from backend after Google Sign-In.");
      }
    } catch (err) {
      console.error("Error during Google Sign-In with backend:", err);
      setError(err.message || "An error occurred during Google Sign-In.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign-In Failed on Frontend");
    setError("Google Sign-In failed. Please try again or use another method.");
    setIsGoogleLoading(false);
  };

  return (
    <div className={styles.signUpContainer}>
      {/* Left Graphic Side */}
      <div className={styles.graphicSide}>
        <h1>Join Workopoly!</h1>
        <p>Turn your tasks into triumphs. Sign up and start playing your way to productivity.</p>
        <div style={{ marginTop: '2rem', fontSize: '2.5rem', opacity: 0.5 }}>
            <FiCheckCircle />
        </div>
      </div>

      {/* Right Form Side */}
      <div className={styles.formSide}>
        <form onSubmit={handleSubmit} className={styles.signUpForm}>
          <h2 className={styles.signUpHeadline}>Create Your Account</h2>

          {error && <p className={styles.errorMessage}>{error}</p>}

          {/* Username Input */}
          <label htmlFor="username">
             <FiUser size="0.9em" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
             Username
          </label>
          <input
            type="text" id="username" value={username}
            onChange={(e) => setUsername(e.target.value)} required
            placeholder='Choose a username' disabled={isLoading || isGoogleLoading}
            aria-label="Username" // Accessibility improvement
          />

          {/* Email Input */}
          <label htmlFor="email">
            <FiMail size="0.9em" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Email
          </label>
          <input
            type="email" id="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            placeholder='you@example.com' disabled={isLoading || isGoogleLoading}
            aria-label="Email" // Accessibility improvement
          />

          {/* Password Input */}
          <label htmlFor="password">
            <FiLock size="0.9em" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Password
          </label>
          <input
            type="password" id="password" value={password}
            onChange={(e) => setPassword(e.target.value)} required
            placeholder='Create a strong password' disabled={isLoading || isGoogleLoading}
            aria-label="Password" // Accessibility improvement
          />

          <button type="submit" disabled={isLoading || isGoogleLoading}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>

          {/* OR Divider */}
          <div className={styles.dividerContainer}>
            <span className={styles.dividerLine}></span>
            <span className={styles.dividerText}>OR</span>
            <span className={styles.dividerLine}></span>
          </div>

          {/* Google Sign-Up Button */}
          <div className={styles.googleButtonContainer}>
            {isGoogleLoading ? <p>Signing in with Google...</p> : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                width="380px" // You might want to adjust this or control via CSS for better responsiveness
              />
            )}
          </div>


          <div className={styles.loginLinkContainer}>
            <p>Already have an account? <Link to="/login" className={styles.loginLink}>Log In</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
