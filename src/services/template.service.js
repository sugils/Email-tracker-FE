// src/services/template.service.js
import api from './api';

const TemplateService = {
  getAllTemplates: async () => {
    try {
      const response = await api.get('/templates');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch templates' };
    }
  },

  getDefaultTemplate: () => {
    return {
      template_name: 'Basic Template',
      html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background-color: #4A90E2; 
      color: white; 
      padding: 20px; 
      text-align: center; 
    }
    .content { 
      padding: 20px; 
      background-color: #fff; 
    }
    .footer { 
      text-align: center; 
      padding: 20px; 
      font-size: 12px; 
      color: #888; 
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin: 20px 0;
      background-color: #4A90E2;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Company Name</h1>
    </div>
    <div class="content">
      <h2>Hello {{first_name}},</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <a href="https://example.com" class="button">Call to Action</a>
      <p>Best regards,<br>Your Name<br>Your Position</p>
    </div>
    <div class="footer">
      <p>© 2025 Your Company. All rights reserved.</p>
      <p>Your Address, City, Country</p>
    </div>
  </div>
</body>
</html>`,
      text_content: `Hello {{first_name}},

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Visit our website: https://example.com

Best regards,
Your Name
Your Position

© 2025 Your Company. All rights reserved.
Your Address, City, Country`
    };
  }
};

export default TemplateService;