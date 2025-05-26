import React, { useState } from 'react';
import './ReportsTab.css';

const ReportsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // بيانات التقارير
  const reports = [
    {
      id: 1,
      title: 'BLOCK TRADING MONTHLY NEWSLETTER MARCH 2025',
      size: '28 KB',
      date: 'Apr 2, 2025',
      type: 'view',
      category: 'newsletter'
    },
    {
      id: 2,
      title: 'March Newsletter 2025.xlsx',
      size: '21 KB',
      date: 'Apr 2, 2025',
      type: 'download',
      category: 'excel'
    },
    {
      id: 3,
      title: 'Q1 Trading Performance Report',
      size: '32 KB',
      date: 'Mar 31, 2025',
      type: 'view',
      category: 'performance'
    },
    {
      id: 4,
      title: 'Market Analysis - March 2025',
      size: '18 KB',
      date: 'Mar 28, 2025',
      type: 'view',
      category: 'analysis'
    }
  ];

  // تصفية التقارير حسب الفئة والبحث
  const filteredReports = reports.filter(report => 
    (activeCategory === 'all' || report.category === activeCategory) && 
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2 className="reports-title">Available Reports</h2>
        <div className="reports-counter">{reports.length} Files</div>
      </div>
      
      <div className="search-bar-container">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search reports..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">
            <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        
        <div className="action-buttons">
          <button className="action-button">
            <span className="button-icon">
              <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Filter
          </button>
          <button className="action-button">
            <span className="button-icon">
              <svg width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Upload
          </button>
        </div>
      </div>
      
      <div className="category-tabs">
        <button 
          className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All ({reports.length})
        </button>
        <button 
          className={`category-tab ${activeCategory === 'newsletter' ? 'active' : ''}`}
          onClick={() => setActiveCategory('newsletter')}
        >
          Newsletters ({reports.filter(r => r.category === 'newsletter').length})
        </button>
        <button 
          className={`category-tab ${activeCategory === 'excel' ? 'active' : ''}`}
          onClick={() => setActiveCategory('excel')}
        >
          Excel Files ({reports.filter(r => r.category === 'excel').length})
        </button>
        <button 
          className={`category-tab ${activeCategory === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveCategory('performance')}
        >
          Performance ({reports.filter(r => r.category === 'performance').length})
        </button>
        <button 
          className={`category-tab ${activeCategory === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveCategory('analysis')}
        >
          Analysis ({reports.filter(r => r.category === 'analysis').length})
        </button>
      </div>
      
      <div className="reports-list">
        {filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <div key={report.id} className="report-item">
              <div className="report-content">
                <div className={`report-icon ${report.category}`}>
                  {report.category === 'excel' && (
                    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {report.category === 'newsletter' && (
                    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {report.category === 'performance' && (
                    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {report.category === 'analysis' && (
                    <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="report-details">
                  <h3 className="report-title">{report.title}</h3>
                  <div className="report-meta">
                    <span className="report-size">{report.size}</span>
                    <span className="report-date">Last modified {report.date}</span>
                    <span className={`report-category ${report.category}`}>
                      {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="report-actions">
                {report.type === 'view' ? (
                  <button className="report-button view">View</button>
                ) : (
                  <button className="report-button download">
                    <span className="button-icon">
                      <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 13v1a2 2 0 002 2h8a2 2 0 002-2v-1M12 9l-4 4m0 0L4 9m4 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    Download
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-reports">
            <div className="no-reports-icon">
              <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="no-reports-text">No reports found matching your search criteria.</p>
            <button 
              className="no-reports-button"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
            >
              Show All Reports
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;