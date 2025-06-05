// c:/Users/misba/OneDrive/Documents/workopoly1_proj/frontend/src/components/MyProgress/MyProgress.jsx
import React, { useState, useEffect } from 'react';
import styles from './MyProgress.module.css';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Confetti from 'react-confetti'; // Import Confetti
// Note: PointsBadge component is not imported here as we are defining the logic locally for a list.

const MyProgress = () => {
  const { token } = useAuth();
  const [progressData, setProgressData] = useState([]);
  const [completedTimeline, setCompletedTimeline] = useState([]);
  const [userProfileData, setUserProfileData] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: undefined, height: undefined });

  const chartBarColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-interactive').trim() || '#1b81a1';

  // Function to determine all earned point-based badges based on user profile
  const getEarnedPointBadges = (profile) => {
    if (!profile || typeof profile.points === 'undefined') return [];
    const earned = [];
    const points = profile.points;

    // Badges are determined by the highest one achieved.
    // For a list, we can show all that apply up to their current one,
    // or just the highest one. Let's show all applicable ones for "MyProgress".
    // If you only want the *current highest* point badge, the logic would be simpler.

    if (points >= 0) earned.push({ name: 'Newbie', emoji: '🐣', type: 'newbie' });
    if (points >= 200) earned.push({ name: 'Task Hustler', emoji: '🛠️', type: 'hustler' });
    if (points >= 500) earned.push({ name: 'Pro Achiever', emoji: '🚀', type: 'pro' });
    if (points >= 1000) earned.push({ name: 'Task Master', emoji: '🧠', type: 'master' });
    if (points >= 2000) earned.push({ name: 'Legend', emoji: '👑', type: 'legend' });
    
    // To show only the highest achieved badge:
    // if (points >= 2000) return [{ name: 'Legend', emoji: '👑', type: 'legend' }];
    // if (points >= 1000) return [{ name: 'Task Master', emoji: '🧠', type: 'master' }];
    // if (points >= 500) return [{ name: 'Pro Achiever', emoji: '🚀', type: 'pro' }];
    // if (points >= 200) return [{ name: 'Task Hustler', emoji: '🛠️', type: 'hustler' }];
    // return [{ name: 'Newbie', emoji: '🐣', type: 'newbie' }];
    
    return earned; // Returns an array of all badges up to their current points
  };


  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Not authorized. Please log in.");
        return;
      }
      setIsLoading(true);
      setError(null);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const [statsRes, recentTasksRes, profileRes] = await Promise.all([
          axios.get('/api/tasks/stats', config),
          axios.get('/api/tasks?completed=true&sortBy=updatedAt:desc', config),
          axios.get('/api/users/profile', config)
        ]);

        const stats = statsRes.data;
        if (stats.total > 0) {
          setCompletionPercentage(Math.round((stats.completed / stats.total) * 100));
        } else {
          setCompletionPercentage(0);
        }

        const allCompletedTasks = recentTasksRes.data;

        setCompletedTimeline(allCompletedTasks.slice(0, 5).map(task => ({
          id: task._id,
          title: task.title,
          completedDate: task.updatedAt ? format(new Date(task.updatedAt), 'PP') : 'N/A'
        })));

        const userProfile = profileRes.data;
        setUserProfileData(userProfile);

        const today = startOfDay(new Date());
        const sevenDaysAgo = subDays(today, 6);
        const dateInterval = { start: sevenDaysAgo, end: today };
        const lastSevenDays = eachDayOfInterval(dateInterval);

        const dailyDataMap = new Map();
        lastSevenDays.forEach(day => {
            dailyDataMap.set(format(day, 'MMM d'), { name: format(day, 'MMM d'), date: day, completed: 0 });
        });

        allCompletedTasks.forEach(task => {
            if (task.updatedAt) {
                const completedDate = new Date(task.updatedAt);
                const startOfCompletedDay = startOfDay(completedDate);
                const formattedDayKey = format(startOfCompletedDay, 'MMM d');
                if (dailyDataMap.has(formattedDayKey)) {
                    dailyDataMap.get(formattedDayKey).completed += 1;
                }
            }
        });
        setProgressData(Array.from(dailyDataMap.values()));

      } catch (err) {
        console.error("Error fetching progress data:", err.response?.data?.message || err.message);
        setError(err.response?.data?.message || "Failed to load progress data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Effect to handle window resize for confetti
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener('resize', handleResize);
    handleResize(); // Call initially to set size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to trigger confetti
  useEffect(() => {
    if (completionPercentage === 100) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false); // Reset if percentage drops (e.g., new tasks added)
    }
  }, [completionPercentage]);

  if (isLoading) {
    return <div className={styles.myProgressPage}><p>Loading progress...</p></div>;
  }
  if (error) {
    return <div className={styles.myProgressPage}><p className={styles.errorMessage}>{error}</p></div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-default-tooltip" style={{ /* Inline styles for tooltip if not covered by global CSS */ }}>
          <p className="recharts-tooltip-label">{`${label}`}</p>
          <p className="recharts-tooltip-item">{`Completed : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const earnedPointBadges = userProfileData ? getEarnedPointBadges(userProfileData) : [];

  return (
    <div className={styles.myProgressPage}>
      {showConfetti && windowSize.width && windowSize.height && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false} // Set to true if you want continuous confetti
          numberOfPieces={300} // Adjust for more/less confetti
        />
      )}
      <h1>My Progress</h1>

      <section className={`${styles.sectionCard} ${styles.progressChartSection}`}>
        <h2>Tasks Completed in Last 7 Days</h2>
        <div className={styles.chartPlaceholder}>
          {progressData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30}/>
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(27, 129, 161, 0.1)' }} />
              <Bar dataKey="completed" name="Tasks Completed" radius={[4, 4, 0, 0]}>
                {progressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartBarColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          ) : <p>No completion data available for the chart.</p>}
        </div>
      </section>

      <section className={`${styles.sectionCard} ${styles.completionTimelineSection}`}>
        <h2>Recently Completed Tasks</h2>
        {completedTimeline.length > 0 ? (
            <ul className={styles.timelineList}>
            {completedTimeline.map(task => (
                <li key={task.id}>
                    <strong>{task.title}</strong>
                    <span className={styles.timelineDate}>Completed on {task.completedDate}</span>
                </li>
            ))}
            </ul>
        ) : (
            <p>No tasks completed recently.</p>
        )}
      </section>

      <section className={`${styles.sectionCard} ${styles.motivationBadgesSection}`}>
        <h2>Achievements & Motivation</h2>
         <p className={styles.motivationalQuote}>
            You've completed {completionPercentage}% of your tasks! Keep pushing!
         </p>
         <div className={styles.completionBarContainer}>
           <div 
             className={styles.completionBarFill} 
             style={{ width: `${completionPercentage}%` }}
           >
             {completionPercentage > 0 && `${completionPercentage}%`}
           </div>
         </div>

         {userProfileData && earnedPointBadges.length > 0 && (
            <div className={styles.badgesContainer}>
                <h3>Your Point Badges:</h3>
                <div className={styles.earnedBadgesList}>
                  {earnedPointBadges.map((badge, index) => (
                      <span key={index} className={`${styles.pointsBadgeBase} ${styles[badge.type]}`}>
                          {badge.emoji} {badge.name}
                      </span>
                  ))}
                </div>
            </div>
         )}
         {userProfileData && earnedPointBadges.length === 0 && ( // Should at least show Newbie
            <p>Start earning more points to see your badges here!</p>
         )}
      </section>
    </div>
  );
};

export default MyProgress;
