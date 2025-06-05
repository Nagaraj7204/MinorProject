// src/components/DailyBonusModal/DailyBonusModal.jsx
import React from 'react';
import styles from './DailyBonusModal.module.css';
import { FaGift, FaTimes } from 'react-icons/fa';

const DailyBonusModal = ({ onClaim, onClose }) => {
    // You could add more complex logic here later, like a spin wheel animation
    const bonusAmount = 10; // Example fixed bonus amount

    const handleClaimClick = () => {
        onClaim(bonusAmount); // Pass the bonus amount back to the parent
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.closeButton} aria-label="Close">
                    <FaTimes />
                </button>
                <div className={styles.modalHeader}>
                    <FaGift className={styles.giftIcon} />
                    <h2>Daily Bonus!</h2>
                </div>
                <div className={styles.modalBody}>
                    <p>Welcome back! Claim your daily bonus points.</p>
                    <p className={styles.bonusAmount}>+{bonusAmount} Points ✨</p>
                </div>
                <div className={styles.modalFooter}>
                    <button onClick={handleClaimClick} className={styles.claimButton}>
                        Claim Bonus
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyBonusModal;