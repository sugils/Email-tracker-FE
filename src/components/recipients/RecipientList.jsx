// src/components/recipients/RecipientList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecipientService from '../../services/recipient.service';
import GroupService from '../../services/group.service';
import GroupCreateModal from '../groups/GroupCreateModal';
import GroupManageModal from '../groups/GroupManageModal';
import './RecipientList.css';

const RecipientList = () => {
  const [recipients, setRecipients] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showManageGroupModal, setShowManageGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupFormData, setGroupFormData] = useState({ name: '', description: '' });
  const [groupFormError, setGroupFormError] = useState('');
  const [groupFormLoading, setGroupFormLoading] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recipientsData, groupsData] = await Promise.all([
        RecipientService.getAllRecipients(),
        GroupService.getAllGroups()
      ]);
      
      setRecipients(recipientsData);
      setGroups(groupsData);
      
      // Initialize all groups as expanded
      const initialExpanded = {};
      groupsData.forEach(group => {
        initialExpanded[group.id] = true;
      });
      // Add "ungrouped" as expanded by default
      initialExpanded['ungrouped'] = true;
      setExpandedGroups(initialExpanded);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        success = await deleteRecipient(selectedRecipients[0]);
      } else {
        success = await deleteBulkRecipients(selectedRecipients);
      }
      
      if (success) {
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

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleCreateGroup = () => {
    setShowGroupModal(true);
  };

  const handleManageGroup = (group, e) => {
    e.stopPropagation();
    setSelectedGroup(group);
    setShowManageGroupModal(true);
  };

  const handleEditGroup = (group, e) => {
    e.stopPropagation();
    setEditingGroup(group);
    setGroupFormData({ name: group.name, description: group.description || '' });
    setGroupFormError('');
    setShowGroupModal(true);
  };

  const handleDeleteGroup = async (groupId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this group? Recipients in this group will become ungrouped.')) {
      try {
        await GroupService.deleteGroup(groupId);
        await fetchData();
      } catch (err) {
        setError(err.message || 'Failed to delete group');
      }
    }
  };

  const handleGroupFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupFormData.name.trim()) {
      setGroupFormError('Group name is required');
      return;
    }
    
    try {
      setGroupFormLoading(true);
      setGroupFormError('');
      
      if (editingGroup) {
        await GroupService.updateGroup(editingGroup.id, groupFormData);
      } else {
        await GroupService.createGroup(groupFormData);
      }
      
      setShowGroupModal(false);
      setGroupFormData({ name: '', description: '' });
      setEditingGroup(null);
      await fetchData();
    } catch (err) {
      setGroupFormError(err.message || 'Failed to save group');
    } finally {
      setGroupFormLoading(false);
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

  // Group recipients
  const groupedRecipients = {
    ungrouped: []
  };
  
  groups.forEach(group => {
    groupedRecipients[group.id] = [];
  });
  
  filteredRecipients.forEach(recipient => {
    if (recipient.group_id && groupedRecipients[recipient.group_id]) {
      groupedRecipients[recipient.group_id].push(recipient);
    } else {
      groupedRecipients.ungrouped.push(recipient);
    }
  });

  const renderRecipientRow = (recipient) => (
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
  );

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
          <button onClick={handleCreateGroup} className="create-group-button">
            <span className="material-icons">folder</span>
            Create Group
          </button>
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
        <div className="recipients-groups">
          {/* Render grouped recipients */}
          {groups.map(group => {
            const recipientsInGroup = groupedRecipients[group.id] || [];
            if (recipientsInGroup.length === 0 && searchTerm) return null;
            
            return (
              <div key={group.id} className="recipient-group">
                <div className="group-header" onClick={() => toggleGroup(group.id)}>
                  <div className="group-info">
                    <span className="material-icons expand-icon">
                      {expandedGroups[group.id] ? 'expand_more' : 'chevron_right'}
                    </span>
                    <span className="material-icons group-icon">folder</span>
                    <h3>{group.name}</h3>
                    <span className="recipient-count">({recipientsInGroup.length})</span>
                  </div>
                  <div className="group-actions">
                    <button className="manage-group-button" onClick={(e) => handleManageGroup(group, e)}>
                      <span className="material-icons">group_add</span>
                    </button>
                    <button className="edit-group-button" onClick={(e) => handleEditGroup(group, e)}>
                      <span className="material-icons">edit</span>
                    </button>
                    <button className="delete-group-button" onClick={(e) => handleDeleteGroup(group.id, e)}>
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </div>
                
                {expandedGroups[group.id] && recipientsInGroup.length > 0 && (
                  <div className="recipients-table">
                    <div className="recipients-table-header">
                      <div className="checkbox-col">
                        <input type="checkbox" id={`group-${group.id}-select-all`} />
                        <label htmlFor={`group-${group.id}-select-all`} className="checkbox-label"></label>
                      </div>
                      <div className="name-col">NAME</div>
                      <div className="email-col">EMAIL</div>
                      <div className="company-col">COMPANY</div>
                      <div className="position-col">POSITION</div>
                      <div className="actions-col"></div>
                    </div>
                    <div className="recipients-table-body">
                      {recipientsInGroup.map(renderRecipientRow)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Render ungrouped recipients */}
          {groupedRecipients.ungrouped.length > 0 && (
            <div className="recipient-group">
              <div className="group-header" onClick={() => toggleGroup('ungrouped')}>
                <div className="group-info">
                  <span className="material-icons expand-icon">
                    {expandedGroups.ungrouped ? 'expand_more' : 'chevron_right'}
                  </span>
                  <span className="material-icons group-icon">inbox</span>
                  <h3>Ungrouped</h3>
                  <span className="recipient-count">({groupedRecipients.ungrouped.length})</span>
                </div>
              </div>
              
              {expandedGroups.ungrouped && (
                <div className="recipients-table">
                  <div className="recipients-table-header">
                    <div className="checkbox-col">
                      <input type="checkbox" id="ungrouped-select-all" />
                      <label htmlFor="ungrouped-select-all" className="checkbox-label"></label>
                    </div>
                    <div className="name-col">NAME</div>
                    <div className="email-col">EMAIL</div>
                    <div className="company-col">COMPANY</div>
                    <div className="position-col">POSITION</div>
                    <div className="actions-col"></div>
                  </div>
                  <div className="recipients-table-body">
                    {groupedRecipients.ungrouped.map(renderRecipientRow)}
                  </div>
                </div>
              )}
            </div>
          )}
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

      <GroupCreateModal
        isOpen={showGroupModal}
        onClose={() => {
          setShowGroupModal(false);
          setEditingGroup(null);
          setGroupFormData({ name: '', description: '' });
        }}
        onGroupCreated={() => {
          fetchData();
        }}
        editingGroup={editingGroup}
        initialData={editingGroup ? groupFormData : null}
      />

      {showManageGroupModal && selectedGroup && (
        <GroupManageModal
          isOpen={showManageGroupModal}
          onClose={() => {
            setShowManageGroupModal(false);
            setSelectedGroup(null);
          }}
          group={selectedGroup}
          onUpdate={() => fetchData()}
        />
      )}
    </div>
  );
};

export default RecipientList;