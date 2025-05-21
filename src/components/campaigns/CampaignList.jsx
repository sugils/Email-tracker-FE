// Enhanced src/components/campaigns/CampaignList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CampaignService from '../../services/campaign.service';
import './CampaignList.css';

const CampaignStatus = ({ status }) => {
  return (
    <span className={`status-badge ${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [notification, setNotification] = useState(null);
  const [animateItems, setAnimateItems] = useState(false);

  // Refs for animation
  const tableRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await CampaignService.getAllCampaigns();
        setCampaigns(data);
        
        // Trigger animations after data is loaded
        setTimeout(() => {
          setAnimateItems(true);
        }, 100);
        
      } catch (err) {
        setError(err.message || 'Failed to fetch campaigns');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
    
    // Focus search input on component mount for better UX
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort direction if same field is clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sortCampaigns = (campaignsToSort) => {
    return [...campaignsToSort].sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      // Special handling for recipient_count which is a number
      if (sortBy === 'recipient_count') {
        valueA = parseInt(valueA) || 0;
        valueB = parseInt(valueB) || 0;
      }
      
      // Special handling for dates
      if (sortBy === 'created_at' || sortBy === 'sent_at') {
        valueA = new Date(valueA || '1970-01-01').getTime();
        valueB = new Date(valueB || '1970-01-01').getTime();
      }

      // Sort comparison
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject_line.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort the filtered campaigns
  const sortedAndFilteredCampaigns = sortCampaigns(filteredCampaigns);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getOpenRate = (campaign) => {
    if (campaign.stats && campaign.stats.sent_count > 0) {
      return `${campaign.stats.open_rate.toFixed(1)}%`;
    }
    return 'N/A';
  };

  const getClickRate = (campaign) => {
    if (campaign.stats && campaign.stats.sent_count > 0) {
      return `${campaign.stats.click_rate.toFixed(1)}%`;
    }
    return 'N/A';
  };

  const handleDuplicateCampaign = async (campaignId, campaignName) => {
    try {
      setLoading(true);
      const response = await CampaignService.duplicateCampaign(campaignId);
      
      if (response && response.campaign_id) {
        // Add the new campaign to state
        const updatedCampaigns = [...campaigns, response];
        setCampaigns(updatedCampaigns);
        
        // Show success notification
        setNotification({
          type: 'success',
          message: `Campaign "${campaignName}" duplicated successfully!`
        });
        
        // Auto-dismiss notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to duplicate campaign: ${err.message || 'Unknown error'}`
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="page-container campaigns-container fade-in">
        <div className="page-header">
          <h1>Email Campaigns</h1>
        </div>
        
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  if (error && campaigns.length === 0) {
    return (
      <div className="page-container campaigns-container fade-in">
        <div className="page-header">
          <h1>Email Campaigns</h1>
        </div>
        
        <div className="error-container">
          <span className="material-icons error-icon">error_outline</span>
          <h3>Error Loading Campaigns</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            <span className="material-icons">refresh</span>
            Reload
          </button>
        </div>
      </div>
    );
  }

  const getSortIndicator = (field) => {
    if (sortBy !== field) return null;
    
    return (
      <span className="sort-indicator">
        <span className="material-icons">
          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
        </span>
      </span>
    );
  };

  return (
    <div className="page-container campaigns-container fade-in">
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <span className="material-icons">
            {notification.type === 'success' ? 'check_circle' : 'error_outline'}
          </span>
          <p>{notification.message}</p>
        </div>
      )}
      
      <div className="page-header">
        <h1>Email Campaigns</h1>
        <Link to="/campaigns/create" className="btn btn-primary create-campaign-button">
          <span className="material-icons">add</span>
          New Campaign
        </Link>
      </div>

      <div className="card filters-card">
        <div className="card-body">
          <div className="campaigns-filters">
            <div className="search-box">
              <span className="material-icons search-icon">search</span>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={handleSearchChange}
                ref={searchInputRef}
                className="search-input"
              />
            </div>

            <div className="status-filter">
              <div className="input-with-icon">
                <span className="material-icons">filter_list</span>
                <select value={statusFilter} onChange={handleStatusFilterChange} className="filter-select">
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sending">Sending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className={`empty-state-container ${animateItems ? 'fade-in' : ''}`}>
          <div className="empty-state">
            <span className="material-icons empty-icon">email</span>
            <h2>No campaigns yet</h2>
            <p>Create your first campaign to start reaching your audience</p>
            <Link to="/campaigns/create" className="btn btn-primary create-first-campaign">
              <span className="material-icons">add</span>
              Create Campaign
            </Link>
          </div>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className={`no-results-container ${animateItems ? 'fade-in' : ''}`}>
          <div className="no-results">
            <span className="material-icons">search_off</span>
            <h3>No matching campaigns found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button onClick={() => {setSearchTerm(''); setStatusFilter('all');}} className="btn btn-secondary clear-filters-btn">
              <span className="material-icons">clear</span>
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="table-container" ref={tableRef}>
          <table className="campaigns-table">
            <thead>
              <tr className="table-header">
                <th className="campaign-name-col sortable" onClick={() => handleSort('campaign_name')}>
                  Campaign {getSortIndicator('campaign_name')}
                </th>
                <th className="recipients-col sortable" onClick={() => handleSort('recipient_count')}>
                  Recipients {getSortIndicator('recipient_count')}
                </th>
                <th className="status-col">Status</th>
                <th className="created-col sortable" onClick={() => handleSort('created_at')}>
                  Created {getSortIndicator('created_at')}
                </th>
                <th className="open-rate-col">Open Rate</th>
                <th className="click-rate-col">Click Rate</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredCampaigns.map((campaign, index) => (
                <tr 
                  key={campaign.campaign_id} 
                  className={`table-row ${animateItems ? 'slide-in' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="campaign-name-col">
                    <Link to={`/campaigns/${campaign.campaign_id}`} className="campaign-name-link">
                      <div className="campaign-name">{campaign.campaign_name}</div>
                      <div className="campaign-subject">{campaign.subject_line}</div>
                    </Link>
                  </td>
                  
                  <td className="recipients-col">
                    <div className="recipient-count">
                      <span className="material-icons">people</span>
                      {campaign.recipient_count}
                    </div>
                  </td>
                  
                  <td className="status-col">
                    <CampaignStatus status={campaign.status} />
                  </td>
                  
                  <td className="created-col">
                    {formatDate(campaign.created_at)}
                  </td>
                  
                  <td className="open-rate-col">
                    {getOpenRate(campaign)}
                  </td>
                  
                  <td className="click-rate-col">
                    {getClickRate(campaign)}
                  </td>
                  
                  <td className="actions-col">
                    <div className="campaign-actions">
                      <Link to={`/campaigns/${campaign.campaign_id}`} className="action-button view-button" title="View campaign">
                        <span className="material-icons">visibility</span>
                      </Link>
                      
                      {campaign.status === 'draft' && (
                        <>
                          <Link to={`/campaigns/${campaign.campaign_id}/edit`} className="action-button edit-button" title="Edit campaign">
                            <span className="material-icons">edit</span>
                          </Link>
                          
                          <Link to={`/campaigns/${campaign.campaign_id}/send`} className="action-button send-button" title="Send campaign">
                            <span className="material-icons">send</span>
                          </Link>
                        </>
                      )}
                      
                      <button 
                        className="action-button duplicate-button" 
                        title="Duplicate campaign"
                        onClick={() => handleDuplicateCampaign(campaign.campaign_id, campaign.campaign_name)}
                      >
                        <span className="material-icons">content_copy</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignList;