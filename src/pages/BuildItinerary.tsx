import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/BuildItinerary.css';

interface Section {
  id?: number;
  section_number: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
  activities: Activity[];
}

interface Activity {
  id?: number;
  day_number: number;
  name: string;
  description: string;
  expense: number;
  activity_type: string;
}

const BuildItinerary = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([
    {
      section_number: 1,
      title: 'Section 1',
      description: '',
      start_date: '',
      end_date: '',
      budget: 0,
      activities: []
    }
  ]);

  const addSection = () => {
    setSections([...sections, {
      section_number: sections.length + 1,
      title: `Section ${sections.length + 1}`,
      description: '',
      start_date: '',
      end_date: '',
      budget: 0,
      activities: []
    }]);
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const addActivity = (sectionIndex: number) => {
    const newSections = [...sections];
    const activities = newSections[sectionIndex].activities || [];
    activities.push({
      day_number: activities.length + 1,
      name: '',
      description: '',
      expense: 0,
      activity_type: ''
    });
    newSections[sectionIndex].activities = activities;
    setSections(newSections);
  };

  const handleSave = async () => {
    if (!tripId) return;

    try {
      for (const section of sections) {
        const sectionResult = await api.addItinerarySection(parseInt(tripId), {
          section_number: section.section_number,
          title: section.title,
          description: section.description,
          start_date: section.start_date,
          end_date: section.end_date,
          budget: section.budget
        });

        if (sectionResult.success && section.activities) {
          for (const activity of section.activities) {
            await api.addActivity(sectionResult.section_id, activity);
          }
        }
      }

      navigate(`/trip/${tripId}`);
    } catch (error) {
      console.error('Error saving itinerary:', error);
    }
  };

  return (
    <div className="build-itinerary-container">
      <header className="page-header">
        <h1>GlobeTrotter</h1>
        <button onClick={() => navigate('/home')}>← Back</button>
      </header>

      <div className="itinerary-content">
        <h2>Build Itinerary Screen</h2>
        
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="itinerary-section">
            <h3>{section.title}</h3>
            <div className="section-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Section Title</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                    placeholder="All the necessary information about this section"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={section.description}
                    onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                    placeholder="This can be anything like Paris section, hotel or any other activity"
                    rows={2}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date Range</label>
                  <input
                    type="date"
                    value={section.start_date}
                    onChange={(e) => updateSection(sectionIndex, 'start_date', e.target.value)}
                  />
                  <span> to </span>
                  <input
                    type="date"
                    value={section.end_date}
                    onChange={(e) => updateSection(sectionIndex, 'end_date', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Budget of this section</label>
                  <input
                    type="number"
                    value={section.budget}
                    onChange={(e) => updateSection(sectionIndex, 'budget', parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="activities-section">
                <h4>Activities</h4>
                {section.activities?.map((activity, actIndex) => (
                  <div key={actIndex} className="activity-row">
                    <input
                      type="text"
                      placeholder="Activity name"
                      value={activity.name}
                      onChange={(e) => {
                        const newSections = [...sections];
                        newSections[sectionIndex].activities[actIndex].name = e.target.value;
                        setSections(newSections);
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Expense"
                      value={activity.expense}
                      onChange={(e) => {
                        const newSections = [...sections];
                        newSections[sectionIndex].activities[actIndex].expense = parseFloat(e.target.value);
                        setSections(newSections);
                      }}
                    />
                  </div>
                ))}
                <button type="button" onClick={() => addActivity(sectionIndex)} className="add-activity-btn">
                  + Add Activity
                </button>
              </div>
            </div>
          </div>
        ))}

        <button onClick={addSection} className="add-section-btn">+ Add another Section</button>
        <button onClick={handleSave} className="save-btn">Save Itinerary</button>
      </div>
    </div>
  );
};

export default BuildItinerary;
