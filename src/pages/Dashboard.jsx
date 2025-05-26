import React, { useState, useEffect, useCallback } from 'react';
import ExcelAnalyzer from '../components/ExcelAnalyzer';
import FileUpload from '../components/FileUpload';
import ReportsTab from '../components/ReportsTab';

/**
 * Dashboard component with mobile optimization and consistent field names
 */
const Dashboard = ({ 
  globalData, 
  selectedMonth, 
  setSelectedMonth, 
  storeDataByMonth, 
  getDataByMonth, 
  getAvailableMonths 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update data when selected month changes
  useEffect(() => {
    if (selectedMonth && globalData[selectedMonth]) {
      const timeoutId = setTimeout(() => {
        setDashboardData(globalData[selectedMonth]);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedMonth, globalData]);

  // Handle processed data - only redirect here after successful upload
  const handleDataProcessed = useCallback((newData, month) => {
    console.log('Processed data received:', newData, 'for month:', month);
    
    if (!newData || !newData.monthlyData || !newData.tradePerformance || !newData.topNews) {
      console.error('Received incomplete data:', newData);
      return;
    }
    
    storeDataByMonth(month, newData);
    
    requestAnimationFrame(() => {
      setDashboardData(newData);
    });
    
    // Navigate to analysis after upload
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab('analysis');
      setIsLoading(false);
    }, 800);
  }, [storeDataByMonth]);

  // Format numbers for display
  const formatNumber = useCallback((num) => {
    if (!num) return "N/A";
    const number = parseFloat(num.toString().replace(/,/g, ''));
    if (number >= 1000000000) {
      return (number / 1000000000).toFixed(1) + 'B';
    } else if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toLocaleString();
  }, []);

  // Get statistic value from rawStats
  const getStatValue = useCallback((monthData, statKey) => {
    if (!monthData || !monthData.rawStats) return "N/A";
    return monthData.rawStats[statKey] || "N/A";
  }, []);

  // Safe tab navigation
  const handleTabChange = useCallback((tabName) => {
    setActiveTab(tabName);
  }, []);

  // Safe month change for analysis only
  const handleAnalysisMonthChange = useCallback((month) => {
    setSelectedMonth(month);
  }, [setSelectedMonth]);

  // Main Dashboard Content with matching field names
  const renderMainDashboard = useCallback(() => {
    const availableMonths = getAvailableMonths();
    
    return (
      <div className="main-dashboard-content">
        {/* Uploaded Data Summary - matches ExcelAnalyzer field names */}
        {availableMonths.length > 0 && (
          <div className="dashboard-card full-width uploaded-data-summary">
            <h3>📋 Uploaded Data Summary</h3>
            <div className="uploaded-months-grid">
              {availableMonths.map(month => {
                const monthData = getDataByMonth(month);
                return (
                  <div key={month} className="month-summary-card">
                    <h4>{month} 2025</h4>
                    <div className="month-stats">
                      <div className="stat-item" data-stat="volume">
                        <span className="stat-label">Average Volume Traded</span>
                        <span className="stat-value">
                          {formatNumber(getStatValue(monthData, "Average Volume Traded"))}
                        </span>
                      </div>
                      
                      <div className="stat-item" data-stat="value">
                        <span className="stat-label">Average Value Traded</span>
                        <span className="stat-value">
                          {formatNumber(getStatValue(monthData, "Average Value Traded"))}
                        </span>
                      </div>
                      
                      <div className="stat-item" data-stat="volume">
                        <span className="stat-label">Sum Volume Traded</span>
                        <span className="stat-value">
                          {formatNumber(getStatValue(monthData, "Sum Volume Traded"))}
                        </span>
                      </div>
                      
                      <div className="stat-item" data-stat="value">
                        <span className="stat-label">Sum Value Traded</span>
                        <span className="stat-value">
                          {formatNumber(getStatValue(monthData, "Sum Value Traded"))}
                        </span>
                      </div>
                      
                      <div className="stat-item" data-stat="companies">
                        <span className="stat-label">Number of Companies</span>
                        <span className="stat-value">
                          {formatNumber(getStatValue(monthData, "Number of Companies"))}
                        </span>
                      </div>
                      
                      <div className="stat-item" data-stat="deals">
                        <span className="stat-label">Number of Deals</span>
                        <span className="stat-value">
                          {formatNumber(getStatValue(monthData, "Number of Deals"))}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="view-details-btn"
                      onClick={() => {
                        setSelectedMonth(month);
                        setActiveTab('analysis');
                      }}
                    >
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rest of Dashboard content */}
        <div className="dashboard-card news-card">
          <h3>📈 Today's Trading News</h3>
          <ul className="news-list">
            <li className="news-item">Saudi market records 2.5% increase in today's trading</li>
            <li className="news-item">Aramco announces strong results for Q4</li>
            <li className="news-item">Banking sector leads gains with 3.2% increase</li>
            <li className="news-item">150M shares traded worth 4.2B SAR</li>
            <li className="news-item">General index closes at 12,850 points</li>
          </ul>
        </div>

        <div className="dashboard-card market-overview">
          <h3>📊 Market Overview</h3>
          <div className="market-stats">
            <div className="stat-item">
              <span className="stat-label">General Index</span>
              <span className="stat-value positive">12,850.25 ↗</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Trading Volume</span>
              <span className="stat-value">150.2M shares</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Trading Value</span>
              <span className="stat-value">4.2B SAR</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Number of Deals</span>
              <span className="stat-value">285,400</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card analysis-card">
          <h3>🔍 Market Analysis</h3>
          <div className="analysis-content">
            <p><strong>Trend:</strong> Strongly bullish</p>
            <p><strong>Resistance:</strong> 12,900 points</p>
            <p><strong>Support:</strong> 12,700 points</p>
            <p><strong>Top Sectors:</strong> Banks, Petrochemicals</p>
            <p><strong>Weak Sectors:</strong> Real Estate, Telecom</p>
          </div>
        </div>

        <div className="dashboard-card top-stocks">
          <h3>🏆 Top Stocks</h3>
          <div className="stocks-list">
            <div className="stock-item">
              <span className="stock-name">Saudi Aramco</span>
              <span className="stock-change positive">+2.8%</span>
            </div>
            <div className="stock-item">
              <span className="stock-name">National Bank</span>
              <span className="stock-change positive">+3.5%</span>
            </div>
            <div className="stock-item">
              <span className="stock-name">SABIC</span>
              <span className="stock-change positive">+1.9%</span>
            </div>
            <div className="stock-item">
              <span className="stock-name">Al Rajhi Bank</span>
              <span className="stock-change positive">+2.1%</span>
            </div>
            <div className="stock-item">
              <span className="stock-name">Ma'aden</span>
              <span className="stock-change negative">-1.3%</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card full-width">
          <h3>💡 Tips & Recommendations</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <h4>Investment Strategy</h4>
              <p>Focus on defensive sectors with strong fundamentals</p>
            </div>
            <div className="tip-item">
              <h4>Risk Management</h4>
              <p>Set stop-loss orders at support levels</p>
            </div>
            <div className="tip-item">
              <h4>Opportunities</h4>
              <p>Banking sector shows strong signals</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {availableMonths.length === 0 && (
          <div className="dashboard-card full-width cta-card">
            <h3>🚀 Start Analyzing Your Data</h3>
            <p>Upload your newsletter Excel file to begin analysis.</p>
            <button 
              className="cta-button"
              onClick={() => handleTabChange('upload')}
            >
              Upload Data Now
            </button>
          </div>
        )}
      </div>
    );
  }, [getAvailableMonths, getDataByMonth, formatNumber, getStatValue, setSelectedMonth, setActiveTab, handleTabChange]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <img 
              src="/logo.png" 
              alt="AWRAAQI Logo" 
              className="header-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <h1 className="logo" style={{ display: 'none' }}>AWRAAQI</h1>
          </div>
          <div className="title-section">
            <h1 className="dashboard-title">Trading Newsletter Dashboard</h1>
          </div>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`nav-button ${activeTab === 'dashboard' ? 'nav-button-active' : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => handleTabChange('analysis')}
          className={`nav-button ${activeTab === 'analysis' ? 'nav-button-active' : ''}`}
        >
          Data Analysis
        </button>
        <button
          onClick={() => handleTabChange('reports')}
          className={`nav-button ${activeTab === 'reports' ? 'nav-button-active' : ''}`}
        >
          Reports
        </button>
        <button
          onClick={() => handleTabChange('upload')}
          className={`nav-button ${activeTab === 'upload' ? 'nav-button-active' : ''}`}
        >
          Upload Data
        </button>
      </nav>
      
      <main className="dashboard-main">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderMainDashboard()}
            {activeTab === 'analysis' && (
              <ExcelAnalyzer 
                globalData={globalData}
                selectedMonth={selectedMonth}
                setSelectedMonth={handleAnalysisMonthChange}
                getDataByMonth={getDataByMonth}
                getAvailableMonths={getAvailableMonths}
              />
            )}
            {activeTab === 'reports' && <ReportsTab data={dashboardData} />}
            {activeTab === 'upload' && (
              <FileUpload 
                onDataProcessed={handleDataProcessed}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
              />
            )}
          </>
        )}
      </main>
      
      <footer className="dashboard-footer">
        <p>© 2025 Block Trading Newsletter Dashboard</p>
      </footer>
    </div>
  );
};

export default Dashboard;