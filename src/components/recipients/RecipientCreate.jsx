// Improved src/components/recipients/RecipientCreate.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RecipientService from '../../services/recipient.service';
import './RecipientCreate.css';

const RecipientCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company: '',
    position: ''
  });
  const [customFields, setCustomFields] = useState([
    { name: '', value: '' }
  ]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref for focus
  const emailInputRef = useRef(null);

  // Focus email input on component mount
  useEffect(() => {
    if (emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current.focus();
      }, 300);
    }
    
    // Set page title
    document.title = 'Add Recipient | Email Campaign Manager';
    
    return () => {
      // Reset title when component unmounts
      document.title = 'Email Campaign Manager';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleCustomFieldChange = (index, field, value) => {
    const newCustomFields = [...customFields];
    newCustomFields[index][field] = value;
    setCustomFields(newCustomFields);
    
    // Clear custom field errors when user types
    if (errors.customFields && errors.customFields[index]) {
      const newCustomFieldErrors = { ...errors.customFields };
      delete newCustomFieldErrors[index];
      
      if (Object.keys(newCustomFieldErrors).length === 0) {
        const newErrors = { ...errors };
        delete newErrors.customFields;
        setErrors(newErrors);
      } else {
        setErrors({
          ...errors,
          customFields: newCustomFieldErrors
        });
      }
    }
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { name: '', value: '' }
    ]);
  };

  const removeCustomField = (index) => {
    const newCustomFields = [...customFields];
    newCustomFields.splice(index, 1);
    setCustomFields(newCustomFields);
    
    // Clear errors for removed field
    if (errors.customFields && errors.customFields[index]) {
      const newCustomFieldErrors = { ...errors.customFields };
      delete newCustomFieldErrors[index];
      
      // Adjust indices for remaining fields
      const adjustedCustomFieldErrors = {};
      Object.keys(newCustomFieldErrors).forEach(key => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          adjustedCustomFieldErrors[keyNum - 1] = newCustomFieldErrors[key];
        } else {
          adjustedCustomFieldErrors[key] = newCustomFieldErrors[key];
        }
      });
      
      if (Object.keys(adjustedCustomFieldErrors).length === 0) {
        const newErrors = { ...errors };
        delete newErrors.customFields;
        setErrors(newErrors);
      } else {
        setErrors({
          ...errors,
          customFields: adjustedCustomFieldErrors
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate custom fields - names cannot be empty if value is provided
    const customFieldErrors = {};
    customFields.forEach((field, index) => {
      if (!field.name && field.value) {
        customFieldErrors[index] = 'Field name is required';
      }
    });
    
    if (Object.keys(customFieldErrors).length > 0) {
      newErrors.customFields = customFieldErrors;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show error and focus first input with error
      if (errors.email && emailInputRef.current) {
        emailInputRef.current.focus();
      }
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Process custom fields into an object
      const customFieldsObj = {};
      customFields.forEach(field => {
        if (field.name && field.value) {
          customFieldsObj[field.name] = field.value;
        }
      });
      
      const recipientData = {
        ...formData,
        custom_fields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : null
      };
      
      await RecipientService.createRecipient(recipientData);
      navigate('/recipients');
    } catch (err) {
      setError(err.message || 'Failed to create recipient. Please try again.');
      console.error(err);
      
      // Scroll to top to show error
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipient-create-container">
      <div className="recipient-create-header">
        <Link to="/recipients" className="back-button">
          <span className="material-icons">arrow_back</span>
          Back to Recipients
        </Link>
        <h1>Add New Recipient</h1>
      </div>
      
      {error && (
        <div className="error-message">
          <span className="material-icons">error_outline</span>
          <p>{error}</p>
        </div>
      )}
      
      <div className="recipient-create-card">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="email">Email Address*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="email@example.com"
                ref={emailInputRef}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
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
                  placeholder="John"
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
                  placeholder="Doe"
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
                  placeholder="Company Name"
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
                  placeholder="Job Title"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <div className="section-header">
              <h2>Custom Fields</h2>
              <button 
                type="button" 
                onClick={addCustomField}
                className="add-field-button"
              >
                <span className="material-icons">add</span>
                Add Field
              </button>
            </div>
            
            <div className="custom-fields-list">
              {customFields.map((field, index) => (
                <div key={index} className="custom-field-row">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Field name"
                      value={field.name}
                      onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                      className={errors.customFields && errors.customFields[index] ? 'error' : ''}
                    />
                    {errors.customFields && errors.customFields[index] && (
                      <p className="error-text">{errors.customFields[index]}</p>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Field value"
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                    />
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => removeCustomField(index)}
                    className="remove-field-button"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-actions">
            <Link to="/recipients" className="cancel-button">
              Cancel
            </Link>
            <button 
              type="submit" 
              className={`save-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Recipient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipientCreate;