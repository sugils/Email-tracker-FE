// src/services/campaign.service.js
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
      // Add groups support to the campaign data
      const payload = {
        ...campaignData,
        recipients: campaignData.recipients || [],
        groups: campaignData.groups || []
      };
      const response = await api.post('/campaigns', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create campaign' };
    }
  },

  updateCampaign: async (campaignId, campaignData) => {
    try {
      const payload = {
        ...campaignData,
        recipients: campaignData.recipients || [],
        groups: campaignData.groups || []
      };
      const response = await api.put(`/campaigns/${campaignId}`, payload);
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

  // New methods for group support
  duplicateCampaign: async (campaignId) => {
    try {
      const response = await api.post(`/campaigns/${campaignId}/duplicate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to duplicate campaign' };
    }
  },

  markEmailReplied: async (campaignId, recipientId) => {
    try {
      const response = await api.post(`/campaigns/${campaignId}/recipients/${recipientId}/replied`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark email as replied' };
    }
  },

  getCampaignStats: async (campaignId) => {
    try {
      const response = await api.get(`/campaigns/${campaignId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch campaign stats' };
    }
  }
};

export default CampaignService;