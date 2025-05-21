import React, { useState, useEffect } from 'react';
import { recipientService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Upload, X, Check, RefreshCw, Filter, Download, Trash2, Edit, Search, ChevronDown, ChevronRight } from 'lucide-react';

const RecipientsManagement = () => {
  const [recipients, setRecipients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [importData, setImportData] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // New recipient form state
  const [newRecipient, setNewRecipient] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company: '',
    position: '',
    custom_fields: {}
  });

  // Load recipients on component mount
  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    setIsLoading(true);
    try {
      const data = await recipientService.getRecipients();
      setRecipients(data);
      setError(null);
    } catch (err) {
      setError('Failed to load recipients. Please try again.');
      console.error('Recipients fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for adding a single recipient
  const handleAddRecipient = async () => {
    try {
      if (!newRecipient.email) {
        setError('Email is required');
        return;
      }
      
      setIsLoading(true);
      const response = await recipientService.createRecipient(newRecipient);
      
      // Add the new recipient to the list
      setRecipients([...recipients, {...newRecipient, recipient_id: response.recipient_id, created_at: new Date().toISOString()}]);
      
      // Reset form and hide it
      setNewRecipient({
        email: '',
        first_name: '',
        last_name: '',
        company: '',
        position: '',
        custom_fields: {}
      });
      setShowAddForm(false);
      setSuccessMessage('Recipient added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to add recipient. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for importing recipients in bulk
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        
        const recipientsData = [];
        
        // Skip header line, process data lines
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue;
          
          const values = lines[i].split(',').map(value => value.trim());
          const recipient = {};
          
          headers.forEach((header, index) => {
            if (header === 'email') recipient.email = values[index];
            else if (header === 'first_name') recipient.first_name = values[index];
            else if (header === 'last_name') recipient.last_name = values[index];
            else if (header === 'company') recipient.company = values[index];
            else if (header === 'position') recipient.position = values[index];
            else {
              if (!recipient.custom_fields) recipient.custom_fields = {};
              recipient.custom_fields[header] = values[index];
            }
          });
          
          // Only add if email exists
          if (recipient.email) {
            recipientsData.push(recipient);
          }
        }
        
        setImportData({
          totalCount: recipientsData.length,
          recipients: recipientsData
        });
      };
      reader.readAsText(file);
    }
  };

  const handleImportRecipients = async () => {
    if (!importData || importData.recipients.length === 0) return;
    
    setIsImporting(true);
    
    try {
      const chunkSize = 100; // Import in chunks of 100
      const chunks = [];
      
      // Split recipients into chunks
      for (let i = 0; i < importData.recipients.length; i += chunkSize) {
        chunks.push(importData.recipients.slice(i, i + chunkSize));
      }
      
      let importedCount = 0;
      
      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const response = await recipientService.bulkCreateRecipients({
          recipients: chunks[i]
        });
        
        importedCount += response.created_count;
        setImportProgress(Math.round((importedCount / importData.totalCount) * 100));
      }
      
      // Refresh the recipients list
      await fetchRecipients();
      
      setSuccessMessage(`${importedCount} recipients imported successfully!`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to import recipients. Please try again.');
    } finally {
      setIsImporting(false);
      setImportData(null);
      setImportProgress(0);
      setShowImportModal(false);
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

  // Toggle select all recipients
  const toggleSelectAll = () => {
    if (selectedRecipients.length === filteredRecipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(filteredRecipients.map(r => r.recipient_id));
    }
  };

  // Toggle select individual recipient
  const toggleSelectRecipient = (recipientId) => {
    if (selectedRecipients.includes(recipientId)) {
      setSelectedRecipients(selectedRecipients.filter(id => id !== recipientId));
    } else {
      setSelectedRecipients([...selectedRecipients, recipientId]);
    }
  };

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

  if (isLoading && recipients.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto"
          >
            <RefreshCw size={40} className="text-blue-500" />
          </motion.div>
          <p className="mt-4 text-lg text-gray-600">Loading recipients...</p>
        </div>
      </div>
    );
  }

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
      
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Recipients</h1>
            <p className="text-gray-600 mt-1">Manage your email recipients and contacts</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Recipient
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Upload className="h-5 w-5 mr-2" />
              Import CSV
            </motion.button>
          </div>
        </div>
      </header>
      
      {/* Search and filter bar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search recipients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
      
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
      
      {/* Recipients table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow overflow-hidden"
      >
        <div className="flex justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {selectedRecipients.length > 0 ? 
              `${selectedRecipients.length} recipients selected` : 
              `${filteredRecipients.length} total recipients`}
          </h2>
          
          {selectedRecipients.length > 0 && (
            <div className="flex space-x-2">
              <button className="text-gray-600 hover:text-gray-900">
                <Trash2 className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setSelectedRecipients([])}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={selectedRecipients.length === filteredRecipients.length && filteredRecipients.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No recipients found. Add your first recipient or import a list.
                  </td>
                </tr>
              ) : (
                filteredRecipients.map((recipient) => (
                  <motion.tr 
                    key={recipient.recipient_id}
                    variants={itemVariants}
                    className={`hover:bg-gray-50 ${selectedRecipients.includes(recipient.recipient_id) ? 'bg-indigo-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedRecipients.includes(recipient.recipient_id)}
                          onChange={() => toggleSelectRecipient(recipient.recipient_id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                          {recipient.first_name ? recipient.first_name.charAt(0) : recipient.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{recipient.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{recipient.company || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{recipient.position || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(recipient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* Add recipient modal */}
      <AnimatePresence>
        {showAddForm && (
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
              className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Add New Recipient</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newRecipient.email}
                      onChange={(e) => setNewRecipient({...newRecipient, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={newRecipient.first_name}
                        onChange={(e) => setNewRecipient({...newRecipient, first_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={newRecipient.last_name}
                        onChange={(e) => setNewRecipient({...newRecipient, last_name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newRecipient.company}
                      onChange={(e) => setNewRecipient({...newRecipient, company: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <input
                      type="text"
                      id="position"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newRecipient.position}
                      onChange={(e) => setNewRecipient({...newRecipient, position: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleAddRecipient}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    'Add Recipient'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Import CSV modal */}
      <AnimatePresence>
        {showImportModal && (
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
              className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Import Recipients</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="px-6 py-4">
                {!importData ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Upload a CSV file with your recipients. The file should have columns for email, first_name, last_name, company, and position.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <div className="text-sm text-gray-600 mb-3">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileUpload} />
                        </label>
                        <span className="pl-1">or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        CSV up to 10MB
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ChevronRight className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">CSV Format</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>Your CSV should have these headers:</p>
                            <p className="font-mono text-xs mt-1">email,first_name,last_name,company,position</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>CSV file parsed successfully</span>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Import Summary</h4>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{importData.totalCount}</span> recipients found in CSV
                      </p>
                    </div>
                    
                    {isImporting && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Importing...</span>
                          <span>{importProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${importProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData(null);
                  }}
                >
                  Cancel
                </button>
                {importData && (
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleImportRecipients}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        Importing...
                      </>
                    ) : (
                      'Import Recipients'
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecipientsManagement;