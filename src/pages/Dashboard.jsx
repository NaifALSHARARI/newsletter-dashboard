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

  // تحديث البيانات عند تغيير الشهر المحدد
  useEffect(() => {
    if (selectedMonth && globalData[selectedMonth]) {
      const timeoutId = setTimeout(() => {
        setDashboardData(globalData[selectedMonth]);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedMonth, globalData]);

  // تحديث التاب المحدد عند تغيير البيانات المتاحة
  useEffect(() => {
    const availableMonths = getAvailableMonths();
    if (availableMonths.length > 0 && !selectedTabMonth) {
      setSelectedTabMonth(availableMonths[0]);
    }
  }, [getAvailableMonths, selectedTabMonth]);

  // معالجة البيانات المرفوعة
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

  // تنسيق الأرقام للعرض
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

  // الحصول على قيمة الإحصائية من rawStats
  const getStatValue = useCallback((monthData, statKey) => {
    if (!monthData || !monthData.rawStats) return "N/A";
    return monthData.rawStats[statKey] || "N/A";
  }, []);

  // الحصول على البيانات الحقيقية للشهر الحالي أو آخر شهر متاح
  const getCurrentMonthData = useCallback(() => {
    if (selectedMonth && globalData[selectedMonth]) {
      return globalData[selectedMonth];
    }
    
    // إذا لم يكن هناك شهر محدد، استخدم آخر شهر متاح
    const availableMonths = getAvailableMonths();
    if (availableMonths.length > 0) {
      const latestMonth = availableMonths[availableMonths.length - 1];
      return globalData[latestMonth];
    }
    
    return null;
  }, [selectedMonth, globalData, getAvailableMonths]);

  // عرض أفضل الشركات بالبيانات الحقيقية
  const renderTopCompanies = useCallback(() => {
    const currentData = getCurrentMonthData();
    
    if (!currentData || !currentData.rawStats || !currentData.rawStats.topValueCompanies) {
      return (
        <div className="dashboard-card top-stocks">
          <h3>🏆 Top Companies by Value</h3>
          <div className="no-data-message">
            <p>No company data available</p>
          </div>
        </div>
      );
    }

    const topCompanies = currentData.rawStats.topValueCompanies.slice(0, 5);

    return (
      <div className="dashboard-card top-stocks">
        <h3>🏆 Top Companies by Value</h3>
        <div className="companies-table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ textAlign: 'left', padding: '10px', fontWeight: '600' }}>Company</th>
                <th style={{ textAlign: 'right', padding: '10px', fontWeight: '600' }}>Volume</th>
                <th style={{ textAlign: 'right', padding: '10px', fontWeight: '600' }}>Value</th>
                <th style={{ textAlign: 'right', padding: '10px', fontWeight: '600' }}>Deals</th>
              </tr>
            </thead>
            <tbody>
              {topCompanies.map((company, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 10px', fontWeight: '500' }}>
                    {company.name}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#666' }}>
                    {formatNumber(company.volume)}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '600', color: '#00695c' }}>
                    {formatNumber(company.value)}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#666' }}>
                    {company.deals}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [getCurrentMonthData, formatNumber]);

  // محتوى Dashboard الرئيسي مع البيانات الحقيقية
  const renderMainDashboard = useCallback(() => {
    const availableMonths = getAvailableMonths();
    
    return (
      <div className="main-dashboard-content">
        {/* ملخص البيانات المرفوعة كتابات */}
        {availableMonths.length > 0 && (
          <div className="dashboard-card full-width uploaded-data-summary">
            <h3>📋 Uploaded Data Summary</h3>
            
            {/* تابات الشهور */}
            <div className="months-tabs">
              {availableMonths.map(month => (
                <button
                  key={month}
                  className={`month-tab ${selectedTabMonth === month ? 'active' : ''}`}
                  onClick={() => setSelectedTabMonth(month)}
                >
                  {month === 'Jan' && 'January'}
                  {month === 'Feb' && 'February'}
                  {month === 'Mar' && 'March'}
                  {month === 'Apr' && 'April'}
                  {month === 'May' && 'May'}
                  {month === 'Jun' && 'June'}
                  {month === 'Jul' && 'July'}
                  {month === 'Aug' && 'August'}
                  {month === 'Sep' && 'September'}
                  {month === 'Oct' && 'October'}
                  {month === 'Nov' && 'November'}
                  {month === 'Dec' && 'December'}
                  {' 2025'}
                </button>
              ))}
            </div>
            
            {/* محتوى التاب المحدد */}
            {selectedTabMonth && (
              <div className="month-tab-content">
                <div className="month-stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Average Volume Traded</span>
                    <span className="stat-value">
                      {formatNumber(getStatValue(getDataByMonth(selectedTabMonth), "Average Volume Traded"))}
                    </span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Average Value Traded</span>
                    <span className="stat-value">
                      {formatNumber(getStatValue(getDataByMonth(selectedTabMonth), "Average Value Traded"))}
                    </span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Sum Volume Traded</span>
                    <span className="stat-value">
                      {formatNumber(getStatValue(getDataByMonth(selectedTabMonth), "Sum Volume Traded"))}
                    </span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Sum Value Traded</span>
                    <span className="stat-value">
                      {formatNumber(getStatValue(getDataByMonth(selectedTabMonth), "Sum Value Traded"))}
                    </span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Number of Companies</span>
                    <span className="stat-value">
                      {formatNumber(getStatValue(getDataByMonth(selectedTabMonth), "Number of Companies"))}
                    </span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Number of Deals</span>
                    <span className="stat-value">
                      {formatNumber(getStatValue(getDataByMonth(selectedTabMonth), "Number of Deals"))}
                    </span>
                  </div>
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

        {/* Top Companies بالبيانات الحقيقية */}
        {renderTopCompanies()}

        <div className="dashboard-card full-width">
          <h3>💡 Tips & Recommendations</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <h4>Data Analysis</h4>
              <p>Use the Data Analysis tab to explore detailed statistics and charts</p>
            </div>
            <div className="tip-item">
              <h4>Monthly Comparison</h4>
              <p>Upload multiple months to compare performance trends</p>
            </div>
            <div className="tip-item">
              <h4>Export Reports</h4>
              <p>Generate reports from the Reports tab for presentations</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {availableMonths.length === 0 && (
          <div className="dashboard-card full-width cta-card">
            <h3>🚀 Start Analyzing Your Data</h3>
            <p>Upload your newsletter Excel file to begin analysis and see real market data.</p>
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
  }, [
    getAvailableMonths, 
    getDataByMonth, 
    formatNumber, 
    getStatValue, 
    setSelectedMonth, 
    setActiveTab,
    selectedMonth,
    selectedTabMonth,
    setSelectedTabMonth,
    renderTopCompanies
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
        {/* 
        <button
          onClick={() => setActiveTab('reports')}
          className={`nav-button ${activeTab === 'reports' ? 'nav-button-active' : ''}`}
        >
          Reports
        </button>
        */}
        <button
          onClick={() => setActiveTab('upload')}
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