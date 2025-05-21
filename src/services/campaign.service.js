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
      const response = await api.post('/campaigns', campaignData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create campaign' };
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
  }
};

export default CampaignService;