import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/Home.css';

interface City {
  id: number;
  name: string;
  country: string;
  region: string;
  description: string;
  is_featured: boolean;
}

interface Trip {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  description: string;
}

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [citiesData, tripsData] = await Promise.all([
        api.getCities({ featured: true }),
        user ? api.getTrips({ user_id: user.id }) : Promise.resolve([])
      ]);
      setCities(citiesData);
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = async () => {
    if (searchQuery) {
      const results = await api.getCities({ search: searchQuery });
      navigate('/search', { state: { results, query: searchQuery } });
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="logo">GlobeTrotter</h1>
          <nav className="nav-menu">
            <Link to="/home">Home</Link>
            <Link to="/trips">My Trips</Link>
            <Link to="/community">Community</Link>
            <Link to="/calendar">Calendar</Link>
            {user?.is_admin ? <Link to="/admin">Admin</Link> : null}
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </nav>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-banner">
          <div className="banner-overlay">
            <h2>Plan Your Next Adventure</h2>
            <p>Discover amazing destinations and create unforgettable memories</p>
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="popular">Popular</option>
            <option value="recent">Recent</option>
          </select>
          <button>Filter</button>
          <button>Sort by...</button>
        </div>
      </section>

      <section className="featured-destinations">
        <h2>Top Regional Selections</h2>
        <div className="destinations-grid">
          {cities.slice(0, 5).map((city) => (
            <div key={city.id} className="destination-card" onClick={() => navigate(`/city/${city.id}`)}>
              <div className="destination-image">
                <div className="placeholder-image">{city.name[0]}</div>
              </div>
              <h3>{city.name}</h3>
              <p>{city.country}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="previous-trips">
        <h2>Previous Trips</h2>
        <div className="trips-grid">
          {trips.filter(t => t.status === 'completed').slice(0, 3).map((trip) => (
            <div key={trip.id} className="trip-card" onClick={() => navigate(`/trip/${trip.id}`)}>
              <div className="trip-image-placeholder"></div>
              <div className="trip-info">
                <h3>{trip.title}</h3>
                <p>{trip.destination}</p>
                <span className="trip-dates">{trip.start_date} - {trip.end_date}</span>
              </div>
            </div>
          ))}
        </div>
        <button className="plan-trip-btn" onClick={() => navigate('/create-trip')}>+ Plan a Trip</button>
      </section>
    </div>
  );
};

export default Home;
