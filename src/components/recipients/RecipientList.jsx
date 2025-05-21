// src/components/recipients/RecipientList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecipientService from '../../services/recipient.service';
import './RecipientList.css';

const RecipientList = () => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setLoading(true);
        const data = await RecipientService.getAllRecipients();
        setRecipients(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch recipients');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipients();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectRecipient = (recipientId) => {
    if (selectedRecipients.includes(recipientId)) {
      setSelectedRecipients(selectedRecipients.filter(id => id !== recipientId));
    } else {
      setSelectedRecipients([...selectedRecipients, recipientId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === filteredRecipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(filteredRecipients.map(r => r.recipient_id));
    }
  };

  const handleBulkDelete = async () => {
    // In a real implementation, you would call an API endpoint to delete multiple recipients
    // For now, we'll just show a confirmation dialog
    setShowDeleteConfirm(true);
  };

  const handleSingleDelete = (recipientId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedRecipients([recipientId]);
    setShowDeleteConfirm(true);
  };
  
  const deleteRecipient = async (recipientId) => {
    try {
      await RecipientService.deleteRecipient(recipientId);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete recipient');
      console.error(err);
      return false;
    }
  };
  
  const deleteBulkRecipients = async (recipientIds) => {
    try {
      await RecipientService.deleteBulkRecipients(recipientIds);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete recipients');
      console.error(err);
      return false;
    }
  };

  const confirmBulkDelete = async () => {
    try {
      setBulkDeleteLoading(true);
      
      let success;
      if (selectedRecipients.length === 1) {
        // Delete single recipient
        success = await deleteRecipient(selectedRecipients[0]);
      } else {
        // Delete multiple recipients
        success = await deleteBulkRecipients(selectedRecipients);
      }
      
      if (success) {
        // Remove deleted recipients from state
        setRecipients(recipients.filter(r => !selectedRecipients.includes(r.recipient_id)));
        setSelectedRecipients([]);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete recipients');
      console.error(err);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const filteredRecipients = recipients.filter(recipient => {
    const fullName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim().toLowerCase();
    return (
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase()) ||
      (recipient.company && recipient.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="recipients-loading">
        <div className="loader"></div>
        <p>Loading recipients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipients-error">
        <span className="material-icons error-icon">error_outline</span>
        <h3>Error Loading Recipients</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="reload-button">
          <span className="material-icons">refresh</span>
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="recipients-container">
      <div className="main-header">
        <h1>Recipients</h1>
      </div>

      <div className="compact-layout">
        <div className="search-container">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Search recipients..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="header-actions">
          <Link to="/recipients/import" className="import-button">
            <span className="material-icons">upload_file</span>
            Import
          </Link>
          <Link to="/recipients/create" className="create-recipient-button">
            <span className="material-icons">add</span>
            Add Recipient
          </Link>
        </div>
      </div>

      {selectedRecipients.length > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">{selectedRecipients.length} selected</span>
          <button className="bulk-delete-button" onClick={handleBulkDelete}>
            <span className="material-icons">delete</span>
            Delete
          </button>
        </div>
      )}

      {recipients.length === 0 ? (
        <div className="recipients-empty">
          <img src="/assets/images/empty-recipients.svg" alt="No recipients found" />
          <h2>No recipients yet</h2>
          <p>Add your first recipient to get started</p>
          <Link to="/recipients/create" className="add-first-recipient">
            Add Recipient
          </Link>
        </div>
      ) : filteredRecipients.length === 0 ? (
        <div className="no-results">
          <span className="material-icons">search_off</span>
          <h3>No matching recipients found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="recipients-table">
          <div className="recipients-table-header">
            <div className="checkbox-col">
              <input
                type="checkbox"
                checked={selectedRecipients.length === filteredRecipients.length && filteredRecipients.length > 0}
                onChange={handleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="checkbox-label"></label>
            </div>
            <div className="name-col">NAME</div>
            <div className="email-col">EMAIL</div>
            <div className="company-col">COMPANY</div>
            <div className="position-col">POSITION</div>
            <div className="actions-col"></div>
          </div>

          <div className="recipients-table-body">
            {filteredRecipients.map((recipient) => (
              <div key={recipient.recipient_id} className="recipient-row">
                <div className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedRecipients.includes(recipient.recipient_id)}
                    onChange={() => handleSelectRecipient(recipient.recipient_id)}
                    id={`recipient-${recipient.recipient_id}`}
                  />
                  <label htmlFor={`recipient-${recipient.recipient_id}`} className="checkbox-label"></label>
                </div>
                <div className="name-col">
                  <div className="recipient-avatar">
                    {recipient.first_name ? recipient.first_name.charAt(0).toUpperCase() : recipient.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="recipient-name">
                    {recipient.first_name && recipient.last_name 
                      ? `${recipient.first_name} ${recipient.last_name}`
                      : <span className="no-name">No name</span>}
                  </div>
                </div>
                <div className="email-col">{recipient.email}</div>
                <div className="company-col">
                  {recipient.company || <span className="empty-value">–</span>}
                </div>
                <div className="position-col">
                  {recipient.position || <span className="empty-value">–</span>}
                </div>
                <div className="actions-col">
                  <div className="recipient-actions">
                    <Link to={`/recipients/${recipient.recipient_id}/edit`} className="edit-button">
                      <span className="material-icons">edit</span>
                    </Link>
                    <button 
                      className="delete-button" 
                      onClick={(e) => handleSingleDelete(recipient.recipient_id, e)}
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="modal-content">
            <h3>Delete {selectedRecipients.length} {selectedRecipients.length === 1 ? 'Recipient' : 'Recipients'}?</h3>
            <p>This action cannot be undone. Recipients will be permanently removed from your account.</p>
            <div className="modal-actions">
              <button 
                className="cancel-button" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={bulkDeleteLoading}
              >
                Cancel
              </button>
              <button 
                className={`confirm-button ${bulkDeleteLoading ? 'loading' : ''}`} 
                onClick={confirmBulkDelete}
                disabled={bulkDeleteLoading}
              >
                {bulkDeleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
          <div className="modal-overlay" onClick={() => !bulkDeleteLoading && setShowDeleteConfirm(false)}></div>
        </div>
      )}
    </div>
  );
};

export default RecipientList;