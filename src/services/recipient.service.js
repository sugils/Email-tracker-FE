// src/services/recipient.service.js
import api from './api';

const RecipientService = {
  getAllRecipients: async () => {
    try {
      const response = await api.get('/recipients');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch recipients' };
    }
  },

  createRecipient: async (recipientData) => {
    try {
      const response = await api.post('/recipients', recipientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create recipient' };
    }
  },

  createBulkRecipients: async (recipients) => {
    try {
      const response = await api.post('/recipients/bulk', { recipients });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create bulk recipients' };
    }
  },

  // New method to get a single recipient
  getRecipient: async (recipientId) => {
    try {
      const response = await api.get(`/recipients/${recipientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch recipient' };
    }
  },

  // New method to update a recipient
  updateRecipient: async (recipientId, recipientData) => {
    try {
      const response = await api.put(`/recipients/${recipientId}`, recipientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update recipient' };
    }
  },
  deleteRecipient: async (recipientId) => {
    try {
      const response = await api.delete(`/recipients/${recipientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete recipient' };
    }
  },

  // New method to delete multiple recipients
  deleteBulkRecipients: async (recipientIds) => {
    try {
      const response = await api.post('/recipients/bulk-delete', { recipient_ids: recipientIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete recipients' };
    }
  },

  parseCSV: (csvContent) => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const recipients = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const currentLine = lines[i].split(',').map(field => field.trim());
      const recipient = {};
      
      headers.forEach((header, index) => {
        const fieldValue = currentLine[index] || '';
        
        // Map CSV columns to recipient fields
        switch (header.toLowerCase()) {
          case 'email':
            recipient.email = fieldValue;
            break;
          case 'first name':
          case 'firstname':
            recipient.first_name = fieldValue;
            break;
          case 'last name':
          case 'lastname':
            recipient.last_name = fieldValue;
            break;
          case 'company':
            recipient.company = fieldValue;
            break;
          case 'position':
          case 'title':
            recipient.position = fieldValue;
            break;
          default:
            // Store other fields as custom fields
            if (!recipient.custom_fields) {
              recipient.custom_fields = {};
            }
            recipient.custom_fields[header] = fieldValue;
        }
      });
      
      // Only add if email is provided
      if (recipient.email) {
        recipients.push(recipient);
      }
    }
    
    return recipients;
  }
};

export default RecipientService;