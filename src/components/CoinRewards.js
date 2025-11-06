import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const CoinRewards = () => {
  const [coinStats, setCoinStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const { getAuthHeaders } = useAuth();

  // Fetch coin statistics
  const fetchCoinStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rewards/coins/stats', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setCoinStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching coin stats:', error);
    }
  }, [getAuthHeaders]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rewards/notifications?limit=5', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [getAuthHeaders]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:5000/api/rewards/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Claim daily bonus
  const claimDailyBonus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rewards/daily-bonus', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        if (!data.data.alreadyClaimed) {
          // Refresh stats to show new balance
          await fetchCoinStats();
          await fetchNotifications();
        }
      }
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCoinStats(), fetchNotifications()]);
      setLoading(false);
    };

    loadData();
  }, [fetchCoinStats, fetchNotifications]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* Coin Balance Card */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <i className="fas fa-coins text-2xl"></i>
              <span className="text-lg font-medium opacity-90">Your Coins</span>
            </div>
            <div className="text-4xl font-bold">
              {coinStats?.currentBalance?.toLocaleString() || 0}
            </div>
            <div className="text-sm opacity-80 mt-1">
              Total Earned: {coinStats?.totalEarned?.toLocaleString() || 0}
            </div>
          </div>
          
          <button
            onClick={claimDailyBonus}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 
                       px-4 py-2 rounded-xl backdrop-blur-sm text-sm font-medium"
          >
            <i className="fas fa-gift mr-2"></i>
            Daily Bonus
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white border-opacity-20">
          <div className="text-center">
            <div className="text-lg font-bold">{coinStats?.todayEarned || 0}</div>
            <div className="text-xs opacity-80">Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{coinStats?.weekEarned || 0}</div>
            <div className="text-xs opacity-80">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{coinStats?.monthEarned || 0}</div>
            <div className="text-xs opacity-80">This Month</div>
          </div>
        </div>
      </div>

      {/* Notifications Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-bell text-indigo-600"></i>
            <h3 className="font-semibold text-gray-800">Rewards & Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            {showNotifications ? 'Hide' : 'Show All'}
          </button>
        </div>

        {/* Recent Notifications Preview */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              <i className="fas fa-inbox text-2xl mb-2 block"></i>
              No notifications yet. Start completing courses to earn rewards!
            </div>
          ) : (
            notifications.slice(0, showNotifications ? notifications.length : 3).map((notification, index) => (
              <div
                key={notification._id || index}
                className={`p-4 rounded-xl border-l-4 transition-all duration-200 cursor-pointer
                  ${notification.isRead 
                    ? 'bg-gray-50 border-gray-300' 
                    : 'bg-blue-50 border-blue-500 hover:bg-blue-100'
                  }`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-800">
                        {notification.title}
                      </span>
                      {notification.coins > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          +{notification.coins} coins
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(notification.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 3 && !showNotifications && (
          <button
            onClick={() => setShowNotifications(true)}
            className="w-full mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium 
                       py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
          >
            View {notifications.length - 3} more notifications
          </button>
        )}
      </div>

      {/* How to Earn Coins Info */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <h4 className="font-semibold mb-3 flex items-center">
          <i className="fas fa-lightbulb mr-2"></i>
          How to Earn Coins
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="bg-white bg-opacity-20 p-2 rounded-lg">📚</span>
            <div>
              <div className="font-medium">Course Progress</div>
              <div className="opacity-80">10-40 coins per milestone</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-white bg-opacity-20 p-2 rounded-lg">✅</span>
            <div>
              <div className="font-medium">Complete Courses</div>
              <div className="opacity-80">100 coins per completion</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-white bg-opacity-20 p-2 rounded-lg">🌅</span>
            <div>
              <div className="font-medium">Daily Login</div>
              <div className="opacity-80">5 coins per day</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-white bg-opacity-20 p-2 rounded-lg">🏆</span>
            <div>
              <div className="font-medium">Achievements</div>
              <div className="opacity-80">50 coins per unlock</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinRewards;