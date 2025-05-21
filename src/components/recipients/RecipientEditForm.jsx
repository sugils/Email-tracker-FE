// src/components/recipients/RecipientEditForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RecipientService from '../../services/recipient.service';
import './RecipientEditForm.css';

const RecipientEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company: '',
    position: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchRecipient = async () => {
      try {
        setLoading(true);
        const data = await RecipientService.getRecipient(id);
        
        // Extract the main fields from the recipient data
        const { email, first_name, last_name, company, position } = data;
        setFormData({
          email,
          first_name: first_name || '',
          last_name: last_name || '',
          company: company || '',
          position: position || '',
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch recipient');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipient();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate email
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      await RecipientService.updateRecipient(id, formData);
      setSuccess(true);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/recipients');
      }, 1500);
      
    } catch (err) {
      setError(err.message || 'Failed to update recipient');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="recipient-form-loading">
        <div className="loader"></div>
        <p>Loading recipient data...</p>
      </div>
    );
  }

  if (error && !formData.email) {
    return (
      <div className="recipient-form-error">
        <span className="material-icons error-icon">error_outline</span>
        <h3>Error Loading Recipient</h3>
        <p>{error}</p>
        <Link to="/recipients" className="back-button">
          <span className="material-icons">arrow_back</span>
          Back to Recipients
        </Link>
      </div>
    );
  }

  return (
    <div className="recipient-form-container">
      <Link to="/recipients" className="back-button">
        <span className="material-icons">arrow_back</span>
        Back to Recipients
      </Link>
      
      <div className="recipient-form-header">
        <h1>Edit Recipient</h1>
      </div>

      {success && (
        <div className="notification notification-success">
          <span className="material-icons">check_circle</span>
          <p>Recipient updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="notification notification-error">
          <span className="material-icons">error_outline</span>
          <p>{error}</p>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="recipient-form">
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={submitLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={submitLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={submitLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled={submitLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                disabled={submitLoading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/recipients')}
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${submitLoading ? 'loading' : ''}`}
              disabled={submitLoading}
            >
              {submitLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipientEditForm;