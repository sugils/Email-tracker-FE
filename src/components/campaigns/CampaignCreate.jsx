// Enhanced src/components/campaigns/CampaignCreate.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CampaignService from '../../services/campaign.service';
import RecipientService from '../../services/recipient.service';
import TemplateService from '../../services/template.service';
import EmailEditor from './EmailEditor';
import './CampaignCreate.css';

const CampaignCreate = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [templateHtml, setTemplateHtml] = useState('');
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stepChanged, setStepChanged] = useState(false);
  
  // Refs for animations and focus
  const contentRef = useRef(null);
  const campaignNameRef = useRef(null);
  
  const [campaignData, setCampaignData] = useState({
    campaign_name: '',
    subject_line: '',
    from_name: '',
    from_email: '',
    reply_to_email: '',
    template: {
      name: 'Default Template',
      html_content: '',
      text_content: ''
    }
  });

  useEffect(() => {
    // Load recipients on component mount
    const loadRecipients = async () => {
      try {
        setRecipientsLoading(true);
        const data = await RecipientService.getAllRecipients();
        setRecipients(data);
      } catch (err) {
        console.error('Failed to load recipients:', err);
      } finally {
        setRecipientsLoading(false);
      }
    };

    // Load default email template
    const loadDefaultTemplate = () => {
      const defaultTemplate = TemplateService.getDefaultTemplate();
      setCampaignData(prev => ({
        ...prev,
        template: {
          ...prev.template,
          html_content: defaultTemplate.html_content,
          text_content: defaultTemplate.text_content
        }
      }));
      setTemplateHtml(defaultTemplate.html_content);
    };

    loadRecipients();
    loadDefaultTemplate();
    
    // Focus on campaign name input when component mounts
    if (campaignNameRef.current) {
      setTimeout(() => {
        campaignNameRef.current.focus();
      }, 300);
    }
  }, []);

  // Effect for handling animations when step changes
  useEffect(() => {
    if (contentRef.current) {
      setStepChanged(true);
      
      // Reset step change animation
      setTimeout(() => {
        setStepChanged(false);
      }, 500);
      
      // Scroll to top when changing steps
      window.scrollTo(0, 0);
    }
  }, [currentStep]);

  const handleCampaignDataChange = (e) => {
    const { name, value } = e.target;
    setCampaignData({
      ...campaignData,
      [name]: value
    });
  };

  const handleTemplateChange = (html) => {
    setTemplateHtml(html);
    setCampaignData({
      ...campaignData,
      template: {
        ...campaignData.template,
        html_content: html
      }
    });
  };

  const handleRecipientSelection = (recipientId) => {
    if (selectedRecipients.includes(recipientId)) {
      setSelectedRecipients(selectedRecipients.filter(id => id !== recipientId));
    } else {
      setSelectedRecipients([...selectedRecipients, recipientId]);
    }
  };

  const handleSelectAllRecipients = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map(recipient => recipient.recipient_id));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return (
          campaignData.campaign_name.trim() !== '' && 
          campaignData.subject_line.trim() !== '' &&
          campaignData.from_name.trim() !== '' &&
          campaignData.from_email.trim() !== '' &&
          campaignData.reply_to_email.trim() !== ''
        );
      case 2:
        return campaignData.template.html_content.trim() !== '';
      case 3:
        return selectedRecipients.length > 0;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      setError('Please fill in all required fields to continue.');
      
      // Shake error message
      document.querySelector('.error-message')?.classList.add('shake');
      
      // Remove shake class after animation completes
      setTimeout(() => {
        document.querySelector('.error-message')?.classList.remove('shake');
      }, 500);
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError('Please review all steps before saving.');
      return;
    }

    try {
      setLoading(true);
      setSaving(true);
      setError(null);
      
      const payload = {
        ...campaignData,
        recipients: selectedRecipients
      };
      
      const response = await CampaignService.createCampaign(payload);
      
      // Show success state
      setSuccess(true);
      
      // Navigate after a short delay to show success
      setTimeout(() => {
        navigate(`/campaigns/${response.campaign_id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create campaign. Please try again.');
      console.error(err);
      setSaving(false);
    } finally {
      setLoading(false);
    }
  };

  const getStepperItemClass = (step) => {
    if (currentStep === step) {
      return 'stepper-step active';
    } else if (currentStep > step) {
      return 'stepper-step completed';
    } else {
      return 'stepper-step';
    }
  };

  const renderStepContent = () => {
    const stepContentClass = `step-content ${stepChanged ? 'step-transition' : ''}`;
    
    switch (currentStep) {
      case 1:
        return (
          <div className={stepContentClass}>
            <div className="campaign-details-step">
              <div className="form-group">
                <label htmlFor="campaign_name">Campaign Name*</label>
                <input
                  type="text"
                  id="campaign_name"
                  name="campaign_name"
                  value={campaignData.campaign_name}
                  onChange={handleCampaignDataChange}
                  placeholder="E.g., Monthly Newsletter - May 2025"
                  ref={campaignNameRef}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject_line">Subject Line*</label>
                <input
                  type="text"
                  id="subject_line"
                  name="subject_line"
                  value={campaignData.subject_line}
                  onChange={handleCampaignDataChange}
                  placeholder="E.g., Check out our latest updates!"
                />
                <p className="field-hint">This is what recipients will see in their inbox</p>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="from_name">From Name*</label>
                  <input
                    type="text"
                    id="from_name"
                    name="from_name"
                    value={campaignData.from_name}
                    onChange={handleCampaignDataChange}
                    placeholder="E.g., John Smith"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="from_email">From Email*</label>
                  <input
                    type="email"
                    id="from_email"
                    name="from_email"
                    value={campaignData.from_email}
                    onChange={handleCampaignDataChange}
                    placeholder="E.g., john@company.com"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="reply_to_email">Reply-To Email*</label>
                <input
                  type="email"
                  id="reply_to_email"
                  name="reply_to_email"
                  value={campaignData.reply_to_email}
                  onChange={handleCampaignDataChange}
                  placeholder="E.g., support@company.com"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className={stepContentClass}>
            <div className="campaign-template-step">
              <EmailEditor
                initialHtml={templateHtml}
                onChange={handleTemplateChange}
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className={stepContentClass}>
            <div className="campaign-recipients-step">
              <div className="recipients-header">
                <div className="recipients-actions">
                  <button 
                    className="select-all-button"
                    onClick={handleSelectAllRecipients}
                  >
                    {selectedRecipients.length === recipients.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="selected-count">
                    {selectedRecipients.length} of {recipients.length} selected
                  </span>
                </div>
                
                <Link to="/recipients/create" className="add-recipient-button">
                  <span className="material-icons">person_add</span>
                  Add New Recipient
                </Link>
              </div>
              
              {recipientsLoading ? (
                <div className="recipients-loading">
                  <div className="loader"></div>
                  <p>Loading recipients...</p>
                </div>
              ) : recipients.length === 0 ? (
                <div className="no-recipients">
                  <div className="empty-state">
                    <span className="material-icons">people</span>
                    <h3>No Recipients Found</h3>
                    <p>Add recipients to send your campaign to</p>
                    <Link to="/recipients/create" className="add-first-recipient">
                      <span className="material-icons">person_add</span>
                      Add First Recipient
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="recipients-list">
                  {recipients.map((recipient) => (
                    <div 
                      key={recipient.recipient_id} 
                      className={`recipient-item ${selectedRecipients.includes(recipient.recipient_id) ? 'selected' : ''}`}
                      onClick={() => handleRecipientSelection(recipient.recipient_id)}
                    >
                      <div className="recipient-checkbox">
                        <span className="material-icons">
                          {selectedRecipients.includes(recipient.recipient_id) ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </div>
                      
                      <div className="recipient-avatar">
                        {recipient.first_name ? recipient.first_name.charAt(0).toUpperCase() : recipient.email.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="recipient-info">
                        <h4 className="recipient-name">
                          {recipient.first_name && recipient.last_name 
                            ? `${recipient.first_name} ${recipient.last_name}`
                            : recipient.email}
                        </h4>
                        <p className="recipient-email">{recipient.email}</p>
                        {recipient.company && (
                          <p className="recipient-company">{recipient.company}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className={stepContentClass}>
            <div className="campaign-review-step">
              <div className="review-section">
                <h3>Campaign Details</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Campaign Name</span>
                    <span className="review-value">{campaignData.campaign_name}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Subject Line</span>
                    <span className="review-value">{campaignData.subject_line}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">From</span>
                    <span className="review-value">{campaignData.from_name} ({campaignData.from_email})</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Reply-To</span>
                    <span className="review-value">{campaignData.reply_to_email}</span>
                  </div>
                </div>
              </div>
              
              <div className="review-section">
                <h3>Recipients</h3>
                <p className="recipients-summary">
                  This campaign will be sent to <strong>{selectedRecipients.length}</strong> recipients.
                </p>
              </div>
              
              <div className="review-section">
                <h3>Email Preview</h3>
                <div className="email-preview-container">
                  <iframe
                    srcDoc={campaignData.template.html_content}
                    title="Email Preview"
                    className="email-preview-frame"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="page-container campaign-create-container fade-in">
      <div className="campaign-create-header">
        <Link to="/campaigns" className="back-button">
          <span className="material-icons">arrow_back</span>
          Back to Campaigns
        </Link>
        <h1>Create New Campaign</h1>
      </div>
      
      {error && (
        <div className="error-message">
          <span className="material-icons">error_outline</span>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <span className="material-icons">check_circle</span>
          <p>Campaign created successfully! Redirecting...</p>
        </div>
      )}
      
      <div className="campaign-create-stepper">
        <div className={getStepperItemClass(1)}>
          <div className="step-number">
            {currentStep > 1 ? <span className="material-icons">check</span> : 1}
          </div>
          <div className="step-label">Campaign Details</div>
        </div>
        
        <div className="step-connector"></div>
        
        <div className={getStepperItemClass(2)}>
          <div className="step-number">
            {currentStep > 2 ? <span className="material-icons">check</span> : 2}
          </div>
          <div className="step-label">Design Email</div>
        </div>
        
        <div className="step-connector"></div>
        
        <div className={getStepperItemClass(3)}>
          <div className="step-number">
            {currentStep > 3 ? <span className="material-icons">check</span> : 3}
          </div>
          <div className="step-label">Choose Recipients</div>
        </div>
        
        <div className="step-connector"></div>
        
        <div className={getStepperItemClass(4)}>
          <div className="step-number">4</div>
          <div className="step-label">Review & Save</div>
        </div>
      </div>
      
      <div className="campaign-create-content" ref={contentRef}>
        {renderStepContent()}
      </div>
      
      <div className="campaign-create-actions">
        {currentStep > 1 && (
          <button 
            className="prev-button" 
            onClick={handlePrevStep}
            disabled={loading}
          >
            <span className="material-icons">arrow_back</span>
            Previous
          </button>
        )}
        
        {currentStep < 4 ? (
          <button 
            className="next-button" 
            onClick={handleNextStep}
            disabled={!validateStep(currentStep)}
          >
            Next
            <span className="material-icons">arrow_forward</span>
          </button>
        ) : (
          <button 
            className={`save-button ${saving ? 'loading' : ''}`} 
            onClick={handleSubmit}
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : 'Save Campaign'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CampaignCreate;