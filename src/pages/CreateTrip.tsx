import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/CreateTrip.css';

const CreateTrip = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTripData(prev => ({ ...prev, [name]: value }));

    if (name === 'destination' && value.length > 2) {
      searchDestinations(value);
    }
  };

  const searchDestinations = async (query: string) => {
    try {
      const results = await api.getCities({ search: query });
      setSuggestions(results);
    } catch (error) {
      console.error('Error searching destinations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const result = await api.createTrip({
        ...tripData,
        user_id: user.id,
        status: 'upcoming'
      });

      if (result.success) {
        navigate(`/build-itinerary/${result.trip_id}`);
      }
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  return (
    <div className="create-trip-container">
      <header className="page-header">
        <h1>GlobeTrotter</h1>
        <button onClick={() => navigate('/home')}>← Back to Home</button>
      </header>

      <div className="create-trip-content">
        <h2>Plan a New Trip</h2>
        <form onSubmit={handleSubmit} className="trip-form">
          <div className="form-group">
            <label>Trip Title</label>
            <input
              type="text"
              name="title"
              value={tripData.title}
              onChange={handleInputChange}
              placeholder="e.g., Summer Vacation 2024"
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="start_date"
              value={tripData.start_date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Select a Place</label>
            <input
              type="text"
              name="destination"
              value={tripData.destination}
              onChange={handleInputChange}
              placeholder="Where do you want to go?"
              required
            />
            {suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map(city => (
                  <div
                    key={city.id}
                    className="suggestion-item"
                    onClick={() => {
                      setTripData(prev => ({ ...prev, destination: city.name }));
                      setSuggestions([]);
                    }}
                  >
                    {city.name}, {city.country}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="end_date"
              value={tripData.end_date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              name="description"
              value={tripData.description}
              onChange={handleInputChange}
              placeholder="Add any notes about your trip..."
              rows={4}
            />
          </div>

          <div className="suggestions-section">
            <h3>Suggestions for Places to Visit/Activities to Prefere</h3>
            <div className="suggestions-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="suggestion-card">
                  <div className="suggestion-placeholder"></div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn">Continue to Itinerary →</button>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;
