// src/services/recipient.service.js
import api from './api';
import Papa from 'papaparse';

class RecipientService {
  // Get all recipients
  async getAllRecipients() {
    try {
      const response = await api.get('/recipients');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get a single recipient by ID
  async getRecipient(recipientId) {
    try {
      const response = await api.get(`/recipients/${recipientId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Create a new recipient
  async createRecipient(recipientData) {
    try {
      const response = await api.post('/recipients', recipientData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update a recipient
  async updateRecipient(recipientId, recipientData) {
    try {
      const response = await api.post(`/recipients/${recipientId}/update`, recipientData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Delete a single recipient
  async deleteRecipient(recipientId) {
    try {
      const response = await api.post(`/recipients/${recipientId}/delete`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Delete multiple recipients
  async deleteBulkRecipients(recipientIds) {
    try {
      const response = await api.post('/recipients/bulk-delete', {
        recipient_ids: recipientIds
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Create multiple recipients
  async createBulkRecipients(recipients) {
    try {
      const response = await api.post('/recipients/bulk', {
        recipients
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Parse CSV file
  parseCSV(csvContent) {
    const result = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      trimHeaders: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_')
    });

    if (result.errors.length > 0) {
      console.error('CSV parsing errors:', result.errors);
    }

    // Map the parsed data to our recipient format
    return result.data.map(row => {
      // Handle various possible column names
      const recipient = {
        email: row.email || row.email_address || '',
        first_name: row.first_name || row.firstname || row.name?.split(' ')[0] || '',
        last_name: row.last_name || row.lastname || row.name?.split(' ').slice(1).join(' ') || '',
        company: row.company || row.organization || '',
        position: row.position || row.title || row.job_title || ''
      };

      // Add any other fields as custom fields
      const customFields = {};
      Object.keys(row).forEach(key => {
        if (!['email', 'email_address', 'first_name', 'firstname', 'last_name', 'lastname', 'name', 'company', 'organization', 'position', 'title', 'job_title'].includes(key)) {
          customFields[key] = row[key];
        }
      });

      if (Object.keys(customFields).length > 0) {
        recipient.custom_fields = customFields;
      }

      return recipient;
    }).filter(recipient => recipient.email);
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

export default new RecipientService();