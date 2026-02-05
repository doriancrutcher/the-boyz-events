import React, { useState, useEffect } from 'react';
import { getPendingRequests, updateRequestStatus } from '../services/eventRequestService';
import { getPendingEdits, updateEditStatus } from '../services/eventEditService';
import { useAuth } from '../contexts/AuthContext';
import { trackEventRequestApproval, trackEditRequestDecision, trackAdminAction } from '../services/analyticsService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'edits'
  const [requests, setRequests] = useState([]);
  const [edits, setEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEdit, setSelectedEdit] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);


  const loadData = async () => {
    try {
      setLoading(true);
      const [pendingRequests, pendingEdits] = await Promise.all([
        getPendingRequests(),
        getPendingEdits()
      ]);
      setRequests(pendingRequests);
      setEdits(pendingEdits);
      
      // Check for highlighted request/edit from notification click
      const highlightRequestId = sessionStorage.getItem('highlightRequestId');
      const highlightEditId = sessionStorage.getItem('highlightEditId');
      
      if (highlightRequestId) {
        // Switch to requests tab and find the request
        setActiveTab('requests');
        const request = pendingRequests.find(r => r.id === highlightRequestId);
        if (request) {
          setTimeout(() => {
            setSelectedRequest(request);
            sessionStorage.removeItem('highlightRequestId');
          }, 100);
        }
      } else if (highlightEditId) {
        // Switch to edits tab and find the edit
        setActiveTab('edits');
        const edit = pendingEdits.find(e => e.id === highlightEditId);
        if (edit) {
          setTimeout(() => {
            setSelectedEdit(edit);
            sessionStorage.removeItem('highlightEditId');
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (requestId) => {
    setProcessing(true);
    try {
      await updateRequestStatus(requestId, 'approved', adminNotes);
      trackEventRequestApproval(requestId, true);
      trackAdminAction('approve_event_request', { request_id: requestId });
      await loadData();
      setSelectedRequest(null);
      setAdminNotes('');
      alert('Event request approved!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setProcessing(true);
    try {
      await updateRequestStatus(requestId, 'rejected', adminNotes);
      trackEventRequestApproval(requestId, false);
      trackAdminAction('reject_event_request', { request_id: requestId });
      await loadData();
      setSelectedRequest(null);
      setAdminNotes('');
      alert('Event request rejected.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveEdit = async (editId) => {
    setProcessing(true);
    try {
      await updateEditStatus(editId, 'approved', adminNotes);
      trackEditRequestDecision(editId, true);
      trackAdminAction('approve_edit_request', { edit_id: editId });
      await loadData();
      setSelectedEdit(null);
      setAdminNotes('');
      alert('Edit approved and applied!');
    } catch (error) {
      console.error('Error approving edit:', error);
      alert('Failed to approve edit');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectEdit = async (editId) => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setProcessing(true);
    try {
      await updateEditStatus(editId, 'rejected', adminNotes);
      trackEditRequestDecision(editId, false);
      trackAdminAction('reject_edit_request', { edit_id: editId });
      await loadData();
      setSelectedEdit(null);
      setAdminNotes('');
      alert('Edit rejected.');
    } catch (error) {
      console.error('Error rejecting edit:', error);
      alert('Failed to reject edit');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return <div className="admin-dashboard-loading">Loading requests...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Event Requests ({requests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'edits' ? 'active' : ''}`}
          onClick={() => setActiveTab('edits')}
        >
          Edit Requests ({edits.length})
        </button>
      </div>

      {activeTab === 'requests' ? (
        <>
          <p className="dashboard-description">
            Review and approve/reject event requests from users.
          </p>

          {requests.length === 0 ? (
            <div className="no-requests">No pending event requests.</div>
          ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h3>{request.title}</h3>
                <span className="request-status pending">Pending</span>
              </div>
              
              <div className="request-details">
                <div className="detail-row">
                  <strong>Submitted by:</strong> {request.userEmail}
                </div>
                <div className="detail-row">
                  <strong>Event Date:</strong> {formatDate(request.eventDate)}
                </div>
                {request.eventTime && (
                  <div className="detail-row">
                    <strong>Time:</strong> {request.eventTime}
                  </div>
                )}
                {request.location && (
                  <div className="detail-row">
                    <strong>Location:</strong> {request.location}
                  </div>
                )}
                {request.description && (
                  <div className="detail-row">
                    <strong>Description:</strong>
                    <p>{request.description}</p>
                  </div>
                )}
                {request.flyerUrl && (
                  <div className="detail-row">
                    <strong>Flyer:</strong>
                    <img src={request.flyerUrl} alt="Event flyer" className="flyer-image" />
                  </div>
                )}
                <div className="detail-row">
                  <strong>Submitted:</strong> {formatDate(request.createdAt)}
                </div>
              </div>

              <div className="request-actions">
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="review-btn"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <div className="modal-overlay" onClick={() => !processing && setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Review Event Request</h3>
            <div className="modal-details">
              <p><strong>Title:</strong> {selectedRequest.title}</p>
              <p><strong>From:</strong> {selectedRequest.userEmail}</p>
              <p><strong>Date:</strong> {formatDate(selectedRequest.eventDate)}</p>
              {selectedRequest.flyerUrl && (
                <div>
                  <strong>Flyer:</strong>
                  <img src={selectedRequest.flyerUrl} alt="Flyer" className="modal-flyer" />
                </div>
              )}
            </div>
            
            <div className="admin-notes">
              <label>Admin Notes (required for rejection):</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this request (required for rejection)..."
                className="notes-textarea"
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => handleApprove(selectedRequest.id)}
                disabled={processing}
                className="approve-btn"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                disabled={processing || !adminNotes.trim()}
                className="reject-btn"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setAdminNotes('');
                }}
                disabled={processing}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        <>
          <p className="dashboard-description">
            Review and approve/reject event edit requests from users.
          </p>

          {edits.length === 0 ? (
            <div className="no-requests">No pending edit requests.</div>
          ) : (
            <div className="requests-list">
              {edits.map((edit) => (
                <div key={edit.id} className="request-card">
                  <div className="request-header">
                    <h3>{edit.proposedChanges.title || 'Event Edit'}</h3>
                    <span className="request-status pending">Pending</span>
                  </div>
                  
                  <div className="request-details">
                    <div className="detail-row">
                      <strong>Submitted by:</strong> {edit.userEmail}
                    </div>
                    <div className="detail-row">
                      <strong>Event ID:</strong> {edit.eventId}
                    </div>
                    <div className="detail-row">
                      <strong>Changes:</strong>
                      <div className="changes-comparison">
                        {edit.proposedChanges.chatUrl !== undefined && (
                          <div>
                            <strong>Chat URL:</strong> {edit.proposedChanges.chatUrl || '(removed)'}
                          </div>
                        )}
                        {edit.proposedChanges.partifulLink !== undefined && (
                          <div>
                            <strong>Partiful Link:</strong> {edit.proposedChanges.partifulLink || '(removed)'}
                          </div>
                        )}
                        {edit.proposedChanges.instaHandle !== undefined && (
                          <div>
                            <strong>Instagram:</strong> @{edit.proposedChanges.instaHandle || '(removed)'}
                          </div>
                        )}
                        {edit.proposedChanges.eventOwner !== undefined && (
                          <div>
                            <strong>Owner:</strong> {edit.proposedChanges.eventOwner || '(removed)'}
                          </div>
                        )}
                        {edit.proposedChanges.location && (
                          <div>
                            <strong>Location:</strong> {edit.proposedChanges.location}
                          </div>
                        )}
                        {edit.proposedChanges.description && (
                          <div>
                            <strong>Description:</strong> {edit.proposedChanges.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="detail-row">
                      <strong>Submitted:</strong> {formatDate(edit.createdAt)}
                    </div>
                  </div>

                  <div className="request-actions">
                    <button
                      onClick={() => setSelectedEdit(edit)}
                      className="review-btn"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedEdit && (
            <div className="modal-overlay" onClick={() => !processing && setSelectedEdit(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Review Edit Request</h3>
                <div className="modal-details">
                  <p><strong>From:</strong> {selectedEdit.userEmail}</p>
                  <p><strong>Event ID:</strong> {selectedEdit.eventId}</p>
                  <div className="changes-comparison">
                    <h4>Proposed Changes:</h4>
                    {selectedEdit.proposedChanges.chatUrl !== undefined && (
                      <p><strong>Chat URL:</strong> {selectedEdit.proposedChanges.chatUrl || '(removed)'}</p>
                    )}
                    {selectedEdit.proposedChanges.partifulLink !== undefined && (
                      <p><strong>Partiful Link:</strong> {selectedEdit.proposedChanges.partifulLink || '(removed)'}</p>
                    )}
                    {selectedEdit.proposedChanges.instaHandle !== undefined && (
                      <p><strong>Instagram:</strong> @{selectedEdit.proposedChanges.instaHandle || '(removed)'}</p>
                    )}
                    {selectedEdit.proposedChanges.eventOwner !== undefined && (
                      <p><strong>Owner:</strong> {selectedEdit.proposedChanges.eventOwner || '(removed)'}</p>
                    )}
                    {selectedEdit.proposedChanges.location && (
                      <p><strong>Location:</strong> {selectedEdit.proposedChanges.location}</p>
                    )}
                    {selectedEdit.proposedChanges.description && (
                      <p><strong>Description:</strong> {selectedEdit.proposedChanges.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="admin-notes">
                  <label>Admin Notes (required for rejection):</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this edit..."
                    className="notes-textarea"
                    rows="4"
                  />
                </div>

                <div className="modal-actions">
                  <button
                    onClick={() => handleApproveEdit(selectedEdit.id)}
                    disabled={processing}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectEdit(selectedEdit.id)}
                    disabled={processing || !adminNotes.trim()}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEdit(null);
                      setAdminNotes('');
                    }}
                    disabled={processing}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
