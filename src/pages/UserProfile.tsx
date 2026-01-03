import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/UserProfile.css';

interface Trip {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
}

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    additionalInfo: ''
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [plannedTrips, setPlannedTrips] = useState<Trip[]>([]);
  const [previousTrips, setPreviousTrips] = useState<Trip[]>([]);

  useEffect(() => {
    loadUserData();
    loadUserTrips();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      const data = await api.getUser(user.id);
      setProfileData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        city: data.city || '',
        country: data.country || '',
        additionalInfo: data.additional_info || ''
      });
      setProfilePhoto(data.photo || null);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserTrips = async () => {
    if (!user) return;
    try {
      const data = await api.getTrips({ user_id: user.id });
      setTrips(data);
      setPlannedTrips(data.filter((t: Trip) => t.status === 'upcoming'));
      setPreviousTrips(data.filter((t: Trip) => t.status === 'completed'));
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await api.updateUser(user.id, profileData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = () => {
    return `${profileData.firstName[0] || ''}${profileData.lastName[0] || ''}`.toUpperCase();
  };

  return (
    <div className="user-profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <h1 className="logo" onClick={() => navigate('/home')}>GlobeTrotter</h1>
          <nav className="nav-menu">
            <button onClick={() => navigate('/home')}>Home</button>
            <button onClick={() => navigate('/trips')}>My Trips</button>
            <button onClick={() => navigate('/community')}>Community</button>
            <button onClick={() => navigate('/calendar')}>Calendar</button>
            <button onClick={() => navigate('/profile')} className="active">Profile</button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </nav>
        </div>
      </header>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-main-card">
          <div className="profile-header-section">
            <div className="profile-photo-section">
              <div className="profile-photo-wrapper" onClick={() => isEditing && fileInputRef.current?.click()}>
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="profile-photo" />
                ) : (
                  <div className="profile-photo-placeholder">
                    <span>{getInitials()}</span>
                  </div>
                )}
                {isEditing && (
                  <div className="photo-overlay">
                    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="profile-header-info">
              <h2>{profileData.firstName} {profileData.lastName}</h2>
              <p className="username">@{user?.username}</p>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{plannedTrips.length}</span>
                  <span className="stat-label">Planned Trips</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{previousTrips.length}</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{trips.length}</span>
                  <span className="stat-label">Total Trips</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit Profile
              </button>
            ) : (
              <>
                <button onClick={handleSave} className="save-btn">Save Changes</button>
                <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
              </>
            )}
          </div>

          {/* Profile Details */}
          <div className="profile-details-section">
            <h3>Personal Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.firstName}</p>
                )}
              </div>

              <div className="detail-item">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.lastName}</p>
                )}
              </div>

              <div className="detail-item">
                <label>Email</label>
                <p>{profileData.email}</p>
              </div>

              <div className="detail-item">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.phone}</p>
                )}
              </div>

              <div className="detail-item">
                <label>City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.city}</p>
                )}
              </div>

              <div className="detail-item">
                <label>Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="country"
                    value={profileData.country}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p>{profileData.country}</p>
                )}
              </div>

              <div className="detail-item full-width">
                <label>About Me</label>
                {isEditing ? (
                  <textarea
                    name="additionalInfo"
                    value={profileData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                  />
                ) : (
                  <p>{profileData.additionalInfo || 'No description provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trips Section */}
        <div className="profile-trips-section">
          <div className="trips-header">
            <h3>Planned Trips</h3>
            <button onClick={() => navigate('/create-trip')} className="add-trip-btn">+ Add Trip</button>
          </div>
          <div className="trips-list">
            {plannedTrips.length > 0 ? (
              plannedTrips.map(trip => (
                <div key={trip.id} className="trip-card-small" onClick={() => navigate(`/trip/${trip.id}`)}>
                  <div className="trip-card-header">
                    <h4>{trip.title}</h4>
                    <span className={`status-badge ${trip.status}`}>{trip.status}</span>
                  </div>
                  <p className="trip-destination">{trip.destination}</p>
                  <p className="trip-dates">{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
                  <button className="view-btn">View Details</button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No planned trips yet</p>
                <button onClick={() => navigate('/create-trip')}>Plan Your First Trip</button>
              </div>
            )}
          </div>

          <div className="trips-header">
            <h3>Previous Trips</h3>
          </div>
          <div className="trips-list">
            {previousTrips.length > 0 ? (
              previousTrips.map(trip => (
                <div key={trip.id} className="trip-card-small" onClick={() => navigate(`/trip/${trip.id}`)}>
                  <div className="trip-card-header">
                    <h4>{trip.title}</h4>
                    <span className={`status-badge ${trip.status}`}>{trip.status}</span>
                  </div>
                  <p className="trip-destination">{trip.destination}</p>
                  <p className="trip-dates">{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
                  <button className="view-btn">View Details</button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No previous trips</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
