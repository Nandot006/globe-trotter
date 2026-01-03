import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/Calendar.css';

interface Trip {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  trips: Trip[];
}

const Calendar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState<Trip[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTrips, setSelectedTrips] = useState<Trip[]>([]);

  useEffect(() => {
    loadTrips();
  }, [user]);

  useEffect(() => {
    generateCalendar();
  }, [currentDate, trips]);

  const loadTrips = async () => {
    if (!user) return;
    try {
      const data = await api.getTrips({ user_id: user.id });
      setTrips(data);
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayTrips = trips.filter(trip => {
        const tripStart = new Date(trip.start_date).toISOString().split('T')[0];
        const tripEnd = new Date(trip.end_date).toISOString().split('T')[0];
        return dateStr >= tripStart && dateStr <= tripEnd;
      });
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        trips: dayTrips
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setSelectedTrips(day.trips);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ongoing': return '#4CAF50';
      case 'upcoming': return '#2196F3';
      case 'completed': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="calendar-container">
      {/* Header */}
      <header className="calendar-header">
        <div className="header-content">
          <h1 className="logo" onClick={() => navigate('/home')}>GlobeTrotter</h1>
          <nav className="nav-menu">
            <button onClick={() => navigate('/home')}>Home</button>
            <button onClick={() => navigate('/trips')}>My Trips</button>
            <button onClick={() => navigate('/community')}>Community</button>
            <button onClick={() => navigate('/calendar')} className="active">Calendar</button>
            <button onClick={() => navigate('/profile')}>Profile</button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </nav>
        </div>
      </header>

      <div className="calendar-content">
        <div className="calendar-main">
          {/* Calendar Controls */}
          <div className="calendar-controls">
            <h2>{getMonthName()}</h2>
            <div className="controls-buttons">
              <button onClick={handlePrevMonth} className="nav-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="today-btn">Today</button>
              <button onClick={handleNextMonth} className="nav-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid-wrapper">
            <div className="calendar-weekdays">
              <div className="weekday">SUN</div>
              <div className="weekday">MON</div>
              <div className="weekday">TUE</div>
              <div className="weekday">WED</div>
              <div className="weekday">THU</div>
              <div className="weekday">FRI</div>
              <div className="weekday">SAT</div>
            </div>
            
            <div className="calendar-grid">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''} ${day.trips.length > 0 ? 'has-trips' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  <span className="day-number">{day.date.getDate()}</span>
                  {day.trips.length > 0 && (
                    <div className="day-trips-indicator">
                      {day.trips.slice(0, 3).map((trip, idx) => (
                        <div 
                          key={idx} 
                          className="trip-dot" 
                          style={{ backgroundColor: getStatusColor(trip.status) }}
                          title={trip.title}
                        ></div>
                      ))}
                      {day.trips.length > 3 && <span className="more-trips">+{day.trips.length - 3}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#4CAF50' }}></div>
              <span>Ongoing</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#2196F3' }}></div>
              <span>Upcoming</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ backgroundColor: '#9E9E9E' }}></div>
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="calendar-sidebar">
          <div className="sidebar-section">
            <h3>
              {selectedDate 
                ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'Select a date'
              }
            </h3>
            
            {selectedTrips.length > 0 ? (
              <div className="sidebar-trips">
                {selectedTrips.map(trip => (
                  <div key={trip.id} className="sidebar-trip-card" onClick={() => navigate(`/trip/${trip.id}`)}>
                    <div className="trip-status-indicator" style={{ backgroundColor: getStatusColor(trip.status) }}></div>
                    <div className="trip-info">
                      <h4>{trip.title}</h4>
                      <p className="trip-destination">{trip.destination}</p>
                      <p className="trip-dates">
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                      </p>
                      <span className={`trip-badge ${trip.status}`}>{trip.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-sidebar">
                <p>{selectedDate ? 'No trips on this date' : 'Click on a date to see trips'}</p>
              </div>
            )}
          </div>

          {/* Upcoming Trips */}
          <div className="sidebar-section">
            <h3>Upcoming Trips</h3>
            <div className="upcoming-list">
              {trips.filter(t => t.status === 'upcoming').slice(0, 5).map(trip => (
                <div key={trip.id} className="upcoming-trip-item" onClick={() => navigate(`/trip/${trip.id}`)}>
                  <div className="upcoming-date">
                    <span className="month">{new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="day">{new Date(trip.start_date).getDate()}</span>
                  </div>
                  <div className="upcoming-info">
                    <h5>{trip.title}</h5>
                    <p>{trip.destination}</p>
                  </div>
                </div>
              ))}
              {trips.filter(t => t.status === 'upcoming').length === 0 && (
                <p className="no-upcoming">No upcoming trips</p>
              )}
            </div>
          </div>

          <button onClick={() => navigate('/create-trip')} className="create-trip-btn">
            + Create New Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
