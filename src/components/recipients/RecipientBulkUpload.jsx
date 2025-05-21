// Improved src/components/recipients/RecipientBulkUpload.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RecipientService from '../../services/recipient.service';
import './RecipientBulkUpload.css';

const RecipientBulkUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [csvContent, setCsvContent] = useState('');
  const [parsedRecipients, setParsedRecipients] = useState([]);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [step, setStep] = useState(1); // 1: upload, 2: review, 3: complete

  // Set page title on component mount
  useEffect(() => {
    document.title = 'Import Recipients | Email Campaign Manager';
    
    return () => {
      // Reset title when component unmounts
      document.title = 'Email Campaign Manager';
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      readFile(selectedFile);
    }
  };

  const readFile = (file) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        setCsvContent(content);
        
        // Parse CSV using the utility function
        const recipients = RecipientService.parseCSV(content);
        
        if (recipients.length === 0) {
          setError('No valid recipients found in the CSV file. Please check the format.');
          setIsProcessing(false);
          return;
        }
        
        setParsedRecipients(recipients);
        setIsUploaded(true);
        setStep(2); // Move to review step
        
        // Scroll to top when moving to next step
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError('Error parsing CSV file. Please check the format and try again.');
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'text/csv' && !droppedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      
      setFile(droppedFile);
      setError(null);
      readFile(droppedFile);
    }
  };

  const handleImport = async () => {
    if (parsedRecipients.length === 0) {
      setError('No recipients to import');
      return;
    }
    
    try {
      setIsImporting(true);
      setError(null);
      
      // Process recipients to ensure name field is set for display in the list
      const processedRecipients = parsedRecipients.map(recipient => {
        // Create a copy to avoid mutating the original
        const processed = { ...recipient };
        
        // If first_name and last_name exist but "name" doesn't, create it
        if ((processed.first_name || processed.last_name) && !processed.name) {
          processed.name = [processed.first_name, processed.last_name]
            .filter(Boolean)
            .join(' ');
        }
        
        return processed;
      });
      
      const response = await RecipientService.createBulkRecipients(processedRecipients);
      
      setSuccess(`Successfully imported ${response.created_count} recipients. ${response.skipped_count} duplicates were skipped.`);
      setStep(3); // Move to complete step
      
      // Scroll to top when moving to next step
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to import recipients. Please try again.');
      console.error(err);
      
      // Scroll to top to show error
      window.scrollTo(0, 0);
    } finally {
      setIsImporting(false);
    }
  };

  // Function to handle template download
  const handleDownloadTemplate = () => {
    // Create CSV content for the template with proper headers
    const csvTemplate = 'email,first_name,last_name,company,position,name\nexample@example.com,John,Doe,Acme Inc.,Marketing Manager,John Doe';
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'recipients_template.csv');
    
    // Add the link to the document, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Revoke the URL to free up memory
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const renderUploadStep = () => (
    <div className="upload-step">
      <div className="upload-info">
        <h2>Import Recipients</h2>
        <p>Upload a CSV file with your recipients' information. This will allow you to add multiple recipients at once instead of adding them one by one.</p>
        <div className="csv-format">
          <h3>CSV Format</h3>
          <p>Your CSV file should include these columns:</p>
          <div className="csv-example">
            <code>email,first_name,last_name,company,position</code>
          </div>
          <p>Only the email column is required. Other columns are optional.</p>
          <button 
            onClick={handleDownloadTemplate} 
            className="download-template"
            type="button"
          >
            <span className="material-icons">download</span>
            Download Template
          </button>
        </div>
      </div>
      
      <div 
        className={`upload-area ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="upload-processing">
            <div className="loader"></div>
            <p>Processing file...</p>
          </div>
        ) : (
          <>
            <span className="material-icons upload-icon">cloud_upload</span>
            <h3>Drag & Drop CSV File Here</h3>
            <p>or</p>
            <label className="file-input-label">
              <span className="material-icons">folder_open</span>
              Browse Files
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input"
              />
            </label>
            {file && <p className="selected-file">{file.name}</p>}
          </>
        )}
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="review-step">
      <h2>Review Recipients</h2>
      <p>Review the recipients before importing. We found {parsedRecipients.length} recipients in your CSV file.</p>
      
      <div className="recipients-preview">
        <div className="preview-header">
          <div className="email-col">Email</div>
          <div className="name-col">Name</div>
          <div className="company-col">Company</div>
          <div className="position-col">Position</div>
        </div>
        
        <div className="preview-body">
          {parsedRecipients.slice(0, 10).map((recipient, index) => {
            // Generate a display name from first_name and last_name if not provided
            const displayName = recipient.name || 
              ((recipient.first_name || recipient.last_name) ? 
                `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() : 
                <span className="empty-value">—</span>);
                
            return (
              <div key={index} className="preview-row">
                <div className="email-col">{recipient.email}</div>
                <div className="name-col">{displayName}</div>
                <div className="company-col">
                  {recipient.company || <span className="empty-value">—</span>}
                </div>
                <div className="position-col">
                  {recipient.position || <span className="empty-value">—</span>}
                </div>
              </div>
            );
          })}
          
          {parsedRecipients.length > 10 && (
            <div className="preview-more">
              <p>+ {parsedRecipients.length - 10} more recipients</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="review-actions">
        <button 
          className="back-button"
          onClick={() => setStep(1)}
          disabled={isImporting}
        >
          <span className="material-icons">arrow_back</span>
          Back
        </button>
        
        <button 
          className={`import-button ${isImporting ? 'loading' : ''}`}
          onClick={handleImport}
          disabled={isImporting}
        >
          {isImporting ? 'Importing...' : 'Import Recipients'}
        </button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="complete-step">
      <div className="success-icon">
        <span className="material-icons">check_circle</span>
      </div>
      <h2>Import Complete!</h2>
      <p>{success}</p>
      
      <div className="complete-actions">
        <Link to="/recipients" className="view-recipients-button">
          <span className="material-icons">people</span>
          View Recipients
        </Link>
        <button 
          className="import-more-button"
          onClick={() => {
            setFile(null);
            setCsvContent('');
            setParsedRecipients([]);
            setIsUploaded(false);
            setSuccess(null);
            setError(null);
            setStep(1);
          }}
        >
          <span className="material-icons">upload_file</span>
          Import More Recipients
        </button>
      </div>
    </div>
  );

  return (
    <div className="recipient-bulk-upload-container">
      <div className="recipient-bulk-upload-header">
        <Link to="/recipients" className="back-button">
          <span className="material-icons">arrow_back</span>
          Back to Recipients
        </Link>
        <h1>Import Recipients</h1>
      </div>
      
      <div className="upload-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">
            {step > 1 ? <span className="material-icons">check</span> : 1}
          </div>
          <div className="step-label">Upload</div>
        </div>
        
        <div className="step-connector"></div>
        
        <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">
            {step > 2 ? <span className="material-icons">check</span> : 2}
          </div>
          <div className="step-label">Review</div>
        </div>
        
        <div className="step-connector"></div>
        
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Complete</div>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <span className="material-icons">error_outline</span>
          <p>{error}</p>
        </div>
      )}
      
      <div className="recipient-bulk-upload-content">
        {step === 1 && renderUploadStep()}
        {step === 2 && renderReviewStep()}
        {step === 3 && renderCompleteStep()}
      </div>
    </div>
  );
};

export default RecipientBulkUpload;