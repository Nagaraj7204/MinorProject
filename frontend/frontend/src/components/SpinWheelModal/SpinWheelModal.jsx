import React, { useState, useEffect } from 'react';
import styles from './SpinWheelModal.module.css';
import { FaTimes, FaSpinner } from 'react-icons/fa';
// Ensure this import matches the library you installed, e.g., 'react-custom-roulette-r19' if needed
import { Wheel } from 'react-custom-roulette-r19'; // Or 'react-custom-roulette' if the r19 version uses the same name
import Confetti from 'react-confetti';

// --- Wheel Data ---
// This should ideally match the labels from your backend SPIN_WHEEL_PRIZES
const wheelData = [
  { option: '+50 Points', style: { backgroundColor: '#FFD700', textColor: '#333' } },
  { option: 'Double Points!', style: { backgroundColor: '#4CAF50', textColor: 'white' } }, // Shortened for wheel
  { option: 'Mystery Box', style: { backgroundColor: '#8f00ff', textColor: 'white' } },
  { option: 'XP +15', style: { backgroundColor: '#00e0ff', textColor: '#333' } },
  { option: 'No Prize 😕', style: { backgroundColor: '#E0E0E0', textColor: '#555' } },
  { option: '+100 Points', style: { backgroundColor: '#FF9800', textColor: 'white' } },
  { option: 'Lazy Points -10', style: { backgroundColor: '#F44336', textColor: 'white' } },
  { option: '🎉 Confetti!', style: { backgroundColor: '#ff2d7a', textColor: 'white' } }, // Shortened
];

const SpinWheelModal = ({ onClose, onSpin, isLoading, error, result, canSpin }) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (result && !mustSpin) { // When result is received and wheel is not forced to spin by new click
      const prizeIndex = wheelData.findIndex(
        data => data.option.includes(result.prizeLabel) || result.prizeLabel.includes(data.option) // Flexible matching
      );
      if (prizeIndex !== -1) {
        setPrizeNumber(prizeIndex);
        if (result.prizeType === 'confetti' || (result.prizeType === 'points' && result.prizeValue > 0) || result.prizeType === 'xp' || result.prizeType === 'mystery_box' || result.prizeType === 'double_points_next_task') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds
        }
      } else {
        // Fallback if label doesn't match exactly, maybe pick a default or log warning
        console.warn("Prize label from backend didn't match wheel options exactly:", result.prizeLabel);
        // setPrizeNumber(0); // Or some default "No Prize" index
      }
    }
  }, [result, mustSpin]);

  const handleSpinClick = () => {
    if (!isLoading && !mustSpin) {
      setMustSpin(true);
      setShowConfetti(false); // Reset confetti
      onSpin(); // This will trigger the API call in Dashboard.jsx
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
          <FaTimes />
        </button>
        <h2>Spin the Wheel of Fortune!</h2>
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />}

        {/* Only show wheel and spin button if user can spin and no result yet */}
        {canSpin && !result && (
          <>
            <div className={styles.wheelContainer}>
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                outerBorderColor={"#eee"}
                outerBorderWidth={10}
                innerBorderColor={"#ddd"}
                innerBorderWidth={0}
                radiusLineColor={"#eee"}
                radiusLineWidth={2}
                fontSize={14}
                perpendicularText={true}
                onStopSpinning={() => {
                  setMustSpin(false);
                }}
              />
            </div>
            <button
              className={styles.spinButton}
              onClick={handleSpinClick}
              disabled={isLoading || mustSpin}
            >
              {isLoading ? (
                <>
                  <FaSpinner className={styles.spinnerIcon} /> Spinning...
                </>
              ) : (
                mustSpin ? 'Spinning...' : 'Spin Now!'
              )}
            </button>
          </>
        )}

        {error && <p className={styles.errorMessage}>{error}</p>}

        {result && (
          <div className={styles.resultMessage}>
            <p>🎉 Congratulations! 🎉</p>
            <p>You landed on: <strong>{result.prizeLabel}</strong></p>
            {result.prizeType === 'points' && result.prizeValue !== undefined && (
              <p>(Value: {result.prizeValue} Points)</p>
            )}
            {result.prizeType === 'xp' && result.prizeValue !== undefined && (
              <p>(Value: {result.prizeValue} XP)</p>
            )}
          </div>
        )}

        {/* Show "Already Spun" message if applicable and no current error/result */}
        {!canSpin && !error && !result && (
          <p className={styles.alreadySpunMessage}>You've already spun the wheel today. Come back tomorrow!</p>
        )}

        {result && (
           <button className={styles.collectButton} onClick={onClose}>
            Awesome!
          </button>
        )}

        {/* Show footer text only if they can spin or have just spun */}
        {(canSpin || result) && (
          <p className={styles.modalFooterText}>One spin per day. Good luck!</p>
        )}

      </div>
    </div>
  );
};

export default SpinWheelModal;
