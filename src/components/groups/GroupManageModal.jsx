// src/components/groups/GroupManageModal.jsx
import React, { useState, useEffect } from 'react';
import RecipientService from '../../services/recipient.service';
import GroupService from '../../services/group.service';
import './GroupManageModal.css';

const GroupManageModal = ({ isOpen, onClose, group, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'add'
  const [groupRecipients, setGroupRecipients] = useState([]);
  const [allRecipients, setAllRecipients] = useState([]);
  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [selectedToRemove, setSelectedToRemove] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && group) {
      fetchRecipients();
    }
  }, [isOpen, group]);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const recipients = await RecipientService.getAllRecipients();
      setAllRecipients(recipients);
      
      // Filter recipients by group
      const inGroup = recipients.filter(r => r.group_id === group.id);
      const notInGroup = recipients.filter(r => r.group_id !== group.id);
      
      setGroupRecipients(inGroup);
      setAvailableRecipients(notInGroup);
    } catch (err) {
      setError('Failed to fetch recipients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromGroup = async () => {
    if (selectedToRemove.length === 0) return;
    
    try {
      setLoading(true);
      await GroupService.removeRecipientsFromGroup(group.id, selectedToRemove);
      setSelectedToRemove([]);
      await fetchRecipients();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Failed to remove recipients from group');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGroup = async () => {
    if (selectedToAdd.length === 0) return;
    
    try {
      setLoading(true);
      await GroupService.addRecipientsToGroup(group.id, selectedToAdd);
      setSelectedToAdd([]);
      await fetchRecipients();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Failed to add recipients to group');
    } finally {
      setLoading(false);
    }
  };

  const handleImportToGroup = () => {
    // Navigate to import page with group context
    window.location.href = `/recipients/import?group=${group.id}`;
    onClose();
  };

  const filteredGroupRecipients = groupRecipients.filter(recipient => {
    const fullName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim().toLowerCase();
    return (
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase())
    );
  });

  const filteredAvailableRecipients = availableRecipients.filter(recipient => {
    const fullName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim().toLowerCase();
    return (
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase())
    );
  });

  if (!isOpen || !group) return null;

  return (
    <div className="group-manage-overlay">
      <div className="group-manage-modal">
        <div className="group-manage-header">
          <div className="header-info">
            <span className="material-icons group-icon">folder</span>
            <h2>{group.name}</h2>
            <span className="member-count">{groupRecipients.length} members</span>
          </div>
          <button className="close-button" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span className="material-icons">error_outline</span>
            <p>{error}</p>
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Current Members
          </button>
          <button 
            className={`tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add Members
          </button>
        </div>

        <div className="search-section">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder={activeTab === 'current' ? 'Search current members...' : 'Search available recipients...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab === 'add' && (
            <button className="import-button" onClick={handleImportToGroup}>
              <span className="material-icons">upload_file</span>
              Import
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'current' ? (
              <div className="tab-content">
                {filteredGroupRecipients.length === 0 ? (
                  <div className="empty-state">
                    <span className="material-icons">people_outline</span>
                    <p>{searchTerm ? 'No members found' : 'No members in this group yet'}</p>
                    <button className="add-members-button" onClick={() => setActiveTab('add')}>
                      Add Members
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="recipients-list">
                      {filteredGroupRecipients.map(recipient => (
                        <div key={recipient.recipient_id} className="recipient-item">
                          <label className="recipient-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedToRemove.includes(recipient.recipient_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedToRemove([...selectedToRemove, recipient.recipient_id]);
                                } else {
                                  setSelectedToRemove(selectedToRemove.filter(id => id !== recipient.recipient_id));
                                }
                              }}
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
                    </div>
                    {selectedToRemove.length > 0 && (
                      <div className="action-bar">
                        <span className="selection-info">{selectedToRemove.length} selected</span>
                        <button 
                          className="remove-button"
                          onClick={handleRemoveFromGroup}
                          disabled={loading}
                        >
                          <span className="material-icons">remove_circle_outline</span>
                          Remove from Group
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="tab-content">
                {filteredAvailableRecipients.length === 0 ? (
                  <div className="empty-state">
                    <span className="material-icons">inbox</span>
                    <p>{searchTerm ? 'No recipients found' : 'All recipients are already in this group'}</p>
                    <button className="create-button" onClick={() => window.location.href = '/recipients/create'}>
                      Create New Recipient
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="recipients-list">
                      {filteredAvailableRecipients.map(recipient => (
                        <div key={recipient.recipient_id} className="recipient-item">
                          <label className="recipient-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedToAdd.includes(recipient.recipient_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedToAdd([...selectedToAdd, recipient.recipient_id]);
                                } else {
                                  setSelectedToAdd(selectedToAdd.filter(id => id !== recipient.recipient_id));
                                }
                              }}
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
                                {recipient.group_name && (
                                  <div className="current-group">
                                    <span className="material-icons">folder</span>
                                    {recipient.group_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedToAdd.length > 0 && (
                      <div className="action-bar">
                        <span className="selection-info">{selectedToAdd.length} selected</span>
                        <button 
                          className="add-button"
                          onClick={handleAddToGroup}
                          disabled={loading}
                        >
                          <span className="material-icons">add_circle_outline</span>
                          Add to Group
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupManageModal;