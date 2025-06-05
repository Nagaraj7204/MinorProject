import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext'; // To log user in after verification
import styles from './OtpVerification.module.css'; // Create this CSS module
import { FiKey, FiSend, FiRefreshCw } from 'react-icons/fi';

function OtpVerification() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // For success/info messages
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Get login function from context

  // --- Get email from navigation state ---
  const email = location.state?.email;

  useEffect(() => {
    // Redirect if email is not available in state (user landed here directly)
    if (!email) {
      console.warn("No email found in location state for OTP verification.");
      navigate('/login', { state: { message: 'Please log in or sign up first.' } });
    } else {
        setMessage(`An OTP has been sent to ${email}. Please check your inbox.`);
    }
  }, [email, navigate]);
  // --- End email check ---

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!otp || otp.length !== 6) { // Basic validation (adjust length if needed)
      setError('Please enter a valid 6-digit OTP.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await verifyOtp({ email, otp });
      console.log("OTP Verification successful:", data);

      // Assuming successful verification returns user data and logs them in (backend dependent)
      // The verifyOtp function already stores the token if returned
      if (data.user) {
          login(data.user); // Update auth context
          navigate('/dashboard'); // Navigate to dashboard
      } else {
          // Handle cases where verification is successful but doesn't auto-login
          setMessage('Verification successful! You can now log in.');
          navigate('/login');
      }

    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setIsResending(true);
    try {
        await resendOtp({ email });
        setMessage('A new OTP has been sent. Please check your email.');
    } catch (err) {
        setError(err.message || 'Failed to resend OTP.');
    } finally {
        setIsResending(false);
    }
  };

  return (
    <div className={styles.otpContainer}>
      <form onSubmit={handleVerifySubmit} className={styles.otpForm}>
        <h2>Verify Your Account</h2>
        <p className={styles.infoText}>Enter the 6-digit code sent to your email.</p>

        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.inputWrapper}>
          <label htmlFor="otp">
            <FiKey size="0.9em" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            OTP Code
          </label>
          <input
            type="text" id="otp" value={otp} maxLength="6" // Limit input length
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Allow only numbers
            required placeholder="Enter OTP" disabled={isLoading || isResending}
          />
        </div>

        <button type="submit" disabled={isLoading || isResending}>
          <FiSend size="1.1em" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <button type="button" onClick={handleResendOtp} disabled={isLoading || isResending} className={styles.resendButton}>
            <FiRefreshCw size="1em" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {isResending ? 'Resending...' : 'Resend OTP'}
        </button>
      </form>
    </div>
  );
}

export default OtpVerification;