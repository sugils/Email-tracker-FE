import React, { useState, useEffect, useRef } from 'react';
import { campaignService, recipientService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Users, Check, X, ChevronRight, ChevronDown, ChevronLeft, Edit, RefreshCw, Calendar, Clock, Settings, HelpCircle, Image, Link, Bold, Italic, AlignLeft, AlignCenter, AlignRight, List, Eye, Search, Filter, Download } from 'lucide-react';

const CampaignCreator = () => {
  // Campaign data state
  const [campaign, setCampaign] = useState({
    campaign_name: '',
    subject_line: '',
    from_name: '',
    from_email: '',
    reply_to_email: '',
    template: {
      name: 'Default Template',
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello {{first_name}},</h2>
          <p>This is a sample email template. Please customize it for your campaign.</p>
          <p>Best regards,<br>Your Name</p>
        </div>
      `,
      text_content: 'Hello {{first_name}}, This is a sample email template. Please customize it for your campaign. Best regards, Your Name'
    },
    recipients: []
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor state
  const editorRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  
  // Load recipients on component mount
  useEffect(() => {
    fetchRecipients();
  }, []);
  
  const fetchRecipients = async () => {
    try {
      setIsLoading(true);
      const data = await recipientService.getRecipients();
      setRecipients(data);
    } catch (err) {
      setError('Failed to load recipients. Please try again.');
      console.error('Recipients fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle campaign creation
  const handleCreateCampaign = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Basic validation
      if (!campaign.campaign_name) {
        setError('Campaign name is required');
        return;
      }
      
      if (!campaign.subject_line) {
        setError('Subject line is required');
        return;
      }
      
      if (!campaign.from_name || !campaign.from_email || !campaign.reply_to_email) {
        setError('Sender information is incomplete');
        return;
      }
      
      if (selectedRecipients.length === 0) {
        setError('At least one recipient is required');
        return;
      }
      
      // Prepare campaign data with selected recipients
      const campaignData = {
        ...campaign,
        recipients: selectedRecipients
      };
      
      // Create campaign
      const response = await campaignService.createCampaign(campaignData);
      
      setSuccessMessage('Campaign created successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      // Reset form
      setCampaign({
        campaign_name: '',
        subject_line: '',
        from_name: '',
        from_email: '',
        reply_to_email: '',
        template: {
          name: 'Default Template',
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Hello {{first_name}},</h2>
              <p>This is a sample email template. Please customize it for your campaign.</p>
              <p>Best regards,<br>Your Name</p>
            </div>
          `,
          text_content: 'Hello {{first_name}}, This is a sample email template. Please customize it for your campaign. Best regards, Your Name'
        },
        recipients: []
      });
      setSelectedRecipients([]);
      setCurrentStep(1);
      
    } catch (err) {
      setError(err.message || 'Failed to create campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle test email sending
  const handleSendTestEmail = async () => {
    try {
      setIsSending(true);
      setError(null);
      
      // This is just to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage('Test email sent successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to send test email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  // Toggle recipient selection
  const toggleSelectRecipient = (recipientId) => {
    if (selectedRecipients.includes(recipientId)) {
      setSelectedRecipients(selectedRecipients.filter(id => id !== recipientId));
    } else {
      setSelectedRecipients([...selectedRecipients, recipientId]);
    }
  };
  
  // Toggle select all recipients
  const toggleSelectAll = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map(r => r.recipient_id));
    }
  };
  
  // Filter recipients by search term
  const filteredRecipients = recipients.filter(recipient => {
    const searchString = searchTerm.toLowerCase();
    return (
      recipient.email.toLowerCase().includes(searchString) ||
      (recipient.first_name && recipient.first_name.toLowerCase().includes(searchString)) ||
      (recipient.last_name && recipient.last_name.toLowerCase().includes(searchString)) ||
      (recipient.company && recipient.company.toLowerCase().includes(searchString))
    );
  });
  
  // Get selected recipients details
  const selectedRecipientsDetails = recipients.filter(r => 
    selectedRecipients.includes(r.recipient_id)
  );
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  return (
    <motion.div 
      className="p-6 bg-gray-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Success message toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm">{successMessage}</p>
              </div>
              <button 
                onClick={() => setSuccessMessage('')}
                className="ml-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg p-1.5 hover:bg-green-200 inline-flex h-8 w-8"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Email Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Email Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-screen">
                <div className="mb-4 p-4 bg-gray-100 rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-semibold">From:</div>
                    <div>{campaign.from_name} &lt;{campaign.from_email}&gt;</div>
                    <div className="font-semibold">Subject:</div>
                    <div>{campaign.subject_line}</div>
                    <div className="font-semibold">Reply-To:</div>
                    <div>{campaign.reply_to_email}</div>
                  </div>
                </div>
                <div 
                  className="border rounded p-4 shadow-sm bg-white"
                  dangerouslySetInnerHTML={{ __html: campaign.template.html_content }}
                ></div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-between">
                <button
                  onClick={handleSendTestEmail}
                  disabled={isSending}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Email
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create Campaign</h1>
            <p className="text-gray-600 mt-1">Create and send a new email campaign</p>
          </div>
          <div className="mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateCampaign}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              Create Campaign
            </motion.button>
          </div>
        </div>
      </header>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-200 inline-flex h-8 w-8"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Campaign creation steps */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="w-full md:w-64 mb-6 md:mb-0">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Steps</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      currentStep === 1 ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                      currentStep === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      1
                    </div>
                    Campaign Details
                  </button>
                  
                  <button
                    onClick={() => setCurrentStep(2)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      currentStep === 2 ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                      currentStep === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      2
                    </div>
                    Design Email
                  </button>
                  
                  <button
                    onClick={() => setCurrentStep(3)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      currentStep === 3 ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                      currentStep === 3 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      3
                    </div>
                    Select Recipients
                  </button>
                  
                  <button
                    onClick={() => setCurrentStep(4)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      currentStep === 4 ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                      currentStep === 4 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      4
                    </div>
                    Review & Finish
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-lg shadow"
            >
              {/* Step 1: Campaign Details (shown in previous part) */}
              
              {/* Step 2: Email Design (shown in previous part) */}
              
              {/* Step 3: Select Recipients */}
              {currentStep === 3 && (
                <div>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Select Recipients</h2>
                    <p className="mt-1 text-sm text-gray-500">Choose who will receive this campaign</p>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-medium text-gray-900">
                          Selected Recipients: <span className="text-indigo-600">{selectedRecipients.length}</span>
                        </h3>
                        {selectedRecipients.length > 0 && (
                          <button
                            onClick={() => setSelectedRecipients([])}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Clear Selection
                          </button>
                        )}
                      </div>
                      
                      {selectedRecipients.length > 0 ? (
                        <div className="bg-gray-50 rounded-md p-4 max-h-40 overflow-y-auto">
                          <div className="flex flex-wrap gap-2">
                            {selectedRecipientsDetails.slice(0, 20).map((recipient) => (
                              <div
                                key={recipient.recipient_id}
                                className="bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm flex items-center"
                              >
                                <span className="truncate max-w-32">
                                  {recipient.first_name ? 
                                    `${recipient.first_name} ${recipient.last_name || ''}` : 
                                    recipient.email}
                                </span>
                                <button
                                  onClick={() => toggleSelectRecipient(recipient.recipient_id)}
                                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            {selectedRecipients.length > 20 && (
                              <div className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm">
                                +{selectedRecipients.length - 20} more
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-md p-4 text-center text-gray-500">
                          No recipients selected yet. Select recipients below.
                        </div>
                      )}
                    </div>
                    
                    {/* Recipients selector */}
                    <div className="border rounded-md shadow-sm">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
                        <div className="relative w-full sm:w-64">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Search recipients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={toggleSelectAll}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            {selectedRecipients.length === recipients.length ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-64">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  checked={selectedRecipients.length === filteredRecipients.length && filteredRecipients.length > 0}
                                  onChange={toggleSelectAll}
                                />
                              </th>
                              <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Company
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecipients.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="px-6 py-3 text-center text-sm text-gray-500">
                                  No recipients found. Try a different search term.
                                </td>
                              </tr>
                            ) : (
                              filteredRecipients.map((recipient) => (
                                <tr 
                                  key={recipient.recipient_id} 
                                  className={`hover:bg-gray-50 ${selectedRecipients.includes(recipient.recipient_id) ? 'bg-indigo-50' : ''}`}
                                >
                                  <td className="px-6 py-2 whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                      checked={selectedRecipients.includes(recipient.recipient_id)}
                                      onChange={() => toggleSelectRecipient(recipient.recipient_id)}
                                    />
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                        {recipient.first_name ? recipient.first_name.charAt(0) : recipient.email.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">
                                          {recipient.first_name && recipient.last_name 
                                            ? `${recipient.first_name} ${recipient.last_name}`
                                            : recipient.first_name 
                                            ? recipient.first_name 
                                            : 'Unnamed Contact'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {recipient.email}
                                  </td>
                                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {recipient.company || '—'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Next: Review
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 4: Review & Finish */}
              {currentStep === 4 && (
                <div>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Review & Finish</h2>
                    <p className="mt-1 text-sm text-gray-500">Confirm your campaign details before creating</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-medium text-gray-900 mb-2">Campaign Details</h3>
                        <div className="bg-gray-50 rounded-md p-4">
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Campaign Name</dt>
                              <dd className="mt-1 text-sm text-gray-900">{campaign.campaign_name || '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Subject Line</dt>
                              <dd className="mt-1 text-sm text-gray-900">{campaign.subject_line || '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">From Name</dt>
                              <dd className="mt-1 text-sm text-gray-900">{campaign.from_name || '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">From Email</dt>
                              <dd className="mt-1 text-sm text-gray-900">{campaign.from_email || '—'}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Reply-To Email</dt>
                              <dd className="mt-1 text-sm text-gray-900">{campaign.reply_to_email || '—'}</dd>
                            </div>
                          </dl>
                          <div className="mt-3 text-right">
                            <button
                              onClick={() => setCurrentStep(1)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium text-gray-900 mb-2">Email Content</h3>
                        <div className="bg-gray-50 rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-gray-500">Template: {campaign.template.name}</p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setShowPreview(true)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                Preview
                              </button>
                              <button
                                onClick={() => setCurrentStep(2)}
                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                              </button>
                            </div>
                          </div>
                          <div className="border rounded bg-white p-3 max-h-36 overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: campaign.template.html_content.substring(0, 300) + (campaign.template.html_content.length > 300 ? '...' : '') }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium text-gray-900 mb-2">Recipients</h3>
                        <div className="bg-gray-50 rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-gray-500">
                              {selectedRecipients.length} recipients selected
                            </p>
                            <button
                              onClick={() => setCurrentStep(3)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </button>
                          </div>
                          {selectedRecipientsDetails.length > 0 ? (
                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                              {selectedRecipientsDetails.slice(0, 15).map((recipient) => (
                                <div
                                  key={recipient.recipient_id}
                                  className="bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-xs"
                                >
                                  {recipient.first_name ? 
                                    `${recipient.first_name} ${recipient.last_name || ''}` : 
                                    recipient.email}
                                </div>
                              ))}
                              {selectedRecipientsDetails.length > 15 && (
                                <div className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-xs">
                                  +{selectedRecipientsDetails.length - 15} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-sm text-red-500 py-2">
                              No recipients selected! Please select recipients before creating the campaign.
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <HelpCircle className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Important Note</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                Once created, your campaign will be saved as a draft. You'll be able to send it immediately or schedule it for later from the Campaigns page.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </button>
                    <button
                      onClick={handleCreateCampaign}
                      disabled={isLoading || selectedRecipients.length === 0}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        isLoading || selectedRecipients.length === 0 
                          ? 'bg-indigo-300 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Create Campaign
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignCreator;