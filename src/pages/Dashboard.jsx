import React, { useState, useEffect, useCallback } from 'react';
import ExcelAnalyzer from '../components/ExcelAnalyzer';
import FileUpload from '../components/FileUpload';
import ReportsTab from '../components/ReportsTab';

/**
 * Dashboard محدث لاستخدام البيانات الحقيقية من ExcelAnalyzer
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
  const [selectedTabMonth, setSelectedTabMonth] = useState(null);

  useEffect(() => {
    if (selectedMonth && globalData[selectedMonth]) {
      const timeoutId = setTimeout(() => {
        setDashboardData(globalData[selectedMonth]);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedMonth, globalData]);

  useEffect(() => {
    const availableMonths = getAvailableMonths();
    if (availableMonths.length > 0 && !selectedTabMonth) {
      setSelectedTabMonth(availableMonths[0]);
    }
  }, [getAvailableMonths, selectedTabMonth]);

  // ✅ التعديل هنا: إزالة selectedMonth من التبعيات
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

    setIsLoading(true);
    setTimeout(() => {
      setActiveTab('analysis');
      setIsLoading(false);
    }, 800);
  }, [storeDataByMonth]);

  const formatNumber = useCallback((num) => {
    if (!num) return "N/A";
    const number = parseFloat(num.toString().replace(/,/g, ''));
    if (number >= 1e9) return (number / 1e9).toFixed(1) + 'B';
    if (number >= 1e6) return (number / 1e6).toFixed(1) + 'M';
    if (number >= 1e3) return (number / 1e3).toFixed(1) + 'K';
    return number.toLocaleString();
  }, []);

  const getStatValue = useCallback((monthData, statKey) => {
    if (!monthData || !monthData.rawStats) return "N/A";
    return monthData.rawStats[statKey] || "N/A";
  }, []);

  const getCurrentMonthData = useCallback(() => {
    if (selectedMonth && globalData[selectedMonth]) {
      return globalData[selectedMonth];
    }
    const availableMonths = getAvailableMonths();
    if (availableMonths.length > 0) {
      const latestMonth = availableMonths[availableMonths.length - 1];
      return globalData[latestMonth];
    }
    return null;
  }, [globalData, getAvailableMonths, selectedMonth]);

  // ✅ تم حذف جدول Top Companies by Value
  const renderTopCompanies = useCallback(() => {
    return null; // لا يعرض أي شيء
  }, []);

  const renderMainDashboard = useCallback(() => {
    const availableMonths = getAvailableMonths();

    return (
      <div className="main-dashboard-content">
        {availableMonths.length > 0 && (
          <div className="dashboard-card full-width uploaded-data-summary">
            <h3>📋 Uploaded Data Summary</h3>
            <div className="months-tabs">
              {availableMonths.map(month => (
                <button
                  key={month}
                  className={`month-tab ${selectedTabMonth === month ? 'active' : ''}`}
                  onClick={() => setSelectedTabMonth(month)}
                >
                  {month} 2025
                </button>
              ))}
            </div>
            {selectedTabMonth && (
              <div className="month-tab-content">
                <div className="month-stats-grid">
                  {[
                    "Average Volume Traded",
                    "Average Value Traded",
                    "Sum Volume Traded",
                    "Sum Value Traded",
                    "Number of Companies",
                    "Number of Deals"
                  ].map(statKey => (
                    <div className="stat-item" key={statKey}>
                      <span className="stat-label">{statKey}</span>
                      <span className="stat-value">
                        {formatNumber(getStatValue(getDataByMonth(selectedTabMonth), statKey))}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="tab-actions">
                  <button 
                    className="analyze-month-btn"
                    onClick={() => {
                      setSelectedMonth(selectedTabMonth);
                      setActiveTab('analysis');
                    }}
                  >
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {renderTopCompanies()}

        <div className="dashboard-card full-width">
          <h3>💡 Tips & Recommendations</h3>
          <div className="tips-grid">
            <div className="tip-item"><h4>Data Analysis</h4><p>Use the Data Analysis tab to explore detailed statistics and charts</p></div>
            <div className="tip-item"><h4>Monthly Comparison</h4><p>Upload multiple months to compare performance trends</p></div>
            <div className="tip-item"><h4>Export Reports</h4><p>Generate reports from the Reports tab for presentations</p></div>
          </div>
        </div>

        {availableMonths.length === 0 && (
          <div className="dashboard-card full-width cta-card">
            <h3>🚀 Start Analyzing Your Data</h3>
            <p>Upload your newsletter Excel file to begin analysis and see real market data.</p>
            <button className="cta-button" onClick={() => setActiveTab('upload')}>Upload Data Now</button>
          </div>
        )}
      </div>
    );
  }, [
    getAvailableMonths, getDataByMonth, formatNumber,
    getStatValue, setSelectedMonth, setActiveTab,
    selectedTabMonth, setSelectedTabMonth, renderTopCompanies
  ]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <img 
              src="/4321.png" 
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
            <h1 className="dashboard-title">Block Data</h1>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button onClick={() => setActiveTab('dashboard')} className={`nav-button ${activeTab === 'dashboard' ? 'nav-button-active' : ''}`}>Dashboard</button>
        <button onClick={() => setActiveTab('analysis')} className={`nav-button ${activeTab === 'analysis' ? 'nav-button-active' : ''}`}>Data Analysis</button>
        <button onClick={() => setActiveTab('upload')} className={`nav-button ${activeTab === 'upload' ? 'nav-button-active' : ''}`}>Upload Data</button>
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
        <p>© 2025 Block Trading Newsletter Dashboard</p>
      </footer>
    </div>
  );
};

export default Dashboard;