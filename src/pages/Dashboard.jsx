import React, { useState, useEffect } from 'react';
import ExcelAnalyzer from '../components/ExcelAnalyzer';
import FileUpload from '../components/FileUpload';
import ReportsTab from '../components/ReportsTab';

/**
 * Main Dashboard component for the application with monthly data management
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
      setDashboardData(globalData[selectedMonth]);
    }
  }, [selectedMonth, globalData]);

  // Handle processed data
  const handleDataProcessed = (newData, month) => {
    console.log('Processed data received:', newData, 'for month:', month);
    
    // Ensure required data exists
    if (!newData || !newData.monthlyData || !newData.tradePerformance || !newData.topNews) {
      console.error('Received incomplete data:', newData);
      return;
    }
    
    // Store data by month
    storeDataByMonth(month, newData);
    
    // Update local data
    setDashboardData(newData);
    
    // Navigate to data analysis after upload
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab('analysis');
      setIsLoading(false);
    }, 800);
  };

  // Main Dashboard Content
  const renderMainDashboard = () => {
    const availableMonths = getAvailableMonths();
    
    return (
      <div className="main-dashboard-content">
        {/* Display uploaded data summary */}
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
                      <div className="stat-item">
                        <span className="stat-label">Number of Deals</span>
                        <span className="stat-value">
                          {monthData?.rawStats?.["Number of Deals"] || "N/A"}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Trading Value</span>
                        <span className="stat-value">
                          {monthData?.rawStats?.["Sum Value Traded"] || "N/A"}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Number of Companies</span>
                        <span className="stat-value">
                          {monthData?.rawStats?.["Number of Companies"] || "N/A"}
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

        {/* News and Market Overview */}
        <div className="dashboard-grid">
          <div className="dashboard-card news-card">
            <h3>📈 Today's Trading News</h3>
            <ul className="news-list">
              <li className="news-item">Saudi market records 2.5% increase in today's trading</li>
              <li className="news-item">Aramco announces strong results for the last quarter</li>
              <li className="news-item">Banking sector leads gains with 3.2% increase</li>
              <li className="news-item">Over 150 million shares traded worth 4.2 billion SAR</li>
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
                <span className="stat-value">150.2 million shares</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Trading Value</span>
                <span className="stat-value">4.2 billion SAR</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Number of Deals</span>
                <span className="stat-value">285,400</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card analysis-card">
            <h3>🔍 Market Analysis</h3>
            <div className="analysis-content">
              <p><strong>General Trend:</strong> Strongly bullish</p>
              <p><strong>Resistance Level:</strong> 12,900 points</p>
              <p><strong>Support Level:</strong> 12,700 points</p>
              <p><strong>Winning Sectors:</strong> Banks, Petrochemicals, Insurance</p>
              <p><strong>Losing Sectors:</strong> Real Estate, Telecommunications</p>
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
        </div>

        <div className="dashboard-card full-width">
          <h3>💡 Tips and Recommendations</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <h4>Investment Strategy</h4>
              <p>Focus on stocks with strong fundamentals in defensive sectors</p>
            </div>
            <div className="tip-item">
              <h4>Risk Management</h4>
              <p>Set stop-loss orders at specified support levels</p>
            </div>
            <div className="tip-item">
              <h4>Available Opportunities</h4>
              <p>Banking sector shows strong positive signals for long-term investment</p>
            </div>
          </div>
        </div>

        {/* Call to Action if no data uploaded */}
        {availableMonths.length === 0 && (
          <div className="dashboard-card full-width cta-card">
            <h3>🚀 Start Analyzing Your Data</h3>
            <p>No data uploaded yet. Start by uploading your newsletter Excel file to analyze the data.</p>
            <button 
              className="cta-button"
              onClick={() => setActiveTab('upload')}
            >
              Upload Data Now
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="logo">AWRAAQI</h1>
          </div>
          <div className="title-section">
            <h1 className="dashboard-title">Trading Newsletter Dashboard</h1>
          </div>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`nav-button ${activeTab === 'dashboard' ? 'nav-button-active' : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`nav-button ${activeTab === 'analysis' ? 'nav-button-active' : ''}`}
        >
          Data Analysis
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`nav-button ${activeTab === 'reports' ? 'nav-button-active' : ''}`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`nav-button ${activeTab === 'upload' ? 'nav-button-active' : ''}`}
        >
          Upload Data
        </button>
      </nav>
      
      <main className="dashboard-main container mx-auto px-4">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderMainDashboard()}
            {activeTab === 'analysis' && (
              <ExcelAnalyzer 
                globalData={globalData}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
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
        <p>© 2025 Block Trading Newsletter Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;