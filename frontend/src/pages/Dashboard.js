import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Leaderboard from "../components/Leaderboard";

function Dashboard() {
  const navigate = useNavigate();
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pointsData, setPointsData] = useState({
    totalPlans: 0,
    averagePoints: 0,
    totalEarned: 0,
    totalPossible: 0,
    plans: [],
  });
  const [progressData, setProgressData] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [leaderboardData, setLeaderboardData] = useState({
    userRank: null,
    stats: null,
    leaderboard: [],
  });

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate("/pages/login");
      return;
    }
    fetchDashboardData();
    fetchLeaderboardData();

    const savedProgress = localStorage.getItem("workout_progress");
    if (savedProgress) {
      setProgressData(JSON.parse(savedProgress));
    }
  }, [userInfo, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch plans data
      let plansData = [];
      try {
        const plansRes = await fetch("/api/workouts", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo?.token || ""}`,
          },
        });

        if (plansRes.ok) {
          const contentType = plansRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await plansRes.json();
            plansData = Array.isArray(data) ? data : data.data || [];
          } else {
            const textResponse = await plansRes.text();
            console.warn("Plans API returned non-JSON response:", textResponse);
            try {
              const parsedData = JSON.parse(textResponse);
              plansData = Array.isArray(parsedData)
                ? parsedData
                : parsedData.data || [];
            } catch (parseError) {
              console.warn("Could not parse response as JSON");
            }
          }
        } else {
          console.warn(`Plans API returned status: ${plansRes.status}`);
        }
      } catch (plansError) {
        console.warn("Plans API not available:", plansError.message);
      }

      // Fetch points data
      let pointsDataRes = {
        totalPlans: 0,
        averagePoints: 0,
        totalEarned: 0,
        totalPossible: 0,
        plans: [],
      };
      try {
        const pointsRes = await fetch("/api/progress/points", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo?.token || ""}`,
          },
        });

        if (pointsRes.ok) {
          const contentType = pointsRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await pointsRes.json();
            pointsDataRes = data.data || data || pointsDataRes;
          } else {
            const textResponse = await pointsRes.text();
            console.warn(
              "Points API returned non-JSON response:",
              textResponse
            );
            try {
              const parsedData = JSON.parse(textResponse);
              pointsDataRes = parsedData.data || parsedData || pointsDataRes;
            } catch (parseError) {
              console.warn("Could not parse points response as JSON");
            }
          }
        } else {
          console.warn(`Points API returned status: ${pointsRes.status}`);
        }
      } catch (pointsError) {
        console.warn("Points API not available:", pointsError.message);
      }

      setSavedPlans(plansData);
      setPointsData(pointsDataRes);
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      // Fetch leaderboard stats
      const statsRes = await fetch("/api/leaderboard/stats", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token || ""}`,
        },
      });
      const statsData = statsRes.ok ? await statsRes.json() : null;

      // Fetch user rank
      const userRankRes = await fetch(`/api/leaderboard/user/${userInfo.email}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token || ""}`,
        },
      });
      const userRankData = userRankRes.ok ? await userRankRes.json() : null;

      // Fetch leaderboard
      const leaderboardRes = await fetch("/api/leaderboard", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token || ""}`,
        },
      });
      const leaderboardDataRes = leaderboardRes.ok ? await leaderboardRes.json() : null;

      setLeaderboardData({
        userRank: userRankData?.data || null,
        stats: statsData?.data || null,
        leaderboard: leaderboardDataRes?.data || [],
      });
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      toast.error("Failed to load analytics data");
    }
  };

  const getOverallProgress = () => {
    const planIds = Object.keys(progressData);
    if (!planIds.length) return 0;

    const total = planIds.reduce((sum, id) => sum + progressData[id], 0);
    return Math.round(total / planIds.length);
  };

  const getCompletedPlansCount = () => {
    return Object.values(progressData).filter((p) => p === 100).length;
  };

  const getActivePlansCount = () => {
    return Object.values(progressData).filter((p) => p > 0 && p < 100).length;
  };

  const deletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      const response = await fetch(`/api/workouts/${planId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token || ""}`,
        },
      });

      if (response.ok) {
        setSavedPlans(savedPlans.filter((plan) => plan._id !== planId));
        const updatedProgress = { ...progressData };
        delete updatedProgress[planId];
        setProgressData(updatedProgress);
        localStorage.setItem(
          "workout_progress",
          JSON.stringify(updatedProgress)
        );
        toast.success("Plan deleted successfully");
        fetchDashboardData();
      } else {
        const errorText = await response.text();
        console.error("Delete failed:", errorText);
        toast.error("Failed to delete plan");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete plan");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Dashboard Header */}
        <header className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h1 className="text-2xl font-bold mb-4">
            Welcome back, {userInfo?.name || "User"}! 👋
          </h1>
          <p className="text-gray-600 mb-6">
            Track your fitness journey and stay motivated with your personalized
            dashboard.
          </p>

          <button
            onClick={() => navigate("/saved-plans")}
            className="btn-primary flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2 2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            View Saved Plans
          </button>
        </header>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "leaderboard"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "analytics"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "overview" && (
          <>
            {/* Points Overview */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
              <h2 className="text-xl font-semibold mb-4">🏆 Points Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="Average Points"
                  value={`${pointsData.averagePoints}%`}
                  description="Completion rate"
                  color="purple"
                  percentage={pointsData.averagePoints}
                />

                <StatCard
                  title="Total Points"
                  value={pointsData.totalEarned}
                  description="Earned points"
                  color="green"
                />

                <StatCard
                  title="Max Possible"
                  value={pointsData.totalPossible}
                  description="Total possible points"
                  color="blue"
                />

                <StatCard
                  title="Total Plans"
                  value={pointsData.totalPlans}
                  description="Workout plans"
                  color="orange"
                />
              </div>

              {/* Points by Plan */}
              {pointsData.plans.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Progress by Plan
                  </h3>
                  <div className="space-y-3">
                    {pointsData.plans.map((plan) => (
                      <PlanProgressCard
                        key={plan.planId}
                        plan={plan}
                        onViewDetails={() => navigate(`/plan/${plan.planId}`)}
                        onContinue={() => navigate(`/plan/${plan.planId}`)}
                        onDelete={() => deletePlan(plan.planId)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/pages/exercise-planner"
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors text-center"
                >
                  Create Workout Plan
                </Link>
                <Link
                  to="/pages/profile/meal-plan"
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors text-center"
                >
                  Create Meal Plan
                </Link>
              </div>
            </div>
          </>
        )}

        {activeTab === "leaderboard" && (
          <div className="bg-white rounded-lg shadow-md p-5">
            <Leaderboard />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg shadow-md p-5">
            <Analytics leaderboardData={leaderboardData} />
          </div>
        )}
      </div>
    </>
  );
}

const StatCard = ({ title, value, description, color, percentage }) => {
  const colorClasses = {
    purple: {
      bg: "from-purple-50 to-purple-100",
      border: "border-purple-200",
      text: "text-purple-800",
      bar: "bg-purple-600",
    },
    green: {
      bg: "from-green-50 to-green-100",
      border: "border-green-200",
      text: "text-green-800",
      bar: "bg-green-600",
    },
    blue: {
      bg: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      text: "text-blue-800",
      bar: "bg-blue-600",
    },
    orange: {
      bg: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      text: "text-orange-800",
      bar: "bg-orange-600",
    },
    yellow: {
      bg: "from-yellow-50 to-yellow-100",
      border: "border-yellow-200",
      text: "text-yellow-800",
      bar: "bg-yellow-600",
    },
  };

  const colors = colorClasses[color] || colorClasses.purple;

  return (
    <div
      className={`bg-gradient-to-r ${colors.bg} rounded-lg p-4 border ${colors.border}`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className={`font-medium ${colors.text}`}>{title}</h3>
        <span className={`text-2xl font-bold ${colors.text}`}>{value}</span>
      </div>

      {percentage !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div
            className={`${colors.bar} h-2.5 rounded-full`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          ></div>
        </div>
      )}

      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

const PlanProgressCard = ({ plan, onViewDetails, onContinue, onDelete }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition duration-300">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="font-medium">{plan.planName}</h4>
        {plan.earned !== undefined && plan.possible !== undefined && (
          <p className="text-sm text-gray-600">
            {plan.earned} / {plan.possible} points
          </p>
        )}
      </div>
      <div className="text-right">
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {plan.percentage}%
        </span>
        {plan.earned !== undefined && (
          <div className="text-xs text-gray-500 mt-1">{plan.earned} pts</div>
        )}
      </div>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
      <div
        className="bg-purple-600 h-2 rounded-full"
        style={{ width: `${Math.min(100, plan.percentage)}%` }}
      ></div>
    </div>

    <div className="flex justify-between mt-3">
      <div className="flex space-x-2">
        <button
          onClick={onViewDetails}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
          View Details
        </button>
        <button
          onClick={onContinue}
          className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
          Continue
        </button>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Delete
        </button>
      )}
    </div>
  </div>
);

const Analytics = ({ leaderboardData }) => {
  const { userRank, stats } = leaderboardData;

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-yellow-600 bg-yellow-100";
      case 2:
        return "text-gray-600 bg-gray-100";
      case 3:
        return "text-orange-600 bg-orange-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Analytics</h2>
      <p className="text-gray-600 mb-6">
        Track your progress and see how you compare to the community.
      </p>

      {userRank && stats ? (
        <div className="space-y-6">
          {/* User Rank and Score */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Your Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Your Rank"
                value={getRankIcon(userRank.rank)}
                description="Your position in the leaderboard"
                color="blue"
              />
              <StatCard
                title="Average Score"
                value={`${userRank.averageScore}%`}
                description="Your completion rate"
                color="purple"
                percentage={userRank.averageScore}
              />
              <StatCard
                title="Total Plans"
                value={userRank.totalPlans}
                description="Workout and meal plans"
                color="orange"
              />
            </div>
          </div>

          {/* Community Comparison */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Community Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Your Score vs Community</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, userRank.averageScore)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  Your Score: <span className="font-bold">{userRank.averageScore}%</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-gray-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, stats.averageScore)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  Community Average: <span className="font-bold">{stats.averageScore}%</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Community Stats</p>
                <p className="text-sm text-gray-600">
                  Total Users: <span className="font-bold">{stats.totalUsers}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Total Plans: <span className="font-bold">{stats.totalPlans}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Progress Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="Workout Plans"
                value={userRank.workoutPlans || 0}
                description="Completed workout plans"
                color="blue"
              />
              <StatCard
                title="Meal Plans"
                value={userRank.mealPlans || 0}
                description="Completed meal plans"
                color="green"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No analytics data yet
          </h3>
          <p className="text-gray-500">
            Complete workout or meal plans to see your analytics!
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;