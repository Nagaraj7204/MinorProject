import React from 'react';
import styles from './SpinWheelButton.module.css';
import { FaGift } from 'react-icons/fa'; // Or any other icon you like, e.g., FaRedo for spin, FaStar

const SpinWheelButton = ({ onClick, disabled }) => {
  return (
    <button
      className={`${styles.spinWheelFab} ${disabled ? styles.disabled : ''}`}
      onClick={onClick}
      title={disabled ? "You've already spun today!" : "Spin the Wheel!"}
      disabled={disabled}
    >
      <FaGift size={24} />
      {/* Or use a different icon, or text like "Spin!" */}
    </button>
  );
};

export default SpinWheelButton;
