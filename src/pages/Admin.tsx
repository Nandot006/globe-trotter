import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAllUsers()
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  return (
    <div className="admin-container">
      <header className="page-header">
        <h1>GlobeTrotter - Admin Panel</h1>
        <button onClick={() => navigate('/home')}>← Back to Home</button>
      </header>

      <div className="admin-content">
        <div className="admin-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </button>
          <button 
            className={activeTab === 'cities' ? 'active' : ''} 
            onClick={() => setActiveTab('cities')}
          >
            Manage Cities
          </button>
          <button 
            className={activeTab === 'activities' ? 'active' : ''} 
            onClick={() => setActiveTab('activities')}
          >
            Manage Activities
          </button>
          <button 
            className={activeTab === 'trips' ? 'active' : ''} 
            onClick={() => setActiveTab('trips')}
          >
            Trips and Itineraries
          </button>
        </div>

        {activeTab === 'overview' && stats && (
          <div className="admin-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.total_users}</p>
              </div>
              <div className="stat-card">
                <h3>Total Trips</h3>
                <p className="stat-number">{stats.total_trips}</p>
              </div>
              <div className="stat-card">
                <h3>Total Cities</h3>
                <p className="stat-number">{stats.total_cities}</p>
              </div>
              <div className="stat-card">
                <h3>Community Posts</h3>
                <p className="stat-number">{stats.total_posts}</p>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-card">
                <h3>Trips by Status</h3>
                <div className="chart-placeholder">
                  <div className="pie-chart">
                    {stats.trips_by_status && Object.entries(stats.trips_by_status).map(([status, count]: [string, any]) => (
                      <div key={status} className="chart-item">
                        <span className="chart-label">{status}</span>
                        <span className="chart-value">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <h3>Recent Activity</h3>
                <div className="chart-placeholder">
                  <div className="line-chart">
                    {stats.recent_activity && stats.recent_activity.slice(0, 10).map((item: any) => (
                      <div key={item.date} className="activity-item">
                        <span>{item.date}</span>
                        <span>{item.count} trips</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-users">
            <h2>Manage Users</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Country</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.city}</td>
                    <td>{user.country}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="action-btn">View</button>
                      <button className="action-btn delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'cities' && (
          <div className="admin-section">
            <h2>Manage Cities</h2>
            <button className="add-btn">+ Add New City</button>
            <p>City management interface would go here</p>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="admin-section">
            <h2>Manage Activities</h2>
            <button className="add-btn">+ Add New Activity</button>
            <p>Activity management interface would go here</p>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="admin-section">
            <h2>Trips and Itineraries</h2>
            <p>Trip management interface would go here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
