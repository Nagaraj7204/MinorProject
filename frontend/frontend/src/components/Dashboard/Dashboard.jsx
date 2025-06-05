// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth to get user tier
import styles from './Dashboard.module.css';
import { FaPen, FaLock, FaMedal, FaUserCircle, FaStar } from 'react-icons/fa'; // Import icons

// Import the modal
import DailyBonusModal from '../DailyBonusModal/DailyBonusModal';
// Import API functions
import { spinUserWheel } from '../../api/userApi'; // Import the spin wheel API
import SpinWheelButton from '../SpinWheelButton/SpinWheelButton'; // Import the FAB
import SpinWheelModal from '../SpinWheelModal/SpinWheelModal'; // Import the Spin Wheel Modal
import { getUserProfile, getTaskStats, getDueTasks, claimBonus } from '../../api/dashboardApi'; // Removed getLastBonusClaim as profileData contains it

// Tier data (can be imported from a shared constants file if used elsewhere)
// Make sure these point values match your SubscriptionTiersPage.jsx and backend config
const TIERS_DATA = [
  { id: 'free', name: 'Free Plan', pointsRequired: 0 },
  { id: 'silver', name: 'Silver Tier', pointsRequired: 500 }, // Ensuring this is 500
  { id: 'gold', name: 'Gold Tier', pointsRequired: 50 }, // For testing, ensure this matches frontend and backend
  { id: 'diamond', name: 'Diamond Tier', pointsRequired: 5000 },
];

const getNextTierInfo = (currentTierId) => {
  if (currentTierId === 'free') return TIERS_DATA.find(t => t.id === 'silver');
  if (currentTierId === 'silver') return TIERS_DATA.find(t => t.id === 'gold');
  if (currentTierId === 'gold') return TIERS_DATA.find(t => t.id === 'diamond');
  return null; // No next tier if diamond or unknown
};

// --- Main Dashboard Component ---
const Dashboard = () => {
  // --- Configuration ---
  const nameUnlockCost = 100; // Points needed to customize name/profile
  const DAILY_BONUS_AMOUNT = 10; // Define the bonus amount consistently

  // --- State for data (defined within the main component) ---
  const [userName, setUserName] = useState('User'); // Default to 'User'
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [dueTasks, setDueTasks] = useState([]);
  const [quote, setQuote] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showUnlockTooltip, setShowUnlockTooltip] = useState(false);
  // State for Level/XP
  const [userLevel, setUserLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [xpForNextLevel, setXpForNextLevel] = useState(100);
  // State for Daily Bonus
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [lastBonusClaimTime, setLastBonusClaimTime] = useState(null);
  // Loading and Error States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bonusClaimMessage, setBonusClaimMessage] = useState('');
  const [canSpinToday, setCanSpinToday] = useState(false); // New state for spin eligibility
  // State for Spin Wheel
  const [showSpinWheelModal, setShowSpinWheelModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinError, setSpinError] = useState('');
  const [spinResult, setSpinResult] = useState(null);

  const { user: authUser, token, isLoadingAuth, login: updateUserAuthContext } = useAuth(); // Get user and login function from AuthContext
  const navigate = useNavigate();

  // --- Fetch data and set up timer ---
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isLoadingAuth) { // Wait for auth check from AuthContext
        console.log("Dashboard: Auth check in progress...");
        return;
      }

      if (!authUser || !token) {
        if (isMounted) {
          console.log("Dashboard: No authenticated user or token found. Redirecting might be handled by ProtectedRoute.");
          // setError("Not authenticated. Please log in."); // Error display can be optional if redirect is immediate
          // setIsLoading(false); // Stop loading if not authenticated
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }
      try {
        console.log("Dashboard: Fetching dashboard data...");
        const [profileData, statsData, tasksData] = await Promise.all([
            getUserProfile(),
            getTaskStats(),
            getDueTasks({ status: 'due' }),
        ]);

        if (isMounted) {
            setUserName(profileData?.name || authUser?.name || 'User');
            setUserPoints(profileData?.points ?? authUser?.points ?? 0);
            setUserLevel(profileData?.level ?? authUser?.level ?? 1);
            setCurrentXP(profileData?.currentXP ?? authUser?.currentXP ?? 0);
            setXpForNextLevel(profileData?.xpForNextLevel ?? authUser?.xpForNextLevel ?? 100);
            setTaskStats(statsData || { total: 0, completed: 0, pending: 0, overdue: 0 });
            setDueTasks(tasksData || []);

            const backendLastClaimTimestamp = profileData?.lastBonusClaim ? new Date(profileData.lastBonusClaim).getTime() : null;
            console.log("Dashboard Bonus Check: backendLastClaimTimestamp:", backendLastClaimTimestamp);
            setLastBonusClaimTime(backendLastClaimTimestamp);

            // Check spin eligibility
            const userLastSpinDate = profileData?.lastSpinDate ? new Date(profileData.lastSpinDate) : null;
            const todayForSpinCheck = new Date();
            const startOfTodayForSpin = new Date(todayForSpinCheck.getFullYear(), todayForSpinCheck.getMonth(), todayForSpinCheck.getDate());
            
            if (userLastSpinDate && userLastSpinDate >= startOfTodayForSpin) {
              setCanSpinToday(false);
            } else {
              setCanSpinToday(true);
            }

            const today = new Date();
            const todayDateString = today.toDateString();
            let lastClaimDateString = null;
            if (backendLastClaimTimestamp) {
                try {
                    lastClaimDateString = new Date(backendLastClaimTimestamp).toDateString();
                } catch (e) { console.error("Dashboard Bonus Check: Error creating Date from backend timestamp:", e); }
            }
            const shouldShowBonus = !lastClaimDateString || lastClaimDateString !== todayDateString;
            console.log("Dashboard Bonus Check: Condition to show modal (from backend):", shouldShowBonus);
            setShowDailyBonus(shouldShowBonus);

            const quotes = [
                "The secret of getting ahead is getting started.",
                "Don't watch the clock; do what it does. Keep going.",
                "The best way to predict the future is to create it.",
                "Success is the sum of small efforts, repeated day in and day out.",
                "Believe you can and you're halfway there."
              ];
            setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        }

      } catch (err) {
        if (isMounted) {
            console.error("Dashboard: Failed to fetch dashboard data:", err);
            setError(err.message || "Failed to load dashboard data.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    const timerId = setInterval(() => {
        if (isMounted) setCurrentDateTime(new Date());
    }, 1000);

    return () => {
        isMounted = false;
        clearInterval(timerId);
    };
  }, [authUser, token, isLoadingAuth, navigate]); // Added navigate to dependencies

  // --- Derived State ---
  const canCustomizeName = userPoints >= nameUnlockCost;

  // --- Handlers ---
  const handleClaimBonus = (amount) => {
    console.log(`Dashboard: Claiming ${amount} points...`);
    setBonusClaimMessage('');

    claimBonus(amount)
      .then(response => {
        console.log("Dashboard: Bonus claim successful:", response);
        setUserPoints(response.newTotalPoints);
        const newClaimTime = response.lastClaimTimestamp ? new Date(response.lastClaimTimestamp).getTime() : Date.now();
        setLastBonusClaimTime(newClaimTime);
        setShowDailyBonus(false);
        const successMsg = `+${DAILY_BONUS_AMOUNT} points claimed! New total: ${response.newTotalPoints}`;
        setBonusClaimMessage(successMsg);
        setTimeout(() => setBonusClaimMessage(''), 3000);
      })
      .catch(err => {
        console.error("Dashboard: Failed to claim bonus:", err);
        const errorMsg = `Failed to claim bonus: ${err.message}`;
        setBonusClaimMessage(errorMsg);
        setTimeout(() => setBonusClaimMessage(''), 3000);
      });
  };

  const handleOpenSpinWheel = () => {
    setSpinResult(null); // Reset previous result
    setSpinError('');    // Reset previous error
    setShowSpinWheelModal(true);
  };

  const handleCloseSpinWheel = () => {
    setShowSpinWheelModal(false);
  };

  const handleSpinTheWheel = async () => {
    setIsSpinning(true);
    setSpinError('');
    setSpinResult(null);
    try {
      const response = await spinUserWheel();
      setSpinResult({ prizeLabel: response.prizeLabel, prizeType: response.prizeType, prizeValue: response.prizeValue });
      // Update user context with new points, XP, etc.
      // The backend returns the updated user object in response.user
      if (response.user) {
        updateUserAuthContext(token, response.user); // Update AuthContext
        setUserPoints(response.user.points); // Also update local state for immediate reflection
        setCurrentXP(response.user.currentXP);
        // Potentially update other user-specific states if needed
      }
    } catch (err) {
      // If the error message indicates already spun, update canSpinToday
      if (err.message && err.message.toLowerCase().includes('already spun')) {
        setCanSpinToday(false);
      }
      setSpinError(err.message || 'Failed to spin. Please try again.');
    } finally {
      setIsSpinning(false);
    }
  };
  // --- Helper Components Defined INSIDE Dashboard ---
  const MotivationalQuote = () => (
    <div className={styles.motivationalQuote}><p>"{quote}"</p></div>
  );

  const LevelProgressBar = () => {
    const progressPercent = xpForNextLevel > 0 ? Math.min((currentXP / xpForNextLevel) * 100, 100) : 0;
    return (
        <div className={styles.levelProgressContainer}>
            <div className={styles.levelInfo}>
                <span className={styles.levelLabel}>Level {userLevel}</span>
                <span className={styles.xpLabel}>{currentXP} / {xpForNextLevel} XP</span>
            </div>
            <div className={styles.progressBarBackground}>
                <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }}></div>
            </div>
        </div>
    );
  };

  const DateTimeDisplay = () => {
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    return (
      <div className={styles.dateTimeDisplay}>
        <p className={styles.date}>{currentDateTime.toLocaleDateString(undefined, optionsDate)}</p>
        <p className={styles.time}>{currentDateTime.toLocaleTimeString(undefined, optionsTime)}</p>
      </div>
    );
  };

  const QuickStats = () => (
    <div className={styles.quickStats}>
      <h3>Quick Stats</h3>
      <div className={styles.statsContainer}>
        <div className={`${styles.statItem} ${styles.total}`}>
          <span className={styles.statCount}>{taskStats?.total ?? 0}</span>
          <span className={styles.statLabel}>Total Tasks</span>
        </div>
        <div className={`${styles.statItem} ${styles.completed}`}>
          <span className={styles.statCount}>{taskStats?.completed ?? 0}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
        <div className={`${styles.statItem} ${styles.pending}`}>
          <span className={styles.statCount}>{taskStats?.pending ?? 0}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={`${styles.statItem} ${styles.overdue}`}>
          <span className={styles.statCount}>{taskStats?.overdue ?? 0}</span>
          <span className={styles.statLabel}>Overdue</span>
        </div>
      </div>
    </div>
  );

  const DueTasksList = () => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const taskDate = new Date(date); taskDate.setHours(0, 0, 0, 0);
            const diffTime = taskDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 0) return 'Yesterday';
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Tomorrow';
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch (e) { return 'Invalid Date'; }
    };
    return (
      <div className={styles.dueTasksList}>
        <h3>Due Soon / Overdue</h3>
        {dueTasks && dueTasks.length > 0 ? (
          <ul>
            {dueTasks.map(task => (
              <li key={task._id || task.id}>
                {task.title} -
                <span className={`${styles.dueDate} ${task.isOverdue ? styles.overdue : ''}`}>
                  Due: {formatDate(task.dueDate)}
                </span>
              </li>
            ))}
          </ul>
        ) : ( <p>No tasks due soon!</p> )}
      </div>
    );
  };

  // --- Upgrade Banner Component ---
  const UpgradeBanner = () => {
    if (isLoadingAuth || !authUser || authUser.tier !== 'free') { // Check isLoadingAuth as well
      return null;
    }
    const nextTier = getNextTierInfo(authUser.tier);
    if (!nextTier) return null;

    // Use the pointsRequired from TIERS_DATA for the banner message
    const pointsForNextTier = nextTier.pointsRequired;

    return (
      <div className={styles.upgradeBanner}>
        <p>
          You're on the <strong>{TIERS_DATA.find(t=>t.id === authUser.tier)?.name || 'Free'} Plan</strong>.
          Upgrade to <strong>{nextTier.name}</strong> for {pointsForNextTier} points and unlock cool perks! 🎉
          <Link to="/subscription-tiers" className={styles.upgradeLink}>Upgrade Now</Link>
        </p>
      </div>
    );
  };

  // Determine if user is Gold tier or higher
  const isEligibleForSpinFeature = authUser && (authUser.tier === 'gold' || authUser.tier === 'diamond');
  // For testing, you can temporarily set this to true:
  // const isGoldTierOrHigher = true;


  // --- Loading and Error Handling ---
  // Show loading if either initial auth check is happening OR dashboard data is fetching
  if (isLoadingAuth || isLoading) {
    return <div className={styles.loading}>Loading Dashboard...</div>;
  }
  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }
  // If not loading and no authUser after auth check, it implies redirection or an issue handled by ProtectedRoute
  if (!authUser && !isLoadingAuth) {
      return <div className={styles.error}>Not authenticated. Please log in.</div>; // Fallback message
  }


  // --- Render the Main Dashboard ---
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.avatarAndGreeting}>
            <div className={styles.dashboardAvatarContainer}>
              {authUser?.profilePictureUrl ? (
                <img src={authUser.profilePictureUrl} alt="Profile" className={styles.dashboardAvatar} />
              ) : (authUser?.tier === 'gold' || authUser?.tier === 'diamond') && userName ? (
                <div className={`${styles.initialAvatar} ${styles.goldTierInitialAvatar}`} title={`${authUser.tier.charAt(0).toUpperCase() + authUser.tier.slice(1)} Tier Member`}>
                  {userName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <FaUserCircle className={`${styles.dashboardAvatarIcon} ${styles.defaultAvatarIcon}`} />
              )}
            </div>
            <div className={styles.greetingTextContainer}>
              <h1>
                Hello, {userName}!
                {authUser?.tier === 'silver' && (
                  <FaMedal className={`${styles.tierBadge} ${styles.silverBadge}`} title="Silver Tier" />
                )}
                {(authUser?.tier === 'gold' || authUser?.tier === 'diamond') && (
                  <FaMedal className={`${styles.tierBadge} ${styles.goldBadge}`} title={authUser.tier === 'diamond' ? "Diamond Tier" : "Gold Tier"} />
                )}
              </h1>
              <span className={styles.dashboardPoints}>Points: {userPoints} ✨</span>
            </div>
          </div>
          <div className={styles.greetingContainer}> {/* This container now mainly holds the edit icon and quote */}
            <span className={styles.editIconContainer} style={{ marginLeft: 'auto' }}>
              {canCustomizeName ? (
                <Link to="/user/profile" title="Edit Profile" className={styles.editIconLink}>
                  <FaPen />
                </Link>
              ) : (
                <span
                  onMouseEnter={() => setShowUnlockTooltip(true)}
                  onMouseLeave={() => setShowUnlockTooltip(false)}
                  className={styles.lockedIcon}
                  title={`Earn ${nameUnlockCost - userPoints} more points to customize`}
                >
                  <FaPen />
                  {showUnlockTooltip && <div className={styles.unlockTooltip}>Customize after earning {nameUnlockCost} points!</div>}
                </span>
              )}
            </span>
          </div>
          <MotivationalQuote />
        </div>
        <div className={styles.headerRight}>
          <DateTimeDisplay />
        </div>
      </header>

      <UpgradeBanner />

      {bonusClaimMessage && (
        <div className={`${styles.bonusFeedback} ${bonusClaimMessage.startsWith('Failed') ? styles.error : ''}`}>
            {bonusClaimMessage}
        </div>
      )}

      <LevelProgressBar />

      <section className={styles.dashboardMain}>
        <QuickStats />
        <DueTasksList />
      </section>

      {showDailyBonus && (
        <DailyBonusModal onClose={() => setShowDailyBonus(false)} onClaim={handleClaimBonus} />
      )}

      {isEligibleForSpinFeature && (
        <SpinWheelButton onClick={handleOpenSpinWheel} disabled={!canSpinToday} />
      )}

      {showSpinWheelModal && (
        <SpinWheelModal
          onClose={handleCloseSpinWheel}
          onSpin={handleSpinTheWheel}
          isLoading={isSpinning}
          error={spinError}
          result={spinResult}
          canSpin={canSpinToday} // Pass spin eligibility to modal
        />
      )}
    </div>
  );
};

export default Dashboard;
