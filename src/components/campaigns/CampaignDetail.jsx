// Modified src/components/campaigns/CampaignDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CampaignService from '../../services/campaign.service';
import GroupService from '../../services/group.service';
import './CampaignDetail.css';

const CampaignStatus = ({ status }) => {
  const statusColors = {
    draft: { bg: '#E0E4E8', color: '#666' },
    scheduled: { bg: '#F39C12', color: 'white' },
    sending: { bg: '#3498DB', color: 'white' },
    completed: { bg: '#2ECC71', color: 'white' },
    failed: { bg: '#E74C3C', color: 'white' }
  };

  const style = {
    backgroundColor: statusColors[status]?.bg || '#E0E4E8',
    color: statusColors[status]?.color || '#666'
  };

  return (
    <span className="campaign-status-badge" style={style}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [testSendSuccess, setTestSendSuccess] = useState(false);
  const [campaignSendSuccess, setCampaignSendSuccess] = useState(false);
  const [markingReplied, setMarkingReplied] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [groupRecipients, setGroupRecipients] = useState({});
  const [loadingGroupRecipients, setLoadingGroupRecipients] = useState(false);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const data = await CampaignService.getCampaignById(campaignId);
      setCampaign(data);
      
      // If there are groups, fetch recipients for each group
      if (data.groups && data.groups.length > 0) {
        await fetchGroupRecipients(data.groups);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch campaign details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // New function to fetch recipients for each group
  const fetchGroupRecipients = async (groups) => {
    try {
      setLoadingGroupRecipients(true);
      const groupRecipientsObj = {};
      
      // Create an array of promises for fetching recipients for each group
      const promises = groups.map(async (group) => {
        try {
          const recipients = await GroupService.getGroupRecipients(group.id);
          groupRecipientsObj[group.id] = recipients;
        } catch (err) {
          console.error(`Failed to fetch recipients for group ${group.id}:`, err);
          groupRecipientsObj[group.id] = []; // Set empty array if fetch fails
        }
      });
      
      // Wait for all promises to resolve
      await Promise.all(promises);
      
      setGroupRecipients(groupRecipientsObj);
    } catch (err) {
      console.error('Failed to fetch group recipients:', err);
    } finally {
      setLoadingGroupRecipients(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
    
    // Set page title
    document.title = 'Campaign Details | Email Campaign Manager';
    
    return () => {
      // Reset title when component unmounts
      document.title = 'Email Campaign Manager';
    };
  }, [campaignId]);

  // Add auto-refresh for completed campaigns
  useEffect(() => {
    // Skip for campaigns that aren't completed
    if (!campaign || campaign.status !== 'completed') return;
    
    // Set up an interval to refresh data every 30 seconds
    const refreshInterval = setInterval(async () => {
      try {
        const data = await CampaignService.getCampaignById(campaignId);
        setCampaign(data);
        console.log('Campaign data refreshed');
      } catch (err) {
        console.error('Error refreshing campaign data:', err);
      }
    }, 30000); // 30 seconds
    
    // Clean up the interval when component unmounts or campaign changes
    return () => clearInterval(refreshInterval);
  }, [campaign, campaignId]);

  const handleSendTest = async () => {
    try {
      setSendingTest(true);
      setTestSendSuccess(false);
      await CampaignService.sendCampaign(campaignId, true);
      setTestSendSuccess(true);
      
      // Refresh campaign data after sending test
      await fetchCampaign();
    } catch (err) {
      setError(err.message || 'Failed to send test email');
      console.error(err);
    } finally {
      setSendingTest(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setTestSendSuccess(false), 3000);
    }
  };

  const handleSendCampaign = async () => {
    try {
      setSendingCampaign(true);
      setCampaignSendSuccess(false);
      await CampaignService.sendCampaign(campaignId, false);
      setCampaignSendSuccess(true);
      
      // Refresh campaign data after sending
      await fetchCampaign();
    } catch (err) {
      setError(err.message || 'Failed to send campaign');
      console.error(err);
    } finally {
      setSendingCampaign(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setCampaignSendSuccess(false), 3000);
    }
  };

  // Function to mark an email as replied
  const handleMarkReplied = async (recipientId) => {
    try {
      setMarkingReplied(true);
      setReplySuccess(false);
      await CampaignService.markEmailReplied(campaignId, recipientId);
      setReplySuccess(true);
      
      // Refresh campaign data after marking as replied
      await fetchCampaign();
    } catch (err) {
      setError(err.message || 'Failed to mark email as replied');
      console.error(err);
    } finally {
      setMarkingReplied(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => setReplySuccess(false), 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate total recipient count including group recipients
  const getTotalRecipientCount = () => {
    let count = 0;
    
    // Count individual recipients
    if (campaign?.recipients) {
      count += campaign.recipients.length;
    }
    
    // Count recipients from groups
    if (campaign?.groups) {
      campaign.groups.forEach(group => {
        count += group.recipient_count || 0;
      });
    }
    
    return count;
  };

  // Get all recipients including those from groups
  const getAllRecipients = () => {
    const allRecipients = [];
    
    // Add individual recipients
    if (campaign?.recipients) {
      allRecipients.push(...campaign.recipients);
    }
    
    // Add recipients from groups
    if (campaign?.groups) {
      campaign.groups.forEach(group => {
        const groupId = group.id;
        if (groupRecipients[groupId]) {
          allRecipients.push(...groupRecipients[groupId]);
        }
      });
    }
    
    return allRecipients;
  };

  if (loading) {
    return (
      <div className="campaign-detail-loading">
        <div className="loader"></div>
        <p>Loading campaign details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="campaign-detail-error">
        <span className="material-icons error-icon">error_outline</span>
        <h3>Error Loading Campaign Details</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="reload-button">
          <span className="material-icons">refresh</span>
          Reload
        </button>
      </div>
    );
  }

  if (!campaign) return null;

  // Get all recipients for display
  const allRecipients = getAllRecipients();
  const totalRecipientCount = getTotalRecipientCount();

  return (
    <div className="campaign-detail-container">
      <div className="campaign-detail-header">
        <div className="header-left">
          <Link to="/campaigns" className="back-button">
            <span className="material-icons">arrow_back</span>
            Back to Campaigns
          </Link>
          <h1>{campaign.campaign_name}</h1>
          <div className="campaign-meta">
            <CampaignStatus status={campaign.status} />
            <span className="campaign-date">Created on {formatDate(campaign.created_at)}</span>
          </div>
        </div>
        
        <div className="header-actions">
          {campaign.status === 'draft' && (
            <>
              <button
                className={`test-send-button ${sendingTest ? 'loading' : ''}`}
                onClick={handleSendTest}
                disabled={sendingTest || sendingCampaign || totalRecipientCount === 0}
              >
                <span className="material-icons">science</span>
                Send Test
              </button>
              
              <button
                className={`send-campaign-button ${sendingCampaign ? 'loading' : ''}`}
                onClick={handleSendCampaign}
                disabled={sendingTest || sendingCampaign || totalRecipientCount === 0}
              >
                <span className="material-icons">send</span>
                Send Campaign
              </button>
            </>
          )}
          
          {campaign.status === 'draft' && (
            <Link to={`/campaigns/${campaignId}/edit`} className="edit-campaign-button">
              <span className="material-icons">edit</span>
              Edit
            </Link>
          )}
          
          {campaign.status === 'completed' && (
            <button 
              className="refresh-button" 
              onClick={fetchCampaign}
              title="Refresh campaign data"
            >
              <span className="material-icons">refresh</span>
              Refresh Data
            </button>
          )}
        </div>
      </div>

      {testSendSuccess && (
        <div className="success-notification">
          <span className="material-icons">check_circle</span>
          <p>Test email sent successfully!</p>
        </div>
      )}
      
      {campaignSendSuccess && (
        <div className="success-notification">
          <span className="material-icons">check_circle</span>
          <p>Campaign is now being sent!</p>
        </div>
      )}
      
      {replySuccess && (
        <div className="success-notification">
          <span className="material-icons">check_circle</span>
          <p>Email marked as replied successfully!</p>
        </div>
      )}

      <div className="campaign-detail-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="material-icons">dashboard</span>
          Overview
        </button>
        
        <button
          className={`tab-button ${activeTab === 'recipients' ? 'active' : ''}`}
          onClick={() => setActiveTab('recipients')}
        >
          <span className="material-icons">people</span>
          Recipients
          <span className="counter">{totalRecipientCount}</span>
        </button>
        
        <button
          className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <span className="material-icons">visibility</span>
          Preview
        </button>
        
        {campaign.status === 'completed' && (
          <button
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="material-icons">analytics</span>
            Analytics
          </button>
        )}
      </div>

      <div className="campaign-detail-content">
        {activeTab === 'overview' && (
          <div className="campaign-overview">
            <div className="overview-grid">
              <div className="detail-card">
                <h3>Campaign Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Subject Line</span>
                  <span className="detail-value">{campaign.subject_line}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">From Name</span>
                  <span className="detail-value">{campaign.from_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">From Email</span>
                  <span className="detail-value">{campaign.from_email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reply-To</span>
                  <span className="detail-value">{campaign.reply_to_email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className="detail-value"><CampaignStatus status={campaign.status} /></span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Recipients</span>
                  <span className="detail-value">
                    {totalRecipientCount} total
                    {campaign.groups && campaign.groups.length > 0 && (
                      <span className="group-info"> ({campaign.groups.length} groups)</span>
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created</span>
                  <span className="detail-value">{formatDate(campaign.created_at)}</span>
                </div>
                {campaign.scheduled_at && (
                  <div className="detail-row">
                    <span className="detail-label">Scheduled For</span>
                    <span className="detail-value">{formatDate(campaign.scheduled_at)}</span>
                  </div>
                )}
                {campaign.sent_at && (
                  <div className="detail-row">
                    <span className="detail-label">Sent On</span>
                    <span className="detail-value">{formatDate(campaign.sent_at)}</span>
                  </div>
                )}
              </div>
              
              {campaign.groups && campaign.groups.length > 0 && (
                <div className="detail-card">
                  <h3>Groups</h3>
                  <div className="groups-list">
                    {campaign.groups.map((group) => (
                      <div key={group.id} className="group-item-detail">
                        <span className="material-icons">folder</span>
                        <div className="group-info">
                          <span className="group-name">{group.name}</span>
                          <span className="group-count">{group.recipient_count || 0} recipients</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {campaign.status === 'completed' && campaign.tracking_stats && (
                <div className="stats-card">
                  <h3>Performance Metrics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-icon sent-icon">
                        <span className="material-icons">email</span>
                      </div>
                      <div className="stat-content">
                        <span className="stat-value">{campaign.tracking_stats.overall.sent_count}</span>
                        <span className="stat-label">Sent</span>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon opened-icon">
                        <span className="material-icons">visibility</span>
                      </div>
                      <div className="stat-content">
                        <span className="stat-value">{campaign.tracking_stats.overall.opened_count}</span>
                        <span className="stat-label">Opened</span>
                        <span className="stat-rate">{campaign.tracking_stats.overall.open_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon clicked-icon">
                        <span className="material-icons">touch_app</span>
                      </div>
                      <div className="stat-content">
                        <span className="stat-value">{campaign.tracking_stats.overall.clicked_count}</span>
                        <span className="stat-label">Clicked</span>
                        <span className="stat-rate">{campaign.tracking_stats.overall.click_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon replied-icon">
                        <span className="material-icons">reply</span>
                      </div>
                      <div className="stat-content">
                        <span className="stat-value">{campaign.tracking_stats.overall.replied_count}</span>
                        <span className="stat-label">Replied</span>
                        <span className="stat-rate">{campaign.tracking_stats.overall.reply_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'recipients' && (
          <div className="campaign-recipients">
            <div className="recipients-header">
              <h3>Recipients</h3>
              {campaign.status === 'draft' && (
                <Link to={`/campaigns/${campaignId}/recipients`} className="add-recipients-button">
                  <span className="material-icons">person_add</span>
                  Add Recipients
                </Link>
              )}
            </div>
            
            {(allRecipients && allRecipients.length > 0) ? (
              <div className="recipients-table">
                <div className="recipients-table-header">
                  <div className="recipient-name-col">Name</div>
                  <div className="recipient-email-col">Email</div>
                  <div className="recipient-company-col">Company</div>
                  <div className="recipient-position-col">Position</div>
                  <div className="recipient-group-col">Group</div>
                  {campaign.status === 'completed' && (
                    <>
                      <div className="recipient-opened-col">Opened</div>
                      <div className="recipient-clicked-col">Clicked</div>
                      <div className="recipient-replied-col">Replied</div>
                    </>
                  )}
                </div>
                
                <div className="recipients-table-body">
                  {allRecipients.map((recipient) => {
                    // Find tracking data for this recipient if campaign is completed
                    let trackingData = null;
                    if (campaign.status === 'completed' && campaign.tracking_stats) {
                      trackingData = campaign.tracking_stats.recipients.find(
                        t => t.recipient_id === recipient.recipient_id
                      );
                    }
                    
                    // Find the group this recipient belongs to
                    let groupName = recipient.group_name || '';
                    if (!groupName && campaign.groups) {
                      for (const groupId in groupRecipients) {
                        if (groupRecipients[groupId].some(r => r.recipient_id === recipient.recipient_id)) {
                          const group = campaign.groups.find(g => g.id === groupId);
                          if (group) {
                            groupName = group.name;
                            break;
                          }
                        }
                      }
                    }
                    
                    return (
                      <div key={recipient.recipient_id} className="recipient-row">
                        <div className="recipient-name-col">
                          {recipient.first_name && recipient.last_name 
                            ? `${recipient.first_name} ${recipient.last_name}`
                            : '–'}
                        </div>
                        <div className="recipient-email-col">{recipient.email}</div>
                        <div className="recipient-company-col">
                          {recipient.company || '–'}
                        </div>
                        <div className="recipient-position-col">
                          {recipient.position || '–'}
                        </div>
                        <div className="recipient-group-col">
                          {groupName || '–'}
                        </div>
                        
                        {campaign.status === 'completed' && (
                          <>
                            <div className="recipient-opened-col">
                              {trackingData && trackingData.opened_at ? (
                                <span className="status-indicator opened">
                                  <span className="material-icons">check_circle</span>
                                </span>
                              ) : (
                                <span className="status-indicator not-opened">
                                  <span className="material-icons">remove_circle_outline</span>
                                </span>
                              )}
                            </div>
                            <div className="recipient-clicked-col">
                              {trackingData && trackingData.clicked_at ? (
                                <span className="status-indicator clicked">
                                  <span className="material-icons">check_circle</span>
                                </span>
                              ) : (
                                <span className="status-indicator not-clicked">
                                  <span className="material-icons">remove_circle_outline</span>
                                </span>
                              )}
                            </div>
                            <div className="recipient-replied-col">
                              {trackingData && trackingData.replied_at ? (
                                <span className="status-indicator replied">
                                  <span className="material-icons">check_circle</span>
                                </span>
                              ) : (
                                <>
                                  <span className="status-indicator not-replied">
                                    <span className="material-icons">remove_circle_outline</span>
                                  </span>
                                  <button 
                                    className="mark-replied-button"
                                    onClick={() => handleMarkReplied(recipient.recipient_id)}
                                    disabled={markingReplied}
                                    title="Mark as replied"
                                  >
                                    <span className="material-icons">reply</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="no-recipients">
                <div className="empty-state">
                  <span className="material-icons">people</span>
                  <h3>No Recipients Added</h3>
                  <p>Add recipients to send this campaign to</p>
                  {campaign.status === 'draft' && (
                    <Link to={`/campaigns/${campaignId}/recipients`} className="add-recipients-btn">
                      <span className="material-icons">person_add</span>
                      Add Recipients
                    </Link>
                  )}
                </div>
              </div>
            )}
            
            {/* Loading indicator for group recipients */}
            {loadingGroupRecipients && (
              <div className="loading-indicator">
                <div className="loader-small"></div>
                <p>Loading group recipients...</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'preview' && (
          <div className="campaign-preview">
            <div className="preview-header">
              <h3>Email Preview</h3>
              <div className="preview-meta">
                <div className="preview-subject">
                  <span className="meta-label">Subject:</span>
                  <span className="meta-value">{campaign.subject_line}</span>
                </div>
                <div className="preview-from">
                  <span className="meta-label">From:</span>
                  <span className="meta-value">{campaign.from_name} &lt;{campaign.from_email}&gt;</span>
                </div>
              </div>
            </div>
            
            {campaign.template ? (
              <div className="preview-content">
                <iframe
                  srcDoc={campaign.template.html_content}
                  title="Email Preview"
                  className="preview-frame"
                  sandbox="allow-same-origin allow-scripts"
                ></iframe>
              </div>
            ) : (
              <div className="no-template">
                <div className="empty-state">
                  <span className="material-icons">description</span>
                  <h3>No Template Added</h3>
                  <p>Add a template to preview the email content</p>
                  {campaign.status === 'draft' && (
                    <Link to={`/campaigns/${campaignId}/template`} className="add-template-btn">
                      <span className="material-icons">add</span> 
                      Add Template
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'analytics' && campaign.status === 'completed' && (
          <div className="campaign-analytics">
            <div className="analytics-header">
              <h3>Campaign Performance</h3>
              <button className="export-button">
                <span className="material-icons">download</span>
                Export Report
              </button>
            </div>
            
            <div className="performance-cards">
              <div className="performance-card">
                <div className="card-header">
                  <h4>Delivery Rate</h4>
                  <span className="material-icons" title="Percentage of emails successfully delivered">info_outline</span>
                </div>
                <div className="card-content">
                  <div className="metric-circle delivery">
                    <span className="metric-value">100%</span>
                  </div>
                  <div className="metric-details">
                    <div className="metric-item">
                      <span className="item-label">Sent</span>
                      <span className="item-value">{campaign.tracking_stats.overall.sent_count}</span>
                    </div>
                    <div className="metric-item">
                      <span className="item-label">Bounced</span>
                      <span className="item-value">0</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="performance-card">
                <div className="card-header">
                  <h4>Open Rate</h4>
                  <span className="material-icons" title="Percentage of recipients who opened the email">info_outline</span>
                </div>
                <div className="card-content">
                  <div className="metric-circle open-rate">
                    <span className="metric-value">{campaign.tracking_stats.overall.open_rate.toFixed(1)}%</span>
                  </div>
                  <div className="metric-details">
                    <div className="metric-item">
                      <span className="item-label">Opened</span>
                      <span className="item-value">{campaign.tracking_stats.overall.opened_count}</span>
                    </div>
                    <div className="metric-item">
                      <span className="item-label">Total Sent</span>
                      <span className="item-value">{campaign.tracking_stats.overall.sent_count}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="performance-card">
                <div className="card-header">
                  <h4>Click Rate</h4>
                  <span className="material-icons" title="Percentage of recipients who clicked a link in the email">info_outline</span>
                </div>
                <div className="card-content">
                  <div className="metric-circle click-rate">
                    <span className="metric-value">{campaign.tracking_stats.overall.click_rate.toFixed(1)}%</span>
                  </div>
                  <div className="metric-details">
                    <div className="metric-item">
                      <span className="item-label">Clicked</span>
                      <span className="item-value">{campaign.tracking_stats.overall.clicked_count}</span>
                    </div>
                    <div className="metric-item">
                      <span className="item-label">Total Sent</span>
                      <span className="item-value">{campaign.tracking_stats.overall.sent_count}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="performance-card">
                <div className="card-header">
                  <h4>Reply Rate</h4>
                  <span className="material-icons" title="Percentage of recipients who replied to the email">info_outline</span>
                </div>
                <div className="card-content">
                  <div className="metric-circle reply-rate">
                    <span className="metric-value">{campaign.tracking_stats.overall.reply_rate.toFixed(1)}%</span>
                  </div>
                  <div className="metric-details">
                    <div className="metric-item">
                      <span className="item-label">Replied</span>
                      <span className="item-value">{campaign.tracking_stats.overall.replied_count}</span>
                    </div>
                    <div className="metric-item">
                      <span className="item-label">Total Sent</span>
                      <span className="item-value">{campaign.tracking_stats.overall.sent_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="engagement-timeline">
              <h3>Engagement Timeline</h3>
              <div className="timeline-content">
                <div className="timeline-chart">
                  <div className="chart-placeholder">
                    <span className="material-icons">timeline</span>
                    <p>Timeline chart visualization would go here</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="recipient-tracking">
              <h3>Recipient Engagement</h3>
              <div className="recipient-tracking-table">
                <div className="tracking-table-header">
                  <div className="recipient-col">Recipient</div>
                  <div className="email-col">Email</div>
                  <div className="sent-col">Sent</div>
                  <div className="opened-col">Opened</div>
                  <div className="clicked-col">Clicked</div>
                  <div className="replied-col">Replied</div>
                  <div className="actions-col">Actions</div>
                </div>
                
                <div className="tracking-table-body">
                  {campaign.tracking_stats.recipients.map((tracking) => (
                    <div key={tracking.tracking_id} className="tracking-row">
                      <div className="recipient-col">
                        {tracking.first_name && tracking.last_name 
                          ? `${tracking.first_name} ${tracking.last_name}`
                          : '–'}
                      </div>
                      <div className="email-col">{tracking.email}</div>
                      <div className="sent-col">
                        {tracking.sent_at ? (
                          <span className="status-time">
                            <span className="material-icons status-icon sent">check_circle</span>
                            {new Date(tracking.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="status-pending">Pending</span>
                        )}
                      </div>
                      <div className="opened-col">
                        {tracking.opened_at ? (
                          <span className="status-time">
                            <span className="material-icons status-icon opened">check_circle</span>
                            {new Date(tracking.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="status-negative">
                            <span className="material-icons">remove_circle_outline</span>
                          </span>
                        )}
                      </div>
                      <div className="clicked-col">
                        {tracking.clicked_at ? (
                          <span className="status-time">
                            <span className="material-icons status-icon clicked">check_circle</span>
                            {new Date(tracking.clicked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="status-negative">
                            <span className="material-icons">remove_circle_outline</span>
                          </span>
                        )}
                      </div>
                      <div className="replied-col">
                        {tracking.replied_at ? (
                          <span className="status-time">
                            <span className="material-icons status-icon replied">check_circle</span>
                            {new Date(tracking.replied_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="status-negative">
                            <span className="material-icons">remove_circle_outline</span>
                          </span>
                        )}
                      </div>
                      <div className="actions-col">
                        {!tracking.replied_at && (
                          <button 
                            className="mark-replied-button"
                            onClick={() => handleMarkReplied(tracking.recipient_id)}
                            disabled={markingReplied}
                          >
                            <span className="material-icons">reply</span>
                            Mark Replied
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetail;