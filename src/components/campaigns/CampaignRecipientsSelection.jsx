import React, { useState, useEffect } from 'react';
import RecipientService from '../../services/recipient.service';
import GroupService from '../../services/group.service';

const CampaignRecipientsSelection = ({ 
  selectedRecipients,
  setSelectedRecipients, 
  selectedGroups, 
  setSelectedGroups 
}) => {
  const [recipients, setRecipients] = useState([]);
  const [groups, setGroups] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [recipientView, setRecipientView] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [groupRecipients, setGroupRecipients] = useState({});
  const [isLoadingGroupRecipients, setIsLoadingGroupRecipients] = useState({});

  // Fetch recipients and groups on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setRecipientsLoading(true);
        const [recipientsData, groupsData] = await Promise.all([
          RecipientService.getAllRecipients(),
          GroupService.getAllGroups()
        ]);
        
        setRecipients(recipientsData);
        setGroups(groupsData);
        
        // Initialize expanded groups state
        const initialExpanded = {};
        groupsData.forEach(group => {
          initialExpanded[group.id] = false;
        });
        setExpandedGroups(initialExpanded);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setRecipientsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to handle expanding a group and fetching its recipients
  const toggleExpandGroup = async (groupId) => {
    // Toggle expanded state
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));

    // If we're expanding and don't already have the recipients, fetch them
    if (!expandedGroups[groupId] && !groupRecipients[groupId]) {
      try {
        setIsLoadingGroupRecipients(prev => ({ ...prev, [groupId]: true }));
        const recipients = await GroupService.getGroupRecipients(groupId);
        setGroupRecipients(prev => ({ ...prev, [groupId]: recipients }));
      } catch (err) {
        console.error(`Failed to fetch recipients for group ${groupId}:`, err);
      } finally {
        setIsLoadingGroupRecipients(prev => ({ ...prev, [groupId]: false }));
      }
    }
  };

  const handleRecipientSelection = (recipientId) => {
    if (selectedRecipients.includes(recipientId)) {
      setSelectedRecipients(selectedRecipients.filter(id => id !== recipientId));
    } else {
      setSelectedRecipients([...selectedRecipients, recipientId]);
    }
  };

  const handleGroupSelection = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  const handleSelectAllRecipients = () => {
    if (selectedRecipients.length === filteredRecipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(filteredRecipients.map(recipient => recipient.recipient_id));
    }
  };

  const handleSelectAllGroups = () => {
    if (selectedGroups.length === groups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(groups.map(group => group.id));
    }
  };

  // Filter recipients based on search term
  const filteredRecipients = recipients.filter(recipient => {
    const fullName = `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim().toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      recipient.email.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower) ||
      (recipient.company && recipient.company.toLowerCase().includes(searchLower))
    );
  });

  // Calculate total recipient count including groups
  const getTotalRecipientCount = () => {
    let count = selectedRecipients.length;
    
    // Add recipients from selected groups
    selectedGroups.forEach(groupId => {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        count += group.recipient_count || 0;
      }
    });
    
    return count;
  };

  return (
    <div className="campaign-recipients-step">
      <div className="recipients-header">
        <div className="recipient-tabs">
          <button 
            className={`tab-button ${recipientView === 'all' ? 'active' : ''}`}
            onClick={() => setRecipientView('all')}
          >
            All
          </button>
          <button 
            className={`tab-button ${recipientView === 'groups' ? 'active' : ''}`}
            onClick={() => setRecipientView('groups')}
          >
            <span className="material-icons">folder</span>
            Groups ({groups.length})
          </button>
          <button 
            className={`tab-button ${recipientView === 'individuals' ? 'active' : ''}`}
            onClick={() => setRecipientView('individuals')}
          >
            <span className="material-icons">person</span>
            Individuals ({recipients.length})
          </button>
        </div>
        
        <div className="recipients-actions">
          <span className="selected-count">
            {getTotalRecipientCount()} total recipients selected
          </span>
        </div>
      </div>
      
      {recipientsLoading ? (
        <div className="recipients-loading">
          <div className="loader"></div>
          <p>Loading recipients...</p>
        </div>
      ) : recipients.length === 0 && groups.length === 0 ? (
        <div className="no-recipients">
          <div className="empty-state">
            <span className="material-icons">people</span>
            <h3>No Recipients Found</h3>
            <p>Add recipients to send your campaign to</p>
          </div>
        </div>
      ) : (
        <div className="recipients-selection">
          {/* Groups Section */}
          {(recipientView === 'all' || recipientView === 'groups') && groups.length > 0 && (
            <div className="groups-section">
              <div className="section-header">
                <h4>
                  <span className="material-icons">folder</span>
                  Groups
                </h4>
                <button 
                  className="select-all-button"
                  onClick={handleSelectAllGroups}
                >
                  {selectedGroups.length === groups.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="groups-list">
                {groups.map((group) => (
                  <div key={group.id} className="group-container">
                    <div 
                      className={`group-item ${selectedGroups.includes(group.id) ? 'selected' : ''}`}
                      onClick={() => handleGroupSelection(group.id)}
                    >
                      <div className="group-checkbox">
                        <span className="material-icons">
                          {selectedGroups.includes(group.id) ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </div>
                      
                      <div className="group-icon">
                        <span className="material-icons">folder</span>
                      </div>
                      
                      <div className="group-info">
                        <h4 className="group-name">{group.name}</h4>
                        <p className="group-description">
                          {group.description || `${group.recipient_count || 0} recipients`}
                        </p>
                      </div>
                      
                      <div className="group-count">
                        <span className="count-badge">{group.recipient_count || 0}</span>
                      </div>
                      
                      <button 
                        className="group-toggle-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandGroup(group.id);
                        }}
                        title={expandedGroups[group.id] ? "Hide recipients" : "Show recipients"}
                      >
                        <span className="material-icons">
                          {expandedGroups[group.id] ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    </div>
                    
                    {/* Expanded view showing recipients in this group */}
                    {expandedGroups[group.id] && (
                      <div className="group-recipients">
                        <div className="recipients-preview-header">
                          <span>Recipients in this group</span>
                          <span>{isLoadingGroupRecipients[group.id] ? 'Loading...' : 
                                 groupRecipients[group.id] ? groupRecipients[group.id].length : '0'} total</span>
                        </div>
                        
                        {isLoadingGroupRecipients[group.id] ? (
                          <div className="loading-indicator">Loading group recipients...</div>
                        ) : groupRecipients[group.id] && groupRecipients[group.id].length > 0 ? (
                          <div className="recipients-preview-list">
                            {groupRecipients[group.id].map(recipient => (
                              <div key={recipient.recipient_id} className="recipient-preview-item">
                                <div className="recipient-preview-avatar">
                                  {recipient.first_name ? 
                                    recipient.first_name.charAt(0).toUpperCase() : 
                                    recipient.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="recipient-preview-info">
                                  <div className="recipient-preview-name">
                                    {recipient.first_name && recipient.last_name 
                                      ? `${recipient.first_name} ${recipient.last_name}`
                                      : 'No name'}
                                  </div>
                                  <div className="recipient-preview-email">{recipient.email}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-list">No recipients in this group</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Individual Recipients Section */}
          {(recipientView === 'all' || recipientView === 'individuals') && recipients.length > 0 && (
            <div className="individuals-section">
              <div className="section-header">
                <h4>
                  <span className="material-icons">person</span>
                  Individual Recipients
                </h4>
                <button 
                  className="select-all-button"
                  onClick={handleSelectAllRecipients}
                >
                  {selectedRecipients.length === recipients.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="recipients-list">
                {filteredRecipients.map((recipient) => (
                  <div 
                    key={recipient.recipient_id} 
                    className={`recipient-item ${selectedRecipients.includes(recipient.recipient_id) ? 'selected' : ''}`}
                    onClick={() => handleRecipientSelection(recipient.recipient_id)}
                  >
                    <div className="recipient-checkbox">
                      <span className="material-icons">
                        {selectedRecipients.includes(recipient.recipient_id) ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                    </div>
                    
                    <div className="recipient-avatar">
                      {recipient.first_name ? 
                        recipient.first_name.charAt(0).toUpperCase() : 
                        recipient.email.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="recipient-info">
                      <h4 className="recipient-name">
                        {recipient.first_name && recipient.last_name 
                          ? `${recipient.first_name} ${recipient.last_name}`
                          : recipient.email}
                      </h4>
                      <p className="recipient-email">{recipient.email}</p>
                      {recipient.company && (
                        <p className="recipient-company">{recipient.company}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Review Section */}
          {(selectedRecipients.length > 0 || selectedGroups.length > 0) && (
            <div className="recipients-review">
              <div className="review-header">
                <h4>Selected Recipients Summary</h4>
              </div>
              <div className="review-content">
                {selectedGroups.length > 0 && (
                  <div className="selected-groups-summary">
                    <h5>Selected Groups ({selectedGroups.length})</h5>
                    <ul>
                      {selectedGroups.map(groupId => {
                        const group = groups.find(g => g.id === groupId);
                        return group ? (
                          <li key={groupId}>
                            <span className="material-icons">folder</span>
                            <span>{group.name}</span>
                            <span className="group-recipients-count">({group.recipient_count} recipients)</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
                
                {selectedRecipients.length > 0 && (
                  <div className="selected-individuals-summary">
                    <h5>Individual Recipients ({selectedRecipients.length})</h5>
                    <div className="selected-recipients-preview">
                      {selectedRecipients.slice(0, 5).map(recipientId => {
                        const recipient = recipients.find(r => r.recipient_id === recipientId);
                        return recipient ? (
                          <div key={recipientId} className="selected-recipient-item">
                            <span className="material-icons">person</span>
                            <span>{recipient.email}</span>
                          </div>
                        ) : null;
                      })}
                      {selectedRecipients.length > 5 && (
                        <div className="more-recipients">
                          +{selectedRecipients.length - 5} more recipients
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="recipients-total">
                  <strong>Total:</strong> {getTotalRecipientCount()} recipients will receive this campaign
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignRecipientsSelection;