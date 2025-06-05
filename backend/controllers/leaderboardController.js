// c:/Users/misba/OneDrive/Documents/workopoly1_proj/backend/controllers/leaderboardController.js
import User from '../models/User.js'; // Use ES6 import

export const getLeaderboardData = async (req, res) => { // Use export keyword
    const { filter = 'all-time' } = req.query; // Get filter from query params, default to 'all-time'
    const currentUserId = req.user?._id; // Get user ID from auth middleware (if used)
    const limit = 20; // Limit the number of users returned in the main list (e.g., top 20)

    try {
        let sortCriteria;
        let pointsField; // The field to sort and display points by

        // Determine the points field and sort criteria based on the filter
        switch (filter) {
            case 'daily':
                pointsField = 'dailyPoints';
                sortCriteria = { dailyPoints: -1 };
                break;
            case 'weekly':
                pointsField = 'weeklyPoints';
                sortCriteria = { weeklyPoints: -1 };
                break;
            case 'all-time':
            default:
                pointsField = 'points'; // All-time uses the main 'points' field
                sortCriteria = { points: -1 };
                break;
        }

        // --- Fetch Top Users ---
        // Select necessary fields including the relevant points field
        // Ensure your User model actually has 'name', 'level', 'tasksCompleted', 'badges', 'profileIconUrl', 'recentlyUnlocked'
        const topUsersQuery = User.find({ [pointsField]: { $gt: 0 } }) // Only users with points > 0 for the period
                                  .sort(sortCriteria)
                                  .limit(limit)
                                  // Select all fields needed by frontend + all potential points fields
                                  .select(`name level tasksCompleted badges profileIconUrl recentlyUnlocked points dailyPoints weeklyPoints`);

        let topUsers = await topUsersQuery.exec();

        // --- Add Rank and Format Output ---
        const leaderboard = topUsers.map((user, index) => ({
            _id: user._id,
            username: user.name, // Use 'name' field from your User model
            level: user.level,
            tasksCompleted: user.tasksCompleted, // Note: This is likely all-time tasks completed unless you track daily/weekly separately
            badges: user.badges,
            profileIconUrl: user.profileIconUrl,
            recentlyUnlocked: user.recentlyUnlocked,
            points: user[pointsField], // Display points specific to the filter
            rank: index + 1,
        }));

        // --- Find Current User's Rank (if authenticated) ---
        let currentUserRankData = null;
        if (currentUserId) {
            // Check if current user is already in the top list
            const userInTopList = leaderboard.find(u => u._id.toString() === currentUserId.toString());

            if (userInTopList) {
                currentUserRankData = userInTopList; // Already have the data
            } else {
                // If not in top list, query their specific rank and points for the current filter
                const user = await User.findById(currentUserId).select(`name level points dailyPoints weeklyPoints`); // Select relevant fields

                if (user) {
                    const userScore = user[pointsField] || 0;
                    let userRank = 0;

                    if (userScore > 0) {
                         // Count users with a higher score in the specific period
                         userRank = await User.countDocuments({ [pointsField]: { $gt: userScore } }) + 1;
                    } else {
                        // If user has 0 points for the period, their rank is effectively after everyone else
                        // Rank is 1 + number of people who *do* have points in that period
                        userRank = await User.countDocuments({ [pointsField]: { $gt: 0 } }) + 1;
                    }


                    currentUserRankData = {
                        _id: user._id,
                        username: user.name, // Use 'name' field
                        level: user.level, // Display current level
                        points: userScore, // Display score for the specific filter
                        rank: userRank,
                        // Include other fields if needed by the frontend's 'outsideList' display
                    };
                }
            }
        }

        // --- Send Response ---
        res.json({
            leaderboard: leaderboard,
            currentUserRank: currentUserRankData // Send null if user not found or not logged in
        });

    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        res.status(500).json({ message: 'Failed to fetch leaderboard data.' });
    }
};
