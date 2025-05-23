// src/services/group.service.js
import api from './api';

class GroupService {
  // Get all groups
  async getAllGroups() {
    try {
      const response = await api.get('/groups');
      // Ensure each group has recipient_count
      return response.data.map(group => ({
        ...group,
        recipient_count: group.recipient_count || group.recipients_count || 0
      }));
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get a single group by ID
  async getGroup(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}`);
      return {
        ...response.data,
        recipient_count: response.data.recipient_count || response.data.recipients_count || 0
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Create a new group
  async createGroup(groupData) {
    try {
      const response = await api.post('/groups', groupData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update a group
  async updateGroup(groupId, groupData) {
    try {
      const response = await api.post(`/groups/${groupId}/update`, groupData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Delete a group
  async deleteGroup(groupId) {
    try {
      const response = await api.post(`/groups/${groupId}/delete`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Add recipients to a group
  async addRecipientsToGroup(groupId, recipientIds) {
    try {
      const response = await api.post(`/groups/${groupId}/recipients`, {
        recipientIds
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Remove recipients from a group
  async removeRecipientsFromGroup(groupId, recipientIds) {
    try {
      const response = await api.post(`/groups/${groupId}/recipients/remove`, {
        recipientIds
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get recipients in a group
  async getGroupRecipients(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}/recipients`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get group statistics
  async getGroupStats(groupId) {
    try {
      const response = await api.get(`/groups/${groupId}/stats`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
}

export default new GroupService();