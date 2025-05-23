// src/components/groups/GroupCreateModal.jsx
import React, { useState, useEffect } from 'react';
import RecipientService from '../../services/recipient.service';
import GroupService from '../../services/group.service';
import './GroupCreateModal.css';

const GroupCreateModal = ({ isOpen, onClose, onGroupCreated, editingGroup = null, initialData = null }) => {
  const [step, setStep] = useState(1); // 1: Group Info, 2: Add Recipients
  const [groupName, setGroupName] = useState(initialData?.name || '');
  const [groupDescription, setGroupDescription] = useState(initialData?.description || '');
  const [allRecipients, setAllRecipients] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('select'); // 'select', 'add', or 'import'
  const [newRecipient, setNewRecipient] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company: '',
    position: ''
  });
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchRecipients();
      // Reset form when opening
      if (!editingGroup) {
        setStep(1);
        setGroupName('');
        setGroupDescription('');
        setSelectedRecipients([]);
        setSearchTerm('');
        setError(null);
        setActiveTab('select');
        setNewRecipient({
          email: '',
          first_name: '',
          last_name: '',
          company: '',
          position: ''
        });
        setCsvFile(null);
        setCsvPreview([]);
      } else if (initialData) {
        setGroupName(initialData.name);
        setGroupDescription(initialData.description || '');
      }
    }
  }, [isOpen, editingGroup, initialData]);

  const fetchRecipients = async () => {
    try {
      const recipients = await RecipientService.getAllRecipients();
      setAllRecipients(recipients);
    } catch (err) {
      console.error('Failed to fetch recipients:', err);
    }
  };

  const handleRecipientToggle = (recipientId) => {
    if (selectedRecipients.includes(recipientId)) {
      setSelectedRecipients(selectedRecipients.filter(id => id !== recipientId));
    } else {
      setSelectedRecipients([...selectedRecipients, recipientId]);
    }
  };

  const handleSelectAll = () => {
    const filteredIds = filteredRecipients.map(r => r.recipient_id);
    if (selectedRecipients.length === filteredIds.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(filteredIds);
    }
  };

  const filteredRecipients = allRecipients.filter(recipient => {
    const fullName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim().toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      recipient.email.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower) ||
      (recipient.company && recipient.company.toLowerCase().includes(searchLower))
    );
  });

  const handleAddNewRecipient = async () => {
    if (!newRecipient.email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create the recipient
      const createdRecipient = await RecipientService.createRecipient(newRecipient);
      
      // Add to selected recipients
      setSelectedRecipients([...selectedRecipients, createdRecipient.recipient_id]);
      
      // Refresh recipients list
      await fetchRecipients();
      
      // Reset form
      setNewRecipient({
        email: '',
        first_name: '',
        last_name: '',
        company: '',
        position: ''
      });
      
      // Switch back to select tab
      setActiveTab('select');
    } catch (err) {
      setError(err.message || 'Failed to add recipient');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      readCsvFile(file);
    } else {
      setError('Please select a CSV file');
    }
  };

  const readCsvFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const recipients = RecipientService.parseCSV(content);
        setCsvPreview(recipients.slice(0, 5)); // Show first 5 for preview
      } catch (err) {
        setError('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleImportCsv = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          const recipients = RecipientService.parseCSV(content);
          
          // Create recipients
          const response = await RecipientService.createBulkRecipients(recipients);
          
          // Refresh recipients list
          await fetchRecipients();
          
          // Select all newly created recipients
          // Note: This is a simplified approach. In production, you'd want to get the IDs from the response
          const newRecipientEmails = recipients.map(r => r.email);
          const newlyCreated = allRecipients.filter(r => newRecipientEmails.includes(r.email));
          const newIds = newlyCreated.map(r => r.recipient_id);
          setSelectedRecipients([...selectedRecipients, ...newIds]);
          
          // Reset
          setCsvFile(null);
          setCsvPreview([]);
          setActiveTab('select');
          
          alert(`Successfully imported ${response.created_count} recipients. ${response.skipped_count} duplicates were skipped.`);
        } catch (err) {
          setError(err.message || 'Failed to import recipients');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(csvFile);
    } catch (err) {
      setError(err.message || 'Failed to import CSV');
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  const handleCreateGroup = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're editing or creating
      let groupId;
      if (editingGroup) {
        // Update existing group
        await GroupService.updateGroup(editingGroup.id, {
          name: groupName,
          description: groupDescription
        });
        groupId = editingGroup.id;
      } else {
        // Create new group
        const groupData = {
          name: groupName,
          description: groupDescription
        };
        const groupResponse = await GroupService.createGroup(groupData);
        groupId = groupResponse.group_id;
      }

      // Add selected recipients to the group (only if there are any)
      if (selectedRecipients.length > 0 && !editingGroup) {
        await GroupService.addRecipientsToGroup(groupId, selectedRecipients);
      }

      // Call the callback
      if (onGroupCreated) {
        onGroupCreated();
      }

      // Reset and close
      handleClose();
    } catch (err) {
      // Check if it's a duplicate name error
      if (err.message && err.message.includes('already exists')) {
        setError('A group with this name already exists. Please choose a different name.');
      } else {
        setError(err.message || 'Failed to save group');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setGroupName('');
    setGroupDescription('');
    setSelectedRecipients([]);
    setSearchTerm('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="group-modal-overlay">
      <div className="group-modal">
        <div className="group-modal-header">
          <h2>{step === 1 ? 'Create New Group' : 'Add Recipients'}</h2>
          <button className="close-button" onClick={handleClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span className="material-icons">error_outline</span>
            <p>{error}</p>
          </div>
        )}

        {step === 1 ? (
          <div className="group-modal-content">
            <div className="form-group">
              <label htmlFor="group-name">Group Name*</label>
              <input
                type="text"
                id="group-name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Marketing Team"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Optional description for this group"
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button className="cancel-button" onClick={handleClose}>
                Cancel
              </button>
              <button className="next-button" onClick={handleNext}>
                Next
                <span className="material-icons">arrow_forward</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="group-modal-content recipients-step">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'select' ? 'active' : ''}`}
                onClick={() => setActiveTab('select')}
              >
                <span className="material-icons">people</span>
                Select Existing
              </button>
              <button 
                className={`tab ${activeTab === 'add' ? 'active' : ''}`}
                onClick={() => setActiveTab('add')}
              >
                <span className="material-icons">person_add</span>
                Add New
              </button>
              <button 
                className={`tab ${activeTab === 'import' ? 'active' : ''}`}
                onClick={() => setActiveTab('import')}
              >
                <span className="material-icons">upload_file</span>
                Import CSV
              </button>
            </div>

            {activeTab === 'select' && (
              <>
                <div className="recipients-header">
                  <div className="search-box">
                    <span className="material-icons">search</span>
                    <input
                      type="text"
                      placeholder="Search recipients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="selection-info">
                    {selectedRecipients.length} selected
                  </div>
                </div>

                <div className="recipients-list">
                  {filteredRecipients.length > 0 && (
                    <div className="select-all-row">
                      <label className="recipient-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedRecipients.length === filteredRecipients.length}
                          onChange={handleSelectAll}
                        />
                        <span className="checkbox-custom"></span>
                        <span className="select-all-text">Select All</span>
                      </label>
                    </div>
                  )}

                  {filteredRecipients.map(recipient => (
                    <div key={recipient.recipient_id} className="recipient-item">
                      <label className="recipient-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedRecipients.includes(recipient.recipient_id)}
                          onChange={() => handleRecipientToggle(recipient.recipient_id)}
                        />
                        <span className="checkbox-custom"></span>
                        <div className="recipient-info">
                          <div className="recipient-avatar">
                            {recipient.first_name ? 
                              recipient.first_name.charAt(0).toUpperCase() : 
                              recipient.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="recipient-details">
                            <div className="recipient-name">
                              {recipient.first_name || recipient.last_name ? 
                                `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() :
                                'No name'}
                            </div>
                            <div className="recipient-email">{recipient.email}</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}

                  {filteredRecipients.length === 0 && (
                    <div className="no-recipients">
                      <span className="material-icons">inbox</span>
                      <p>No recipients found</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'add' && (
              <div className="add-recipient-form">
                <div className="form-group">
                  <label>Email*</label>
                  <input
                    type="email"
                    value={newRecipient.email}
                    onChange={(e) => setNewRecipient({...newRecipient, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={newRecipient.first_name}
                      onChange={(e) => setNewRecipient({...newRecipient, first_name: e.target.value})}
                      placeholder="John"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={newRecipient.last_name}
                      onChange={(e) => setNewRecipient({...newRecipient, last_name: e.target.value})}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      value={newRecipient.company}
                      onChange={(e) => setNewRecipient({...newRecipient, company: e.target.value})}
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      value={newRecipient.position}
                      onChange={(e) => setNewRecipient({...newRecipient, position: e.target.value})}
                      placeholder="Manager"
                    />
                  </div>
                </div>
                <button 
                  className="add-recipient-button"
                  onClick={handleAddNewRecipient}
                  disabled={loading || !newRecipient.email}
                >
                  <span className="material-icons">add</span>
                  Add Recipient
                </button>
              </div>
            )}

            {activeTab === 'import' && (
              <div className="import-section">
                <div className="import-info">
                  <p>Upload a CSV file with recipient information. The file should include columns for email, first_name, last_name, company, and position.</p>
                  <div className="csv-format">
                    <code>email,first_name,last_name,company,position</code>
                  </div>
                </div>
                
                <div className="file-upload">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    id="csv-file"
                    className="file-input"
                  />
                  <label htmlFor="csv-file" className="file-label">
                    <span className="material-icons">cloud_upload</span>
                    {csvFile ? csvFile.name : 'Choose CSV File'}
                  </label>
                </div>

                {csvPreview.length > 0 && (
                  <div className="csv-preview">
                    <h4>Preview (first 5 rows)</h4>
                    <div className="preview-list">
                      {csvPreview.map((recipient, index) => (
                        <div key={index} className="preview-item">
                          <span>{recipient.email}</span>
                          {recipient.first_name && <span> - {recipient.first_name} {recipient.last_name}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {csvFile && (
                  <button 
                    className="import-csv-button"
                    onClick={handleImportCsv}
                    disabled={loading}
                  >
                    <span className="material-icons">upload</span>
                    Import Recipients
                  </button>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button className="back-button" onClick={handleBack}>
                <span className="material-icons">arrow_back</span>
                Back
              </button>
              <button 
                className={`create-button ${loading ? 'loading' : ''}`}
                onClick={handleCreateGroup}
                disabled={loading}
              >
                {loading ? 'Creating...' : (editingGroup ? 'Update Group' : `Create Group${selectedRecipients.length > 0 ? ` (${selectedRecipients.length})` : ''}`)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupCreateModal;