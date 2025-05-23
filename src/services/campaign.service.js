// Enhanced src/services/campaign.service.js
import api from './api';

const CampaignService = {
  getAllCampaigns: async () => {
    try {
      const response = await api.get('/campaigns');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch campaigns' };
    }
  },

  getCampaignById: async (campaignId) => {
    try {
      const response = await api.get(`/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch campaign' };
    }
  },

  createCampaign: async (campaignData) => {
    try {
      // Process groups and recipients for proper format
      const processedData = {
        ...campaignData,
        recipients: campaignData.recipients || [],
        groups: Array.isArray(campaignData.groups) 
          ? campaignData.groups 
          : (campaignData.groups ? [campaignData.groups] : [])
      };
      
      // If groups are provided as IDs, convert to proper format
      if (processedData.groups.length > 0 && typeof processedData.groups[0] !== 'object') {
        processedData.groups = processedData.groups.map(id => ({ id }));
      }
      
      // Make API request with correctly formatted data
      const response = await api.post('/campaigns', processedData);
      return response.data;
    } catch (error) {
      console.error('Error in createCampaign:', error);
      throw error.response?.data || { message: 'Failed to create campaign' };
    }
  },

  updateCampaign: async (campaignId, campaignData) => {
    try {
      // Process groups and recipients for proper format
      const processedData = {
        ...campaignData,
        recipients: campaignData.recipients || [],
        groups: Array.isArray(campaignData.groups) 
          ? campaignData.groups 
          : (campaignData.groups ? [campaignData.groups] : [])
      };
      
      // If groups are provided as IDs, convert to proper format
      if (processedData.groups.length > 0 && typeof processedData.groups[0] !== 'object') {
        processedData.groups = processedData.groups.map(id => ({ id }));
      }
      
      const response = await api.put(`/campaigns/${campaignId}`, processedData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update campaign' };
    }
  },

  sendCampaign: async (campaignId, testMode = false) => {
    try {
      const response = await api.post(`/campaigns/${campaignId}/send`, { test_mode: testMode });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send campaign' };
    }
  },

  getDashboardData: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard data' };
    }
  },

  // Enhanced method for duplicating campaign
  duplicateCampaign: async (campaignId) => {
    try {
      const response = await api.post(`/campaigns/${campaignId}/duplicate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to duplicate campaign' };
    }
  },

  // Mark email as replied
  markEmailReplied: async (campaignId, recipientId) => {
    try {
      const response = await api.post(`/campaigns/${campaignId}/recipients/${recipientId}/replied`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark email as replied' };
    }
  },

  // Get campaign statistics
  getCampaignStats: async (campaignId) => {
    try {
      const response = await api.get(`/campaigns/${campaignId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch campaign stats' };
    }
  },
  
  // Add recipients to a campaign
  addRecipientsToCampaign: async (campaignId, data) => {
    try {
      const payload = {
        recipients: data.recipients || [],
        groups: data.groups || []
      };
      
      const response = await api.post(`/campaigns/${campaignId}/recipients`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add recipients to campaign' };
    }
  },
  
  // Remove recipients from a campaign
  removeRecipientsFromCampaign: async (campaignId, data) => {
    try {
      const payload = {
        recipient_ids: data.recipientIds || [],
        group_ids: data.groupIds || []
      };
      
      const response = await api.post(`/campaigns/${campaignId}/recipients/remove`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove recipients from campaign' };
    }
  }
};

export default CampaignService;