// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CampaignService from '../../services/campaign.service';
import LineChart from './LineChart';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMetric, setActiveMetric] = useState('open'); // For interactive metrics

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await CampaignService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <span className="material-icons error-icon">error_outline</span>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="reload-button">
          <span className="material-icons">refresh</span>
          Reload
        </button>
      </div>
    );
  }

  // Early return if data is not yet available
  if (!dashboardData) return null;

  const { counts, overall_stats, campaign_stats, recent_campaigns, recent_recipients } = dashboardData;

  // Prepare chart data
  const chartData = campaign_stats.map(campaign => ({
    name: campaign.campaign_name,
    sent: campaign.sent_count,
    opened: campaign.opened_count,
    clicked: campaign.clicked_count,
    replied: campaign.replied_count,
  })).slice(0, 10); // Limit to 10 for better visualization

  // Prepare data for individual metric charts
  const openRateData = campaign_stats.map(campaign => ({
    name: campaign.campaign_name,
    value: campaign.open_rate,
  })).slice(0, 8).sort((a, b) => b.value - a.value);

  const clickRateData = campaign_stats.map(campaign => ({
    name: campaign.campaign_name,
    value: campaign.click_rate,
  })).slice(0, 8).sort((a, b) => b.value - a.value);

  const replyRateData = campaign_stats.map(campaign => ({
    name: campaign.campaign_name,
    value: campaign.reply_rate,
  })).slice(0, 8).sort((a, b) => b.value - a.value);

  const handleMetricClick = (metric) => {
    setActiveMetric(metric);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/campaigns/create" className="create-campaign-btn">
          <span className="material-icons">add</span>
          New Campaign
        </Link>
      </div>

      {/* Top Stats Row - Single line */}
      <div className="top-stats-row">
        <div className="top-stat-card">
          <div className="stat-icon campaigns">
            <span className="material-icons">campaign</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">{counts.campaigns}</div>
            <div className="stat-label">Campaigns</div>
          </div>
          <Link to="/campaigns" className="stat-arrow">
            <span className="material-icons">arrow_forward</span>
          </Link>
        </div>
        
        <div className="top-stat-card">
          <div className="stat-icon recipients">
            <span className="material-icons">people</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">{counts.recipients}</div>
            <div className="stat-label">Recipients</div>
          </div>
          <Link to="/recipients" className="stat-arrow">
            <span className="material-icons">arrow_forward</span>
          </Link>
        </div>
        
        <div className="top-stat-card">
          <div className="stat-icon emails">
            <span className="material-icons">email</span>
          </div>
          <div className="stat-content">
            <div className="stat-value">{counts.emails_sent}</div>
            <div className="stat-label">Emails Sent</div>
          </div>
        </div>
      </div>

      {/* Email Metrics Row - Detailed metrics with industry comparison */}
      <div className="metrics-row">
        <div className="metric-card detailed">
          <div className="metric-header">
            <div className="metric-icon-container">
              <span className="metric-icon open">
                <span className="material-icons">visibility</span>
              </span>
              <span className="metric-title">Open Rate</span>
            </div>
            <div className="metric-value">{overall_stats.open_rate.toFixed(2)}%</div>
          </div>
          <div className="metric-content">
            <div className="metric-details">
              {overall_stats.total_opened} opened of {overall_stats.total_sent} sent
            </div>
            <div className="metric-best-campaign">
              <span className="best-campaign-label">Best performing campaign:</span>
              <span className="best-campaign-value">
                {campaign_stats.length > 0 ? campaign_stats.sort((a, b) => b.open_rate - a.open_rate)[0].campaign_name : 'N/A'}
              </span>
            </div>
            <div className="metric-industry">
              <span className="industry-label">Industry avg: 21.33%</span>
              <span className="comparison-value positive">+{(overall_stats.open_rate - 21.33).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="metric-card detailed">
          <div className="metric-header">
            <div className="metric-icon-container">
              <span className="metric-icon click">
                <span className="material-icons">touch_app</span>
              </span>
              <span className="metric-title">Click Rate</span>
            </div>
            <div className="metric-value">{overall_stats.click_rate.toFixed(2)}%</div>
          </div>
          <div className="metric-content">
            <div className="metric-details">
              {overall_stats.total_clicked} clicked of {overall_stats.total_sent} sent
            </div>
            <div className="metric-best-campaign">
              <span className="best-campaign-label">Best performing campaign:</span>
              <span className="best-campaign-value">
                {campaign_stats.length > 0 ? campaign_stats.sort((a, b) => b.click_rate - a.click_rate)[0].campaign_name : 'N/A'}
              </span>
            </div>
            <div className="metric-industry">
              <span className="industry-label">Industry avg: 2.62%</span>
              <span className="comparison-value positive">+{(overall_stats.click_rate - 2.62).toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="metric-card detailed">
          <div className="metric-header">
            <div className="metric-icon-container">
              <span className="metric-icon reply">
                <span className="material-icons">reply</span>
              </span>
              <span className="metric-title">Reply Rate</span>
            </div>
            <div className="metric-value">{overall_stats.reply_rate.toFixed(2)}%</div>
          </div>
          <div className="metric-content">
            <div className="metric-details">
              {overall_stats.total_replied} replied of {overall_stats.total_sent} sent
            </div>
            <div className="metric-best-campaign">
              <span className="best-campaign-label">Best performing campaign:</span>
              <span className="best-campaign-value">
                {campaign_stats.length > 0 ? campaign_stats.sort((a, b) => b.reply_rate - a.reply_rate)[0].campaign_name : 'N/A'}
              </span>
            </div>
            <div className="metric-industry">
              <span className="industry-label">Industry avg: 1.56%</span>
              <span className="comparison-value positive">+{(overall_stats.reply_rate - 1.56).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance Chart */}
      <div className="chart-section">
        <div className="chart-header">
          <h2>Campaign Performance</h2>
          <div className="chart-actions">
            <button className="chart-action-btn">
              <span className="material-icons">refresh</span>
            </button>
          </div>
        </div>
        <div className="chart-container">
          <LineChart data={chartData} />
        </div>
      </div>

      {/* Recent Section - Enhanced version with only real data */}
      <div className="recent-sections-container">
        <div className="recent-section-card">
          <div className="recent-header">
            <h2>Recent Campaigns</h2>
            <Link to="/campaigns" className="see-all-btn">
              See All
            </Link>
          </div>
          <div className="campaigns-list">
            {recent_campaigns.length > 0 ? (
              recent_campaigns.map((campaign) => (
                <Link to={`/campaigns/${campaign.campaign_id}`} key={campaign.campaign_id} className="campaign-item">
                  <div className="campaign-content">
                    <h3 className="campaign-name">{campaign.campaign_name}</h3>
                    <div className="campaign-meta">
                      <span className={`campaign-status status-${campaign.status}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                      <span className="campaign-date">
                        <span className="material-icons">calendar_today</span>
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <span className="material-icons empty-icon">campaign</span>
                <p>No campaigns yet</p>
                <Link to="/campaigns/create" className="create-button">Create Campaign</Link>
              </div>
            )}
          </div>
        </div>

        <div className="recent-section-card">
          <div className="recent-header">
            <h2>Recent Recipients</h2>
            <Link to="/recipients" className="see-all-btn">
              See All
            </Link>
          </div>
          <div className="recipients-list">
            {recent_recipients.length > 0 ? (
              recent_recipients.map((recipient) => (
                <div key={recipient.recipient_id} className="recipient-item">
                  <div className="recipient-avatar">
                    {recipient.first_name ? recipient.first_name.charAt(0).toUpperCase() : 
                      recipient.email ? recipient.email.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="recipient-content">
                    <div className="recipient-info">
                      <h3 className="recipient-name">
                        {recipient.first_name && recipient.last_name 
                          ? `${recipient.first_name} ${recipient.last_name}`
                          : recipient.email}
                      </h3>
                      <span className="recipient-email">{recipient.email}</span>
                    </div>
                    <div className="recipient-details">
                      {recipient.company && (
                        <div className="detail-tag company-tag">
                          <span className="material-icons">business</span>
                          {recipient.company}
                        </div>
                      )}
                      {recipient.position && (
                        <div className="detail-tag position-tag">
                          <span className="material-icons">work</span>
                          {recipient.position}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="material-icons empty-icon">people</span>
                <p>No recipients yet</p>
                <Link to="/recipients/create" className="create-button">Add Recipient</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;