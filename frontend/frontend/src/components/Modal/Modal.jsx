// src/components/Modal/Modal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Modal.module.css'; // We'll create this CSS file next
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    {title && <h2 className={styles.modalTitle}>{title}</h2>}
                    <button
                        className={styles.modalCloseButton}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <FiX />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    {children}
                </div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    title: PropTypes.string, // Optional title for the modal header
};

export default Modal;
