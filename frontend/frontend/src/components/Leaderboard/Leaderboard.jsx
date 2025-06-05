// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/components/Leaderboard/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaLock } from 'react-icons/fa';
import { getLeaderboard } from '../../api/leaderboardApi';
import styles from './Leaderboard.module.css';
import PointsBadge from '../Badges/PointsBadge'; // Import the PointsBadge component

// TierBadge component (for subscription tiers)
const TierBadge = ({ tier }) => {
  if (!tier) return null;
  let badgeContent = null;
  let badgeClass = '';

  switch (tier.toLowerCase()) {
    case 'silver':
      badgeContent = '🥈 Silver';
      badgeClass = styles.silverBadge;
      break;
    case 'gold':
      badgeContent = '🥇 Gold';
      badgeClass = styles.goldBadge;
      break;
    case 'diamond':
      badgeContent = '💎 Diamond';
      badgeClass = styles.diamondBadge;
      break;
    default:
      return null;
  }
  return <span className={`${styles.tierBadge} ${badgeClass}`}>{badgeContent}</span>;
};

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all-time');
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching leaderboard for: ${filter}`);
      try {
        const data = await getLeaderboard(filter);
        const rankedData = data.leaderboard.map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));
        setLeaderboardData(rankedData);

        let userRankInfo = data.currentUserRank || null;
        if (!userRankInfo && user?._id) {
            userRankInfo = rankedData.find(u => u._id === user._id) || null;
        }
        if (userRankInfo && !userRankInfo.rank && user?._id) {
            const userInList = rankedData.find(u => u._id === user._id);
            if (userInList) {
                userRankInfo = { ...userRankInfo, rank: userInList.rank };
            }
        }
        setCurrentUserRank(userRankInfo);
      } catch (err) {
          console.error("Error fetching leaderboard:", err);
          setError(err.message || "Failed to load leaderboard.");
          setLeaderboardData([]);
          setCurrentUserRank(null);
      } finally {
          setIsLoading(false);
      }
    };
    fetchLeaderboardData();
  }, [filter, user]);

  const currentUserDataInList = user?._id ? leaderboardData.find(entry => entry._id === user._id) : null;

  if (isLoading && leaderboardData.length === 0) {
    return <div className={styles.leaderboardPage}><p>Loading leaderboard...</p></div>;
  }
  if (error && !isLoading) {
    return <div className={styles.leaderboardPage}><p className={styles.errorMessage}>{error}</p></div>;
  }

  return (
    <div className={styles.leaderboardPage}>
      <h1>Leaderboard</h1>
      <div className={styles.leaderboardFilters}>
        <button onClick={() => setFilter('daily')} className={filter === 'daily' ? styles.active : ''} disabled={isLoading}>Daily</button>
        <button onClick={() => setFilter('weekly')} className={filter === 'weekly' ? styles.active : ''} disabled={isLoading}>Weekly</button>
        <button onClick={() => setFilter('all-time')} className={filter === 'all-time' ? styles.active : ''} disabled={isLoading}>All Time</button>
      </div>

      {currentUserRank && !currentUserDataInList && (
          <div className={`${styles.currentUserHighlight} ${styles.outsideList}`}>
              You are currently ranked #{currentUserRank.rank || '?'} with {currentUserRank.points ?? 0} points.
          </div>
      )}

      {isLoading && leaderboardData.length > 0 && <p>Updating leaderboard...</p>}

      {!isLoading || leaderboardData.length > 0 ? (
        <table className={styles.leaderboardTable}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Points</th>
              <th>Level</th>
              <th>Tasks Completed</th>
              <th>Badge</th> {/* Changed from "Badges" to "Badge" for single display */}
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map(entry => (
              <tr
                key={entry._id || entry.username}
                className={entry._id === user?._id ? styles.currentUserHighlight : ''}
              >
                <td>{entry.rank ?? '-'}</td>
                <td className={styles.usernameCell}>
                  {entry.profileIconUrl ? (
                    <img src={entry.profileIconUrl} alt={`${entry.username}'s icon`} className={styles.profileIcon} />
                  ) : (
                    <FaUserCircle className={`${styles.profileIcon} ${styles.defaultIcon}`} />
                  )}
                  <span className={styles.usernameText}>{entry.username ?? 'Unknown User'}</span>
                  <TierBadge tier={entry.tier} /> {/* Subscription Tier Badge */}
                  {entry.recentlyUnlocked && (
                    <FaLock className={styles.unlockedIcon} title="Recently unlocked a feature!" />
                  )}
                </td>
                <td>{entry.points ?? 0}</td>
                <td className={styles.levelCell}>{entry.level ?? 1}</td>
                <td>{entry.tasksCompleted ?? 0}</td>
                <td className={styles.badgesCell}>
                  <PointsBadge points={entry.points ?? 0} /> {/* Points-Based Badge */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null }

       {!isLoading && !error && leaderboardData.length === 0 && <p>Leaderboard is empty or data could not be loaded.</p>}
    </div>
  );
};

export default Leaderboard;
