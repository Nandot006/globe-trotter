import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/TripListing.css';

interface Trip {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  description: string;
}

const TripListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTrips();
  }, [user]);

  const loadTrips = async () => {
    if (!user) return;
    try {
      const data = await api.getTrips({ user_id: user.id });
      setTrips(data);
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const filterTrips = (status: string) => {
    return trips.filter(trip => status === 'all' || trip.status === status);
  };

  const searchTrips = () => {
    return trips.filter(trip => 
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const displayTrips = searchQuery ? searchTrips() : filterTrips(filter);

  return (
    <div className="trip-listing-container">
      <header className="page-header">
        <h1>GlobeTrotter</h1>
        <button onClick={() => navigate('/home')}>← Back to Home</button>
      </header>

      <div className="trip-listing-content">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>Search</button>
          <button>Filter</button>
          <button>Sort by...</button>
        </div>

        <section className="trip-section">
          <h2>Ongoing</h2>
          <div className="trips-list">
            {filterTrips('ongoing').map(trip => (
              <div key={trip.id} className="trip-item" onClick={() => navigate(`/trip/${trip.id}`)}>
                <div className="trip-overview">
                  <h3>{trip.title}</h3>
                  <p>{trip.description || 'Short Over View of the Trip'}</p>
                  <span className="trip-dates">{trip.start_date} - {trip.end_date}</span>
                </div>
              </div>
            ))}
            {filterTrips('ongoing').length === 0 && <p className="no-trips">No ongoing trips</p>}
          </div>
        </section>

        <section className="trip-section">
          <h2>Upcoming</h2>
          <div className="trips-list">
            {filterTrips('upcoming').map(trip => (
              <div key={trip.id} className="trip-item" onClick={() => navigate(`/trip/${trip.id}`)}>
                <div className="trip-overview">
                  <h3>{trip.title}</h3>
                  <p>{trip.description || 'Short Over View of the Trip'}</p>
                  <span className="trip-dates">{trip.start_date} - {trip.end_date}</span>
                </div>
              </div>
            ))}
            {filterTrips('upcoming').length === 0 && <p className="no-trips">No upcoming trips</p>}
          </div>
        </section>

        <section className="trip-section">
          <h2>Completed</h2>
          <div className="trips-list">
            {filterTrips('completed').map(trip => (
              <div key={trip.id} className="trip-item" onClick={() => navigate(`/trip/${trip.id}`)}>
                <div className="trip-overview">
                  <h3>{trip.title}</h3>
                  <p>{trip.description || 'Short Over View of the Trip'}</p>
                  <span className="trip-dates">{trip.start_date} - {trip.end_date}</span>
                </div>
              </div>
            ))}
            {filterTrips('completed').length === 0 && <p className="no-trips">No completed trips</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TripListing;
