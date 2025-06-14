import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Nav, Card, Form, Button, Alert, Modal } from "react-bootstrap";
import { setCredentials, logout } from "../slices/authSlice";
import Header from "../components/Header";

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("profile");
  const [goalData, setGoalData] = useState({
    weightGoal: "",
    targetWeight: "",
    timeframe: "",
    activityLevel: "",
    dietType: "",
    currentWeight: ""
  });
  const [profileData, setProfileData] = useState({
    name: userInfo?.name || "",
    email: userInfo?.email || "",
    dateOfBirth: userInfo?.dateOfBirth || "",
    phone: userInfo?.phone || "",
    gender: userInfo?.gender || ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasExistingGoals, setHasExistingGoals] = useState(false);
  const [loading, setLoading] = useState(false);

  // Settings state
  const [settingsData, setSettingsData] = useState({
    privacy: {
      makeProfilePublic: false,
      allowGoalSharing: false,
      enableProgressNotifications: true
    },
    notifications: {
      dailyReminders: true,
      weeklyProgressReports: true,
      goalAchievementAlerts: true
    }
  });

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetGoalsModal, setShowResetGoalsModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    dispatch(setCredentials(userInfo));
    fetchUserGoals();
    fetchUserSettings();
    setProfileData({
      name: userInfo?.name || "",
      email: userInfo?.email || "",
      dateOfBirth: userInfo?.dateOfBirth || "",
      phone: userInfo?.phone || "",
      gender: userInfo?.gender || ""
    });
  }, [userInfo, dispatch]);

  const fetchUserGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.goals && Object.keys(data.goals).length > 0) {
          setGoalData({
            weightGoal: data.goals.weightGoal || "",
            targetWeight: data.goals.targetWeight || "",
            timeframe: data.goals.timeframe || "",
            activityLevel: data.goals.activityLevel || "",
            dietType: data.goals.dietType || "",
            currentWeight: data.goals.currentWeight || ""
          });
          setHasExistingGoals(data.profileCompleted);
        } else {
          setHasExistingGoals(false);
        }

        setProfileData({
          name: data.name || "",
          email: data.email || "",
          dateOfBirth: data.dateOfBirth || "",
          phone: data.phone || "",
          gender: data.gender || ""
        });
      }
    } catch (err) {
      console.log("Error fetching user profile:", err);
      setHasExistingGoals(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/users/settings', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettingsData(data.settings);
        }
      }
    } catch (err) {
      console.log("Error fetching user settings:", err);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(goalData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(hasExistingGoals ? "Goals updated successfully" : "Goals saved successfully");
        setHasExistingGoals(true);
        dispatch(setCredentials(data));
        setTimeout(() => {
          fetchUserGoals();
        }, 1000);
      } else {
        setError(data.message || "Failed to save goals");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Profile updated successfully");
        dispatch(setCredentials(data));
        setTimeout(() => {
          fetchUserGoals();
        }, 1000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = async (section, setting, value) => {
    const newSettings = {
      ...settingsData,
      [section]: {
        ...settingsData[section],
        [setting]: value
      }
    };

    setSettingsData(newSettings);

    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ settings: newSettings })
      });

      if (response.ok) {
        setMessage("Settings updated successfully");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setError("Failed to update settings");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password changed successfully");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordModal(false);
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleResetGoals = async () => {
    try {
      const response = await fetch('/api/users/reset-goals', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });

      if (response.ok) {
        setGoalData({
          weightGoal: "",
          targetWeight: "",
          timeframe: "",
          activityLevel: "",
          dietType: "",
          currentWeight: ""
        });
        setHasExistingGoals(false);
        setMessage("Goals reset successfully");
        setShowResetGoalsModal(false);
      } else {
        setError("Failed to reset goals");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/users/export-data', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${userInfo.name}-profile-data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setMessage("Data exported successfully");
        setShowExportModal(false);
      } else {
        setError("Failed to export data");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/users/delete-account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });

      if (response.ok) {
        dispatch(logout());
        window.location.href = '/';
      } else {
        setError("Failed to delete account");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const ProfileDetails = () => (
    <Card>
      <Card.Header>
        <h4>Profile Information</h4>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <div className="mb-3">
              <strong>Name:</strong>
              <p className="mt-1">{userInfo?.name || 'Not provided'}</p>
            </div>
            <div className="mb-3">
              <strong>Email:</strong>
              <p className="mt-1">{userInfo?.email || 'Not provided'}</p>
            </div>
            <div className="mb-3">
              <strong>Date of Birth:</strong>
              <p className="mt-1">{userInfo?.dateOfBirth ? new Date(userInfo.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
            </div>
            <div className="mb-3">
              <strong>Phone:</strong>
              <p className="mt-1">{userInfo?.phone || 'Not provided'}</p>
            </div>
            <div className="mb-3">
              <strong>Gender:</strong>
              <p className="mt-1">{userInfo?.gender ? userInfo.gender.charAt(0).toUpperCase() + userInfo.gender.slice(1) : 'Not provided'}</p>
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <strong>Account Status:</strong>
              <p className="mt-1">
                <span className="badge bg-success">Active</span>
              </p>
            </div>
            <div className="mb-3">
              <strong>Profile Completion:</strong>
              <p className="mt-1">
                <span className={`badge ${hasExistingGoals ? 'bg-success' : 'bg-warning'}`}>
                  {hasExistingGoals ? 'Complete' : 'Incomplete - Set your goals'}
                </span>
              </p>
            </div>
            <div className="mb-3">
              <strong>Member Since:</strong>
              <p className="mt-1">{userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            {hasExistingGoals && (
              <div className="mb-3">
                <strong>Current Goal:</strong>
                <p className="mt-1">
                  <span className="badge bg-primary">
                    {goalData.weightGoal?.charAt(0).toUpperCase() + goalData.weightGoal?.slice(1)} Weight
                  </span>
                </p>
              </div>
            )}
          </Col>
        </Row>

        {hasExistingGoals && (
          <div className="mt-4">
            <hr />
            <h5>Your Current Goals</h5>
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Body>
                    <h6 className="card-title">Weight Information</h6>
                    <p><strong>Current Weight:</strong> {goalData.currentWeight} kg</p>
                    <p><strong>Target Weight:</strong> {goalData.targetWeight} kg</p>
                    <p><strong>Goal:</strong> {goalData.weightGoal?.charAt(0).toUpperCase() + goalData.weightGoal?.slice(1)} Weight</p>
                    {goalData.currentWeight && goalData.targetWeight && (
                      <p><strong>Weight to {goalData.weightGoal}:</strong> {Math.abs(parseFloat(goalData.targetWeight) - parseFloat(goalData.currentWeight)).toFixed(1)} kg</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Body>
                    <h6 className="card-title">Lifestyle Information</h6>
                    <p><strong>Timeframe:</strong> {goalData.timeframe?.replace(/(\d+)(\w+)/, '$1 $2')}</p>
                    <p><strong>Activity Level:</strong> {goalData.activityLevel?.charAt(0).toUpperCase() + goalData.activityLevel?.slice(1)}</p>
                    <p><strong>Diet Type:</strong> {goalData.dietType || 'Not specified'}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );

  const GoalSetter = () => (
    <Card>
      <Card.Header>
        <h4>{hasExistingGoals ? 'Update Your Goals' : 'Set Your Goals'}</h4>
      </Card.Header>
      <Card.Body>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {loading && <Alert variant="info">Loading...</Alert>}

        <Form onSubmit={handleGoalSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Current Weight (kg)</Form.Label>
                <Form.Control
                  type="number"
                  value={goalData.currentWeight}
                  onChange={(e) => setGoalData(prev => ({ ...prev, currentWeight: e.target.value }))}
                  placeholder="Enter current weight"
                  min="0"
                  step="0.1"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Weight Goal</Form.Label>
                <Form.Select
                  value={goalData.weightGoal}
                  onChange={(e) => setGoalData(prev => ({ ...prev, weightGoal: e.target.value }))}
                  required
                >
                  <option value="">Select your goal</option>
                  <option value="lose">Lose Weight</option>
                  <option value="gain">Gain Weight</option>
                  <option value="maintain">Maintain Weight</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Target Weight (kg)</Form.Label>
                <Form.Control
                  type="number"
                  value={goalData.targetWeight}
                  onChange={(e) => setGoalData(prev => ({ ...prev, targetWeight: e.target.value }))}
                  placeholder="Enter target weight"
                  min="0"
                  step="0.1"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Timeframe</Form.Label>
                <Form.Select
                  value={goalData.timeframe}
                  onChange={(e) => setGoalData(prev => ({ ...prev, timeframe: e.target.value }))}
                  required
                >
                  <option value="">Select timeframe</option>
                  <option value="1month">1 Month</option>
                  <option value="3months">3 Months</option>
                  <option value="6months">6 Months</option>
                  <option value="1year">1 Year</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Activity Level</Form.Label>
                <Form.Select
                  value={goalData.activityLevel}
                  onChange={(e) => setGoalData(prev => ({ ...prev, activityLevel: e.target.value }))}
                  required
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (little/no exercise)</option>
                  <option value="light">Light (light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                  <option value="active">Active (hard exercise 6-7 days/week)</option>
                  <option value="very_active">Very Active (very hard exercise, physical job)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Diet Type Preference</Form.Label>
                <Form.Select
                  value={goalData.dietType}
                  onChange={(e) => setGoalData(prev => ({ ...prev, dietType: e.target.value }))}
                >
                  <option value="">Select diet type (optional)</option>
                  <option value="balanced">Balanced</option>
                  <option value="keto">Ketogenic</option>
                  <option value="paleo">Paleo</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="mediterranean">Mediterranean</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div>
              {goalData.currentWeight && goalData.targetWeight && (
                <small className="text-muted">
                  Goal: {goalData.weightGoal === 'lose' ? 'Lose' : goalData.weightGoal === 'gain' ? 'Gain' : 'Maintain'} {' '}
                  {Math.abs(parseFloat(goalData.targetWeight) - parseFloat(goalData.currentWeight)).toFixed(1)} kg
                </small>
              )}
            </div>
            <Button variant="primary" type="submit" size="lg" disabled={loading}>
              {loading ? 'Saving...' : hasExistingGoals ? 'Update Goals' : 'Set Goals'}
            </Button>
          </div>
        </Form>

        {hasExistingGoals && (
          <div className="mt-4 p-3 bg-light rounded">
            <h6>Current Goal Summary:</h6>
            <Row>
              <Col md={6}>
                <small>
                  <strong>Current Weight:</strong> {goalData.currentWeight} kg<br/>
                  <strong>Target Weight:</strong> {goalData.targetWeight} kg<br/>
                  <strong>Goal:</strong> {goalData.weightGoal?.charAt(0).toUpperCase() + goalData.weightGoal?.slice(1)} Weight
                </small>
              </Col>
              <Col md={6}>
                <small>
                  <strong>Timeframe:</strong> {goalData.timeframe?.replace(/(\d+)(\w+)/, '$1 $2')}<br/>
                  <strong>Activity Level:</strong> {goalData.activityLevel?.charAt(0).toUpperCase() + goalData.activityLevel?.slice(1)}<br/>
                  <strong>Diet Type:</strong> {goalData.dietType || 'Not specified'}
                </small>
              </Col>
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );

  const UpdateProfile = () => (
    <Card>
      <Card.Header>
        <h4>Update Profile</h4>
      </Card.Header>
      <Card.Body>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {loading && <Alert variant="info">Loading...</Alert>}

        <Form onSubmit={handleProfileSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  value={profileData.gender}
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Select gender (optional)</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" type="submit" size="lg" disabled={loading}>
              {loading ? 'Saving...' : 'Update Profile'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );

  const Settings = () => (
    <Card>
      <Card.Header>
        <h4>Account Settings</h4>
      </Card.Header>
      <Card.Body>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Row>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <h6>Privacy Settings</h6>
                <Form.Check
                  type="checkbox"
                  label="Make profile public"
                  className="mb-2"
                  checked={settingsData.privacy.makeProfilePublic}
                  onChange={(e) => handleSettingsChange('privacy', 'makeProfilePublic', e.target.checked)}
                />
                <Form.Check
                  type="checkbox"
                  label="Allow goal sharing"
                  className="mb-2"
                  checked={settingsData.privacy.allowGoalSharing}
                  onChange={(e) => handleSettingsChange('privacy', 'allowGoalSharing', e.target.checked)}
                />
                <Form.Check
                  type="checkbox"
                  label="Enable progress notifications"
                  checked={settingsData.privacy.enableProgressNotifications}
                  onChange={(e) => handleSettingsChange('privacy', 'enableProgressNotifications', e.target.checked)}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <h6>Notification Preferences</h6>
                <Form.Check
                  type="checkbox"
                  label="Daily reminders"
                  className="mb-2"
                  checked={settingsData.notifications.dailyReminders}
                  onChange={(e) => handleSettingsChange('notifications', 'dailyReminders', e.target.checked)}
                />
                <Form.Check
                  type="checkbox"
                  label="Weekly progress reports"
                  className="mb-2"
                  checked={settingsData.notifications.weeklyProgressReports}
                  onChange={(e) => handleSettingsChange('notifications', 'weeklyProgressReports', e.target.checked)}
                />
                <Form.Check
                  type="checkbox"
                  label="Goal achievement alerts"
                  checked={settingsData.notifications.goalAchievementAlerts}
                  onChange={(e) => handleSettingsChange('notifications', 'goalAchievementAlerts', e.target.checked)}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <hr />

        <div className="mt-4">
          <h6>Account Actions</h6>
          <div className="d-flex gap-2 flex-wrap">
            <Button
              variant="outline-primary"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setShowExportModal(true)}
            >
              Export Data
            </Button>
            <Button
              variant="outline-warning"
              onClick={() => setShowResetGoalsModal(true)}
              disabled={!hasExistingGoals}
            >
              Reset Goals
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => setShowDeleteAccountModal(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <>
      <Header showSettings={true} />
      <div className="container mt-4">
        <Row>
          <Col>
            <Nav variant="tabs" className="mb-4 d-flex justify-content-between">
              <div className="d-flex">
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "profile"}
                    onClick={() => setActiveTab("profile")}
                  >
                    Profile Details
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "goals"}
                    onClick={() => setActiveTab("goals")}
                  >
                    Goal Setting
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === "update"}
                    onClick={() => setActiveTab("update")}
                  >
                    Update Profile
                  </Nav.Link>
                </Nav.Item>
              </div>

              <Nav.Item>
                <Nav.Link
                  active={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                  className="ms-auto"
                >
                  Settings
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {activeTab === "profile" && <ProfileDetails />}
            {activeTab === "goals" && <GoalSetter />}
            {activeTab === "update" && <UpdateProfile />}
            {activeTab === "settings" && <Settings />}
          </Col>
        </Row>
      </div>

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordChange}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                minLength="6"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Change Password
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Reset Goals Modal */}
      <Modal show={showResetGoalsModal} onHide={() => setShowResetGoalsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Goals</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to reset all your goals? This action cannot be undone.</p>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setShowResetGoalsModal(false)}>
              Cancel
            </Button>
            <Button variant="warning" onClick={handleResetGoals}>
              Reset Goals
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Export Data Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Export Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This will download all your profile data, goals, and settings in JSON format.</p>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExportData}>
              Export Data
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Delete Account Modal */}
      <Modal show={showDeleteAccountModal} onHide={() => setShowDeleteAccountModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Warning:</strong> This action is permanent and cannot be undone. All your data will be permanently deleted.
          </Alert>
          <p>Are you absolutely sure you want to delete your account?</p>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteAccountModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Profile;