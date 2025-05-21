// src/components/auth/ApiTest.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ApiTest.css';

const ApiTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [testResults, setTestResults] = useState(null);
  
  // Define a list of common backend URLs to test
  const urlsToTest = [
    'http://localhost:5000/api',
    'http://127.0.0.1:5000/api',
    'http://localhost:5000',
    'http://localhost:8000/api',
    'http://127.0.0.1:8000/api',
    '/api',
    'http://localhost:3000/api'
  ];

  useEffect(() => {
    const testUrls = async () => {
      setLoading(true);
      const testResults = [];
      
      for (const baseUrl of urlsToTest) {
        try {
          // Test with a simple GET request with no auth
          const result = { 
            url: baseUrl, 
            status: 'testing...'
          };
          testResults.push(result);
          setResults([...testResults]);
          
          // Try multiple endpoints to see if any respond
          const endpoints = [
            '/health-check',
            '/ping',
            '/health',
            '/status',
            ''
          ];
          
          let success = false;
          for (const endpoint of endpoints) {
            if (success) break;
            
            try {
              const url = `${baseUrl}${endpoint}`;
              console.log(`Testing URL: ${url}`);
              
              const response = await axios.get(url, {
                timeout: 3000,
                headers: { 'Accept': 'application/json' }
              });
              
              if (response.status >= 200 && response.status < 500) {
                result.status = 'reachable';
                result.statusCode = response.status;
                result.endpoint = endpoint;
                result.responseData = JSON.stringify(response.data).substring(0, 100);
                success = true;
                break;
              }
            } catch (endpointError) {
              // If we get a 404 or other specific status code, the server is reachable
              // but that specific endpoint doesn't exist
              if (endpointError.response) {
                result.status = 'reachable';
                result.statusCode = endpointError.response.status;
                result.endpoint = endpoint;
                result.error = `${endpointError.message}`;
                success = true;
                break;
              }
            }
          }
          
          if (!success) {
            result.status = 'unreachable';
            result.error = 'All endpoints failed';
          }
          
        } catch (error) {
          const result = { 
            url: baseUrl, 
            status: 'unreachable',
            error: error.message
          };
          testResults.push(result);
        }
        
        // Update the state with the latest results
        setResults([...testResults]);
      }
      
      setLoading(false);
    };
    
    testUrls();
  }, []);

  const testCustomEndpoint = async () => {
    if (!customUrl) return;
    
    setTestResults({ status: 'testing' });
    
    try {
      const response = await axios.get(customUrl, {
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      
      setTestResults({
        status: 'success',
        statusCode: response.status,
        data: response.data
      });
    } catch (error) {
      let errorResult = {
        status: 'error',
        message: error.message
      };
      
      if (error.response) {
        errorResult.statusCode = error.response.status;
        errorResult.data = error.response.data;
      }
      
      setTestResults(errorResult);
    }
  };

  const testWithCredentials = async () => {
    if (!selectedUrl) {
      alert('Please select a URL first');
      return;
    }
    
    setTestResults({ status: 'testing' });
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${selectedUrl}/dashboard`, {
        timeout: 5000,
        headers: { 
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        withCredentials: true
      });
      
      setTestResults({
        status: 'success',
        statusCode: response.status,
        data: response.data
      });
    } catch (error) {
      let errorResult = {
        status: 'error',
        message: error.message
      };
      
      if (error.response) {
        errorResult.statusCode = error.response.status;
        errorResult.data = error.response.data;
      }
      
      setTestResults(errorResult);
    }
  };

  return (
    <div className="api-test-container">
      <h2>API Connection Test</h2>
      <p>This tool checks if your React app can reach the backend API server.</p>
      
      <div className="test-results">
        <h3>Testing API Endpoints:</h3>
        {loading ? (
          <div className="loading">
            <div className="loader"></div>
            <p>Testing API endpoints...</p>
          </div>
        ) : (
          <div className="url-results">
            <table>
              <thead>
                <tr>
                  <th>Base URL</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className={`result-row ${result.status}`}>
                    <td>{result.url}</td>
                    <td>
                      <span className={`status-badge ${result.status}`}>
                        {result.status}
                      </span>
                    </td>
                    <td>
                      {result.status === 'reachable' ? (
                        <div>
                          <div>Status: {result.statusCode}</div>
                          {result.endpoint && <div>Endpoint: {result.endpoint}</div>}
                          {result.responseData && <div>Response: {result.responseData}</div>}
                        </div>
                      ) : (
                        <div className="error-message">{result.error}</div>
                      )}
                    </td>
                    <td>
                      {result.status === 'reachable' && (
                        <button 
                          className="use-url-button"
                          onClick={() => setSelectedUrl(result.url)}
                        >
                          Use This URL
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="manual-test-section">
        <h3>Test Custom Endpoint</h3>
        <div className="input-group">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Enter full URL to test (e.g., http://localhost:5000/api/health-check)"
          />
          <button onClick={testCustomEndpoint}>Test</button>
        </div>
        
        <h3>Test With Authentication</h3>
        <div className="auth-test-section">
          <div>
            <label>Selected API URL:</label>
            <input 
              type="text" 
              value={selectedUrl} 
              onChange={(e) => setSelectedUrl(e.target.value)}
              placeholder="Select a URL from the results or enter one"
            />
          </div>
          <button onClick={testWithCredentials}>Test With Auth Token</button>
        </div>
      </div>
      
      {testResults && (
        <div className={`test-output ${testResults.status}`}>
          <h3>Test Results:</h3>
          {testResults.status === 'testing' ? (
            <div className="loading">
              <div className="loader"></div>
              <p>Testing...</p>
            </div>
          ) : testResults.status === 'success' ? (
            <div>
              <div className="result-row">
                <strong>Status:</strong> {testResults.statusCode}
              </div>
              <div className="result-row">
                <strong>Response Data:</strong>
                <pre>{JSON.stringify(testResults.data, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div>
              <div className="result-row">
                <strong>Error:</strong> {testResults.message}
              </div>
              {testResults.statusCode && (
                <div className="result-row">
                  <strong>Status Code:</strong> {testResults.statusCode}
                </div>
              )}
              {testResults.data && (
                <div className="result-row">
                  <strong>Response Data:</strong>
                  <pre>{JSON.stringify(testResults.data, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="troubleshooting-tips">
        <h3>Troubleshooting Tips</h3>
        <ul>
          <li>Make sure your Flask backend is running on the expected port (usually 5000)</li>
          <li>Check if CORS is properly configured on your backend</li>
          <li>Verify that your API routes are correctly defined</li>
          <li>Check network tab in developer tools for more detailed error information</li>
          <li>Make sure any proxies or firewalls aren't blocking the connection</li>
          <li>If using Docker or containers, ensure proper port forwarding</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest;