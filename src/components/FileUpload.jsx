import React, { useState, useEffect } from 'react';
import './FileUpload.css';
import { readExcelFile } from '../utils/excelUtils';

const FileUpload = ({ onDataProcessed, selectedMonth, setSelectedMonth }) => {
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  // Local state للشهر المحدد في هذا المكون فقط
  const [localSelectedMonth, setLocalSelectedMonth] = useState(selectedMonth || '');
  
  // تحديث الـ local state عند تغيير selectedMonth من خارج المكون
  useEffect(() => {
    if (selectedMonth) {
      setLocalSelectedMonth(selectedMonth);
    }
  }, [selectedMonth]);
  
  // Reset preview when file changes (not when month changes)
  useEffect(() => {
    setPreviewData(null);
    setUploadStatus('');
  }, [selectedFile]);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
      setUploadStatus(`Selected: ${file.name}`);
      setPreviewData(null);
    }
  };

  // معالجة تغيير الشهر بدون إعادة توجيه
  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    console.log('Month changing in FileUpload:', newMonth);
    
    // تحديث الـ local state فقط
    setLocalSelectedMonth(newMonth);
    
    // مسح رسائل الحالة عند تغيير الشهر
    if (previewData && selectedFile && newMonth) {
      setUploadStatus('Month changed. Click "Preview Data" to see data for the new month.');
    }
    
    // لا نستدعي setSelectedMonth هنا لتجنب إعادة التوجيه
    // سنحديث selectedMonth فقط عند الرفع الفعلي
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }
    
    if (!localSelectedMonth) {
      setUploadStatus('Please select a month first');
      return;
    }
    
    setIsLoadingPreview(true);
    setUploadStatus('Processing file for preview...');
    
    try {
      const data = await readExcelFile(selectedFile, localSelectedMonth);
      setPreviewData(data);
      setUploadStatus('File preview complete. Ready to upload.');
    } catch (error) {
      console.error('Error previewing file:', error);
      setUploadStatus(`Error: ${error.message}`);
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }
    
    if (!localSelectedMonth) {
      setUploadStatus('Please select a month first');
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('Processing file...');
    
    try {
      // الآن فقط نحديث selectedMonth العام
      setSelectedMonth(localSelectedMonth);
      
      // Use preview data if available, otherwise process the file again
      if (previewData) {
        onDataProcessed(previewData, localSelectedMonth);
      } else {
        const processedData = await readExcelFile(selectedFile, localSelectedMonth);
        onDataProcessed(processedData, localSelectedMonth);
      }
      
      setIsUploading(false);
      setUploadStatus('File processed successfully!');
    } catch (error) {
      console.error('Error processing file:', error);
      setIsUploading(false);
      setUploadStatus(`Error: ${error.message}`);
    }
  };

  // Available templates
  const templates = [
    {
      name: "March Newsletter 2025.xlsx",
      size: "21 KB",
      type: "Template"
    },
    {
      name: "Trading Data Template.xlsx",
      size: "18 KB",
      type: "Template"
    }
  ];

  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <h2 className="section-title">Upload Newsletter Excel File</h2>
        
        <div className="upload-form">
          {/* Month selector - يستخدم localSelectedMonth */}
          <div className="month-selector" style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="file-upload-month-select" 
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: 'var(--gray-700)'
              }}
            >
              Select Month:
            </label>
            <select 
              id="file-upload-month-select"
              value={localSelectedMonth}
              onChange={handleMonthChange}
              style={{ 
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--gray-300)',
                backgroundColor: 'white',
                color: 'var(--gray-800)'
              }}
            >
              <option value="">-- Select Month --</option>
              <option value="Jan">January</option>
              <option value="Feb">February</option>
              <option value="Mar">March</option>
              <option value="Apr">April</option>
              <option value="May">May</option>
              <option value="Jun">June</option>
              <option value="Jul">July</option>
              <option value="Aug">August</option>
              <option value="Sep">September</option>
              <option value="Oct">October</option>
              <option value="Nov">November</option>
              <option value="Dec">December</option>
            </select>
          </div>
          
          <div className="file-selector">
            <div className="file-input-wrapper">
              <label htmlFor="file-upload" className="file-selector-button">
                <span className="file-icon">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" fill="currentColor"/>
                  </svg>
                </span>
                Select File
              </label>
              <input 
                type="file" 
                id="file-upload" 
                accept=".xlsx,.xls" 
                onChange={handleFileChange}
                className="hidden-input"
              />
            </div>
            <div className="file-name">
              {fileName ? (
                <div className="selected-file">
                  <span className="excel-icon">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM9 16h2v2H9v-2zm8 0h-2v2h2v-2zm-8-4h2v2H9v-2zm4 0h2v2h-2v-2zm4 0h-2v2h2v-2z" fill="currentColor"/>
                    </svg>
                  </span>
                  {fileName}
                </div>
              ) : (
                <span className="no-file">No file selected</span>
              )}
            </div>
          </div>
          
          {/* Preview and Upload buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: '1' }}>
              <button 
                onClick={handlePreview}
                disabled={isLoadingPreview || !fileName || !localSelectedMonth}
                className={`upload-button ${isLoadingPreview || !fileName || !localSelectedMonth ? 'disabled' : ''}`}
                style={{ 
                  width: '100%', 
                  backgroundColor: 'var(--info-color)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoadingPreview ? (
                  <>
                    <span className="spinner"></span>
                    Previewing...
                  </>
                ) : (
                  <>
                    <span className="upload-icon">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                      </svg>
                    </span>
                    Preview Data
                  </>
                )}
              </button>
            </div>
            
            <div className="upload-button-wrapper" style={{ flex: '1' }}>
              <button 
                onClick={handleUpload}
                disabled={isUploading || !fileName || !localSelectedMonth}
                className={`upload-button ${isUploading || !fileName || !localSelectedMonth ? 'disabled' : ''}`}
                style={{ width: '100%' }}
              >
                {isUploading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="upload-icon">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" fill="currentColor"/>
                      </svg>
                    </span>
                    Upload & Process File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {uploadStatus && (
          <div className={`status-message ${
            uploadStatus.includes('Error') 
              ? 'error' 
              : uploadStatus.includes('successfully') || uploadStatus.includes('complete')
                ? 'success' 
                : 'info'
          }`}>
            {uploadStatus.includes('successfully') || uploadStatus.includes('complete') ? (
              <span className="status-icon success-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
              </span>
            ) : uploadStatus.includes('Error') ? (
              <span className="status-icon error-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
              </span>
            ) : (
              <span className="status-icon info-icon">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
              </span>
            )}
            {uploadStatus}
          </div>
        )}
        
        {/* Preview data display */}
        {previewData && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            backgroundColor: 'var(--success-light)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--success-color)'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: 'var(--success-color)',
              borderBottom: '1px solid rgba(76, 175, 80, 0.3)',
              paddingBottom: '0.5rem'
            }}>
              Data Preview ({localSelectedMonth})
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '0.75rem', 
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                  Number of Deals
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--gray-800)' }}>
                  {previewData.rawStats["Number of Deals"] || "N/A"}
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '0.75rem', 
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                  Value Traded
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--gray-800)' }}>
                  {previewData.rawStats["Sum Value Traded"] || "N/A"}
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: 'white', 
                padding: '0.75rem', 
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                  Number of Companies
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--gray-800)' }}>
                  {previewData.rawStats["Number of Companies"] || "N/A"}
                </div>
              </div>
            </div>
            
            <div style={{ 
              fontSize: '0.875rem',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              padding: '0.75rem',
              borderRadius: 'var(--border-radius)',
              color: 'var(--success-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
              </svg>
              Data is ready for dashboard display. Click "Upload & Process File" to continue.
            </div>
          </div>
        )}
      </div>
      
      <div className="templates-section">
        <h3 className="subsection-title">Available Template Files</h3>
        <div className="templates-list">
          {templates.map((template, index) => (
            <div key={index} className="template-item">
              <div className="template-icon">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>
                </svg>
              </div>
              <div className="template-info">
                <p className="template-name">{template.name}</p>
                <p className="template-meta">{template.size} • {template.type}</p>
              </div>
              <button className="download-button">
                <span className="download-icon">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
                  </svg>
                </span>
                Download Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;