// Enhanced src/components/campaigns/EmailEditor.jsx
import React, { useState, useRef, useEffect } from 'react';
import './EmailEditor.css';

const EmailEditor = ({ initialHtml, onChange }) => {
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' or 'code'
  const [html, setHtml] = useState(initialHtml || '');
  const [previewMode, setPreviewMode] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toolbarActive, setToolbarActive] = useState(true); // Set to true by default for better visibility
  
  const editorRef = useRef(null);
  const iframeLoaded = useRef(false);
  const editorContainerRef = useRef(null);

  useEffect(() => {
    if (initialHtml && !html) {
      setHtml(initialHtml);
    }
    
    // Add event listener for window resize to adjust editor height
    const handleResize = () => {
      updateEditorHeight();
    };
    
    window.addEventListener('resize', handleResize);
    updateEditorHeight();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initialHtml, html]);
  
  // Update editor height to fill available space
  const updateEditorHeight = () => {
    if (editorContainerRef.current) {
      const windowHeight = window.innerHeight;
      const containerTop = editorContainerRef.current.getBoundingClientRect().top;
      const footerHeight = 100; // Estimated footer height
      
      // Calculate available height
      const availableHeight = windowHeight - containerTop - footerHeight;
      
      // Set minimum height
      const minHeight = 550; // Increased for better editor experience
      const editorHeight = Math.max(availableHeight, minHeight);
      
      // Apply height
      editorContainerRef.current.style.height = `${editorHeight}px`;
    }
  };

  const handleHtmlChange = (newHtml) => {
    setHtml(newHtml);
    setUnsavedChanges(true);
    if (onChange) {
      onChange(newHtml);
    }
  };

  const handleCodeEditorChange = (e) => {
    handleHtmlChange(e.target.value);
  };

  const execCommand = (command, value = null) => {
    if (editorRef.current && editorRef.current.contentDocument) {
      // Make sure editor is focused before executing commands
      editorRef.current.contentWindow.focus();
      
      try {
        editorRef.current.contentDocument.execCommand(command, false, value);
        // Get updated HTML and update state
        const newHtml = editorRef.current.contentDocument.body.innerHTML;
        handleHtmlChange(newHtml);
        
        // Refocus after command to make sure cursor stays in editor
        setTimeout(() => {
          if (editorRef.current && editorRef.current.contentWindow) {
            editorRef.current.contentWindow.focus();
          }
        }, 0);
      } catch (error) {
        console.error("Error executing command:", error);
        showNotification('error', 'Failed to execute editor command');
      }
    }
  };

  // Show a notification with auto-dismiss
  const showNotification = (type, message) => {
    setNotification({ type, message });
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const toggleBold = () => execCommand('bold');
  const toggleItalic = () => execCommand('italic');
  const toggleUnderline = () => execCommand('underline');
  
  const createLink = () => {
    const selection = editorRef.current.contentWindow.getSelection();
    const url = prompt('Enter a URL:', 'http://');
    if (url) {
      // If nothing is selected, prompt for link text
      if (selection.toString().trim() === '') {
        const linkText = prompt('Enter link text:', 'Link text');
        if (linkText) {
          // Insert link text and select it
          const range = selection.getRangeAt(0);
          const textNode = document.createTextNode(linkText);
          range.insertNode(textNode);
          
          range.selectNodeContents(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Now create the link
          execCommand('createLink', url);
        }
      } else {
        // Create link from selection
        execCommand('createLink', url);
      }
    }
  };
  
  const formatBlock = (blockType) => execCommand('formatBlock', blockType);
  
  const insertImage = () => {
    const url = prompt('Enter the image URL:', 'https://');
    if (url) {
      execCommand('insertImage', url);
    }
  };
  
  const setTextColor = () => {
    const color = document.getElementById('text-color-picker').value;
    execCommand('foreColor', color);
  };
  
  const setBackgroundColor = () => {
    const color = document.getElementById('bg-color-picker').value;
    execCommand('hiliteColor', color);
  };
  
  const alignText = (alignment) => execCommand(`justify${alignment}`);
  const insertList = (listType) => execCommand(`insert${listType}List`);
  
  const insertTable = () => {
    const rows = prompt('Enter number of rows:', '3');
    const cols = prompt('Enter number of columns:', '3');
    
    if (rows && cols) {
      const numRows = parseInt(rows);
      const numCols = parseInt(cols);
      
      if (isNaN(numRows) || isNaN(numCols) || numRows < 1 || numCols < 1) {
        alert('Please enter valid numbers for rows and columns');
        return;
      }
      
      let tableHtml = '<table style="width:100%; border-collapse: collapse;">';
      
      // Create header row
      tableHtml += '<thead><tr>';
      for (let j = 0; j < numCols; j++) {
        tableHtml += '<th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Header ' + (j + 1) + '</th>';
      }
      tableHtml += '</tr></thead><tbody>';
      
      // Create data rows
      for (let i = 0; i < numRows - 1; i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < numCols; j++) {
          tableHtml += '<td style="border: 1px solid #ccc; padding: 8px;">Cell ' + (i + 1) + ',' + (j + 1) + '</td>';
        }
        tableHtml += '</tr>';
      }
      
      tableHtml += '</tbody></table><p><br></p>';
      
      // Insert the table at cursor position
      if (editorRef.current && editorRef.current.contentDocument) {
        editorRef.current.contentDocument.execCommand('insertHTML', false, tableHtml);
        
        // Get updated HTML and update state
        const newHtml = editorRef.current.contentDocument.body.innerHTML;
        handleHtmlChange(newHtml);
      }
    }
  };
  
  const saveTemplate = () => {
    try {
      // This would typically call an API endpoint to save the template
      // For now, we'll just show a success notification
      showNotification('success', 'Template saved successfully!');
      setUnsavedChanges(false);
    } catch (error) {
      showNotification('error', 'Failed to save template');
    }
  };

  const handleModeToggle = () => {
    if (editorMode === 'visual') {
      // Switching to code mode - get the content from the iframe
      if (editorRef.current && editorRef.current.contentDocument) {
        handleHtmlChange(editorRef.current.contentDocument.body.innerHTML);
      }
      setEditorMode('code');
      setPreviewMode(false);
    } else {
      // Switching to visual mode
      setEditorMode('visual');
      setPreviewMode(false);
      // The iframe will be updated with the current HTML when it loads
    }
  };

  const handlePreviewToggle = () => {
    if (!previewMode) {
      // If switching to preview mode from visual editor, make sure we have the latest HTML
      if (editorMode === 'visual' && editorRef.current && editorRef.current.contentDocument) {
        handleHtmlChange(editorRef.current.contentDocument.body.innerHTML);
      }
    }
    setPreviewMode(!previewMode);
  };
  
  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
    
    // Adjust editor height after toggle
    setTimeout(updateEditorHeight, 100);
  };

  // Initialize the iframe editor
  useEffect(() => {
    // Only run this effect when in visual mode and not in preview mode
    if (editorMode !== 'visual' || previewMode) {
      return;
    }
    
    const setupIframe = () => {
      const iframe = editorRef.current;
      if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
        // If the iframe is not ready yet, try again in a moment
        setTimeout(setupIframe, 50);
        return;
      }
      
      // Set design mode to enable editing
      iframe.contentDocument.designMode = 'on';
      
      // Set initial content
      iframe.contentDocument.body.innerHTML = html;
      
      // Add event listener to track changes
      const handleInput = () => {
        const newHtml = iframe.contentDocument.body.innerHTML;
        handleHtmlChange(newHtml);
      };
      
      // Handle backspace and other keyboard events
      const handleKeyDown = (e) => {
        // We specifically need to override the default backspace behavior
        // to prevent the cursor from jumping unexpectedly
        if (e.key === 'Backspace') {
          const selection = iframe.contentWindow.getSelection();
          if (!selection.rangeCount) return; // No range selected
          
          const range = selection.getRangeAt(0);
          
          // Only handle backspace if we're not at the beginning of a line or element
          if (range.startOffset === 0 && !range.collapsed) {
            // Let the default behavior handle selected text deletion
            return;
          }
          
          if (range.startOffset === 0) {
            // If at the beginning of an element, the default behavior might cause issues
            // Check if we're at the beginning of the content
            const startContainer = range.startContainer;
            
            // If not at the beginning of the document, let default behavior work
            if (startContainer.previousSibling || 
               (startContainer.parentNode && 
                startContainer.parentNode.previousSibling)) {
              return;
            }
            
            // If we're at the very beginning, prevent default and do nothing
            if (range.startOffset === 0 && 
                !startContainer.previousSibling && 
                (!startContainer.parentNode || !startContainer.parentNode.previousSibling)) {
              e.preventDefault();
              return;
            }
          }
        }
      };
      
      // Handle click events to activate/deactivate toolbar
      const handleClick = () => {
        setToolbarActive(true);
        if (editorRef.current && editorRef.current.contentWindow) {
          editorRef.current.contentWindow.focus();
        }
      };
      
      // Handle blur events
      const handleBlur = () => {
        // Commented out to keep toolbar always visible
        // setTimeout(() => {
        //   setToolbarActive(false);
        // }, 200);
      };
      
      // Remove any existing listeners to avoid duplicates
      iframe.contentDocument.removeEventListener('input', handleInput);
      iframe.contentDocument.removeEventListener('keydown', handleKeyDown);
      iframe.contentDocument.removeEventListener('click', handleClick);
      iframe.contentDocument.removeEventListener('blur', handleBlur);
      
      // Add our event listeners
      iframe.contentDocument.addEventListener('input', handleInput);
      iframe.contentDocument.addEventListener('keydown', handleKeyDown);
      iframe.contentDocument.addEventListener('click', handleClick);
      iframe.contentDocument.addEventListener('blur', handleBlur);
      
      // Basic styles for the editor
      const style = iframe.contentDocument.createElement('style');
      style.textContent = `
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          line-height: 1.6;
          color: #333;
          margin: 0;
          min-height: 100%;
          caret-color: #4A90E2;
          height: 100%;
        }
        
        a {
          color: #4A90E2;
        }
        
        img {
          max-width: 100%;
          height: auto;
        }
        
        h1, h2, h3, h4, h5, h6 {
          margin-top: 16px;
          margin-bottom: 12px;
          color: #222;
          font-weight: 600;
        }
        
        p {
          margin-bottom: 16px;
        }
        
        blockquote {
          border-left: 3px solid #ccc;
          padding-left: 16px;
          margin-left: 0;
          color: #666;
        }
        
        ul, ol {
          padding-left: 20px;
          margin-bottom: 16px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: #f5f5f5;
        }
        
        :focus {
          outline: none;
        }
      `;
      iframe.contentDocument.head.appendChild(style);
      
      // Set focus to the editor
      iframe.contentWindow.focus();
      
      // Mark as loaded
      iframeLoaded.current = true;
    };
    
    // Start the setup process
    setupIframe();
    
    // Clean up function
    return () => {
      if (editorRef.current && editorRef.current.contentDocument) {
        // Remove event listeners when component unmounts or mode changes
        const doc = editorRef.current.contentDocument;
        doc.removeEventListener('input', () => {});
        doc.removeEventListener('keydown', () => {});
        doc.removeEventListener('click', () => {});
        doc.removeEventListener('blur', () => {});
      }
    };
  }, [editorMode, previewMode, html]);

  // Add a useEffect to handle cursor position and selection
  useEffect(() => {
    if (editorMode === 'visual' && !previewMode && editorRef.current && editorRef.current.contentDocument) {
      // This will help maintain proper selection and cursor position
      const handleSelectionChange = () => {
        // Just having this listener helps the browser maintain proper selection state
        // No need to actually do anything here
      };
      
      const doc = editorRef.current.contentDocument;
      doc.addEventListener('selectionchange', handleSelectionChange);
      
      return () => {
        if (doc) {
          doc.removeEventListener('selectionchange', handleSelectionChange);
        }
      };
    }
  }, [editorMode, previewMode]);
  
  // Update iframe content when html changes and iframe is already initialized
  useEffect(() => {
    if (
      editorMode === 'visual' && 
      !previewMode && 
      editorRef.current && 
      editorRef.current.contentDocument && 
      iframeLoaded.current
    ) {
      // Only update if the iframe is loaded and html has changed externally
      // (not from the iframe itself)
      const currentHtml = editorRef.current.contentDocument.body.innerHTML;
      if (currentHtml !== html) {
        editorRef.current.contentDocument.body.innerHTML = html;
      }
    }
  }, [html, editorMode, previewMode]);

  const renderEditor = () => {
    if (editorMode === 'visual') {
      if (previewMode) {
        // Preview mode
        return (
          <div className="editor-preview">
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><style>
                body {
                  font-family: Arial, sans-serif;
                  padding: 20px;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                }
                a { color: #4A90E2; }
                img { max-width: 100%; }
                h1, h2, h3, h4, h5, h6 {
                  margin-top: 16px;
                  margin-bottom: 8px;
                  color: #222;
                }
                p { margin-bottom: 16px; }
                blockquote {
                  border-left: 3px solid #ccc;
                  padding-left: 16px;
                  margin-left: 0;
                  color: #666;
                }
                ul, ol { padding-left: 20px; }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 16px;
                }
                th, td {
                  border: 1px solid #ccc;
                  padding: 8px;
                  text-align: left;
                }
                th { background-color: #f5f5f5; }
              </style></head><body>${html}</body></html>`}
              title="Email Preview"
              className="preview-iframe"
            ></iframe>
          </div>
        );
      } else {
        // Visual editor mode
        return (
          <div className="editor-visual">
            <div className={`editor-toolbar ${toolbarActive ? 'active' : ''}`}>
              <div className="toolbar-group formatting">
                <button type="button" onClick={toggleBold} title="Bold" className="toolbar-button">
                  <span className="material-icons">format_bold</span>
                </button>
                <button type="button" onClick={toggleItalic} title="Italic" className="toolbar-button">
                  <span className="material-icons">format_italic</span>
                </button>
                <button type="button" onClick={toggleUnderline} title="Underline" className="toolbar-button">
                  <span className="material-icons">format_underlined</span>
                </button>
              </div>
              
              <div className="toolbar-group headings">
                <button type="button" onClick={() => formatBlock('h1')} title="Heading 1" className="toolbar-button">
                  <span className="material-icons">title</span>
                </button>
                <button type="button" onClick={() => formatBlock('h2')} title="Heading 2" className="toolbar-button">
                  <span className="material-icons">format_size</span>
                </button>
                <button type="button" onClick={() => formatBlock('h3')} title="Heading 3" className="toolbar-button">
                  <span className="heading-text">H3</span>
                </button>
                <button type="button" onClick={() => formatBlock('p')} title="Paragraph" className="toolbar-button">
                  <span className="material-icons">notes</span>
                </button>
              </div>
              
              <div className="toolbar-group alignment">
                <button type="button" onClick={() => alignText('Left')} title="Align Left" className="toolbar-button">
                  <span className="material-icons">format_align_left</span>
                </button>
                <button type="button" onClick={() => alignText('Center')} title="Align Center" className="toolbar-button">
                  <span className="material-icons">format_align_center</span>
                </button>
                <button type="button" onClick={() => alignText('Right')} title="Align Right" className="toolbar-button">
                  <span className="material-icons">format_align_right</span>
                </button>
                <button type="button" onClick={() => alignText('Full')} title="Justify" className="toolbar-button">
                  <span className="material-icons">format_align_justify</span>
                </button>
              </div>
              
              <div className="toolbar-group lists">
                <button type="button" onClick={() => insertList('Ordered')} title="Numbered List" className="toolbar-button">
                  <span className="material-icons">format_list_numbered</span>
                </button>
                <button type="button" onClick={() => insertList('Unordered')} title="Bulleted List" className="toolbar-button">
                  <span className="material-icons">format_list_bulleted</span>
                </button>
              </div>
              
              <div className="toolbar-group insert">
                <button type="button" onClick={createLink} title="Insert Link" className="toolbar-button">
                  <span className="material-icons">link</span>
                </button>
                <button type="button" onClick={insertImage} title="Insert Image" className="toolbar-button">
                  <span className="material-icons">image</span>
                </button>
                <button type="button" onClick={insertTable} title="Insert Table" className="toolbar-button">
                  <span className="material-icons">table_chart</span>
                </button>
              </div>
              
              <div className="toolbar-group colors">
                <div className="color-picker-wrapper" title="Text Color">
                  <input 
                    type="color" 
                    id="text-color-picker" 
                    onChange={setTextColor} 
                    className="color-picker" 
                  />
                  <span className="material-icons">format_color_text</span>
                </div>
                <div className="color-picker-wrapper" title="Background Color">
                  <input 
                    type="color" 
                    id="bg-color-picker" 
                    onChange={setBackgroundColor} 
                    className="color-picker" 
                  />
                  <span className="material-icons">format_color_fill</span>
                </div>
              </div>
              
              <div className="toolbar-group advanced">
                <button type="button" onClick={() => execCommand('removeFormat')} title="Clear Formatting" className="toolbar-button">
                  <span className="material-icons">format_clear</span>
                </button>
                <button type="button" onClick={() => execCommand('undo')} title="Undo" className="toolbar-button">
                  <span className="material-icons">undo</span>
                </button>
                <button type="button" onClick={() => execCommand('redo')} title="Redo" className="toolbar-button">
                  <span className="material-icons">redo</span>
                </button>
              </div>
            </div>
            
            <div className="editor-content-wrapper">
              <iframe
                ref={editorRef}
                title="Email Editor"
                className="editor-iframe"
              ></iframe>
            </div>
          </div>
        );
      }
    } else {
      // Code editor mode
      return (
        <div className="editor-code">
          <textarea
            value={html}
            onChange={handleCodeEditorChange}
            placeholder="Enter your HTML here..."
            className="code-textarea"
            spellCheck="false"
          ></textarea>
        </div>
      );
    }
  };

  return (
    <div className={`email-editor ${fullScreen ? 'fullscreen' : ''}`} ref={editorContainerRef}>
      {notification && (
        <div className={`editor-notification ${notification.type}`}>
          <span className="material-icons">
            {notification.type === 'success' ? 'check_circle' : 'error_outline'}
          </span>
          <p>{notification.message}</p>
        </div>
      )}
      
      <div className="editor-header">
        <div className="editor-tabs">
          <button
            className={`tab-button ${editorMode === 'visual' && !previewMode ? 'active' : ''}`}
            onClick={() => { setEditorMode('visual'); setPreviewMode(false); }}
          >
            <span className="material-icons">edit</span>
            Editor
          </button>
          <button
            className={`tab-button ${editorMode === 'code' ? 'active' : ''}`}
            onClick={handleModeToggle}
          >
            <span className="material-icons">code</span>
            HTML
          </button>
          <button
            className={`tab-button ${previewMode ? 'active' : ''}`}
            onClick={handlePreviewToggle}
          >
            <span className="material-icons">visibility</span>
            Preview
          </button>
        </div>
        
        <div className="editor-actions">
          <button 
            className="fullscreen-button"
            onClick={toggleFullScreen}
            title={fullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <span className="material-icons">
              {fullScreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
          
          <button 
            className={`template-save-button ${unsavedChanges ? 'unsaved' : ''}`}
            onClick={saveTemplate}
          >
            <span className="material-icons">save</span>
            Save as Template
          </button>
        </div>
      </div>
      
      {renderEditor()}
    </div>
  );
};

export default EmailEditor;