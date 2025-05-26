import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ExcelAnalyzer.css';

/**
 * ExcelAnalyzer component for analyzing Excel data with month filtering
 */
const ExcelAnalyzer = ({ 
  globalData, 
  selectedMonth, 
  setSelectedMonth, 
  getDataByMonth, 
  getAvailableMonths 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [chartData, setChartData] = useState({
    type: 'bar',
    title: 'DATA VISUALIZATION',
    data: [],
    xAxisKey: 'name',
    yAxisKey: 'value',
    yAxisLabel: 'Value'
  });
  
  // Available months for the dropdown
  const availableMonths = getAvailableMonths();
  
  // DEBUG: Log the structure of data
  useEffect(() => {
    if (currentData) {
      console.log("Current data structure:", JSON.stringify(currentData, null, 2));
      if (currentData.rawStats) {
        console.log("Top VALUE companies count:", currentData.rawStats.topValueCompanies?.length || 0);
        console.log("Top VOLUME companies count:", currentData.rawStats.topVolumeCompanies?.length || 0);
      }
    }
  }, [currentData]);
  
  // Update current data when selected month changes
  useEffect(() => {
    if (selectedMonth) {
      const data = getDataByMonth(selectedMonth);
      setCurrentData(data);
      
      if (data && data.rawStats) {
        setIsLoading(true);
        try {
          // Initialize with top value companies by default
          initializeChartData('topValue', data);
        } catch (error) {
          console.error("Error initializing chart data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      setCurrentData(null);
    }
  }, [selectedMonth, globalData]);
  
  // Initialize chart data based on selected data type
  const initializeChartData = (dataType, data = currentData) => {
    if (!data || !data.rawStats) return;
    
    console.log(`Initializing chart data for ${dataType}`);
    
    switch(dataType) {
      case 'topValue':
        loadTopValueCompanies(data);
        break;
      case 'topVolume':
        loadTopVolumeCompanies(data);
        break;
      case 'statistics':
        loadKeyStatistics(data);
        break;
      default:
        loadTopValueCompanies(data); // Default to value
    }
  };
  
  // Extract top companies by value from data
  const loadTopValueCompanies = (data) => {
    console.log("Loading top value companies...");
    
    // Check if topValueCompanies exists
    if (!data.rawStats.topValueCompanies || 
        !Array.isArray(data.rawStats.topValueCompanies) || 
        data.rawStats.topValueCompanies.length === 0) {
      console.warn("No top VALUE companies data found");
      setChartData({
        ...chartData,
        title: 'TOP COMPANIES BY VALUE',
        data: [],
        xAxisKey: 'name',
        yAxisKey: 'value',
        yAxisLabel: 'Value Traded ($)'
      });
      return;
    }
    
    // Get companies from the specific VALUE section
    const valueCompanies = data.rawStats.topValueCompanies.map(company => ({
      name: company.name,
      value: parseFloat(String(company.value || 0).replace(/,/g, '')) || 0
    }));
    
    console.log("Value companies for chart:", valueCompanies);
    
    // Update chart data
    setChartData({
      ...chartData,
      title: 'TOP COMPANIES BY VALUE',
      data: valueCompanies,
      xAxisKey: 'name',
      yAxisKey: 'value',
      yAxisLabel: 'Value Traded ($)'
    });
  };
  
  // Extract top companies by volume from data
  const loadTopVolumeCompanies = (data) => {
    console.log("Loading top volume companies...");
    
    // Check if topVolumeCompanies exists
    if (!data.rawStats.topVolumeCompanies || 
        !Array.isArray(data.rawStats.topVolumeCompanies) || 
        data.rawStats.topVolumeCompanies.length === 0) {
      console.warn("No top VOLUME companies data found");
      setChartData({
        ...chartData,
        title: 'TOP COMPANIES BY VOLUME',
        data: [],
        xAxisKey: 'name',
        yAxisKey: 'volume',
        yAxisLabel: 'Volume Traded'
      });
      return;
    }
    
    // Get companies from the specific VOLUME section
    const volumeCompanies = data.rawStats.topVolumeCompanies.map(company => ({
      name: company.name,
      volume: parseFloat(String(company.volume || 0).replace(/,/g, '')) || 0
    }));
    
    console.log("Volume companies for chart:", volumeCompanies);
    
    // Update chart data
    setChartData({
      ...chartData,
      title: 'TOP COMPANIES BY VOLUME',
      data: volumeCompanies,
      xAxisKey: 'name',
      yAxisKey: 'volume',
      yAxisLabel: 'Volume Traded'
    });
  };
  
  // Extract key statistics from data
  const loadKeyStatistics = (data) => {
    console.log("Loading key statistics...");
    
    if (!data.rawStats) {
      console.warn("No statistics data found");
      setChartData({
        ...chartData,
        title: 'KEY STATISTICS',
        data: [],
        xAxisKey: 'name',
        yAxisKey: 'value',
        yAxisLabel: 'Value'
      });
      return;
    }
    
    // Extract statistics that can be visualized
    const stats = [];
    for (const key in data.rawStats) {
      // Skip company arrays and non-numeric values
      if (key === 'topValueCompanies' || key === 'topVolumeCompanies' || 
          typeof data.rawStats[key] === 'object') continue;
      
      const value = data.rawStats[key];
      if (value !== undefined && value !== null) {
        // Try to convert to number
        const numValue = parseFloat(String(value).replace(/,/g, ''));
        if (!isNaN(numValue)) {
          stats.push({
            name: key,
            value: numValue
          });
        }
      }
    }
    
    console.log("Statistics for chart:", stats);
    
    // Update chart data with statistics
    setChartData({
      ...chartData,
      title: 'KEY STATISTICS',
      data: stats.slice(0, 8), // Limit to avoid cluttered chart
      xAxisKey: 'name',
      yAxisKey: 'value',
      yAxisLabel: 'Value'
    });
  };
  
  // Handle chart type change (bar/line)
  const handleChartTypeChange = (type) => {
    setChartData({
      ...chartData,
      type: type
    });
  };
  
  // Handle data category change
  const handleDataChange = (category) => {
    if (currentData) {
      initializeChartData(category, currentData);
    }
  };
  
  // Handle month selection change
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };
  
  // Format numbers with commas
  const formatValue = (value) => {
    if (value === undefined || value === null) return "—";
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'string') {
      // Try to convert string to number and format it
      const numValue = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(numValue)) return numValue.toLocaleString();
      return value;
    }
    return String(value);
  };
  
  // Render the appropriate chart based on selected type
  const renderChart = () => {
    console.log("Rendering chart with data:", chartData);
    
    if (!chartData.data || chartData.data.length === 0) {
      return (
        <div className="chart-placeholder">
          <div className="placeholder-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 18H21M8 6H21M8 12H21M3 6V6.01M3 12V12.01M3 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p>No chart data available for the selected month</p>
        </div>
      );
    }
    
    if (chartData.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData.data} className="chart">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartData.xAxisKey} />
            <YAxis label={{ value: chartData.yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value) => formatValue(value)} 
              labelFormatter={(value) => `${value}`}
            />
            <Legend />
            <Bar 
              dataKey={chartData.yAxisKey}
              fill="#00695c"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData.data} className="chart">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartData.xAxisKey} />
            <YAxis label={{ value: chartData.yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value) => formatValue(value)}
              labelFormatter={(value) => `${value}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={chartData.yAxisKey} 
              stroke="#00695c"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };
  
  // Render the top value companies table
  const renderValueCompaniesTable = () => {
    if (!currentData || !currentData.rawStats || !currentData.rawStats.topValueCompanies) {
      return null;
    }
    
    const valueCompanies = currentData.rawStats.topValueCompanies;
    
    if (valueCompanies.length === 0) return null;
    
    return (
      <div className="data-table-section">
        <h3 className="section-title">TOP 5 HIGHEST VALUE TRADED OF THE MONTH</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>COMPANY NAME</th>
                <th>VOLUME TRADED</th>
                <th>VALUE TRADED</th>
                <th>NUMBER OF DEALS</th>
              </tr>
            </thead>
            <tbody>
              {valueCompanies.map((company, index) => (
                <tr key={`value-${index}`}>
                  <td>{company.name}</td>
                  <td>{formatValue(company.volume)}</td>
                  <td>${formatValue(company.value)}</td>
                  <td>{formatValue(company.deals)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render the top volume companies table
  const renderVolumeCompaniesTable = () => {
    if (!currentData || !currentData.rawStats || !currentData.rawStats.topVolumeCompanies) {
      return null;
    }
    
    const volumeCompanies = currentData.rawStats.topVolumeCompanies;
    
    if (volumeCompanies.length === 0) return null;
    
    return (
      <div className="data-table-section">
        <h3 className="section-title">TOP 5 HIGHEST VOLUME TRADED OF THE MONTH</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>COMPANY NAME</th>
                <th>VOLUME TRADED</th>
                <th>VALUE TRADED</th>
                <th>NUMBER OF DEALS</th>
              </tr>
            </thead>
            <tbody>
              {volumeCompanies.map((company, index) => (
                <tr key={`volume-${index}`}>
                  <td>{company.name}</td>
                  <td>{formatValue(company.volume)}</td>
                  <td>${formatValue(company.value)}</td>
                  <td>{formatValue(company.deals)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render the statistics table
  const renderStatisticsTable = () => {
    if (!currentData || !currentData.rawStats) {
      return null;
    }
    
    // Extract statistics for table display
    const statistics = [];
    for (const key in currentData.rawStats) {
      // Skip company arrays
      if (key === 'topValueCompanies' || key === 'topVolumeCompanies' || 
          typeof currentData.rawStats[key] === 'object') continue;
      
      statistics.push({
        statistic: key,
        value: currentData.rawStats[key]
      });
    }
    
    if (statistics.length === 0) return null;
    
    return (
      <div className="data-table-section">
        <h3 className="section-title">Data Preview - {selectedMonth}</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>STATISTIC</th>
                <th>VALUE</th>
              </tr>
            </thead>
            <tbody>
              {statistics.map((stat, index) => (
                <tr key={`stat-${index}`} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td>{stat.statistic}</td>
                  <td>{formatValue(stat.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Excel data...</p>
      </div>
    );
  }
  
  return (
    <div className="excel-analyzer-container">
      <div className="analyzer-header">
        <h2 className="analyzer-title">Newsletter Data Analyzer</h2>
        
        {/* Month Filter */}
        <div className="month-filter-section" style={{ 
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <label 
            htmlFor="analysis-month-select" 
            style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#495057'
            }}
          >
            Select Month to Analyze:
          </label>
          <select 
            id="analysis-month-select"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            style={{ 
              width: '200px',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              backgroundColor: 'white',
              color: '#495057'
            }}
          >
            <option value="">-- Select Month --</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
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
              </option>
            ))}
          </select>
          
          {availableMonths.length > 0 && (
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.875rem', 
              color: '#6c757d' 
            }}>
              Available months: {availableMonths.join(', ')}
            </div>
          )}
        </div>
      </div>
      
      {!selectedMonth ? (
        <div className="empty-data">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="#9CA3AF"/>
            </svg>
          </div>
          <h3>Select a Month to Analyze</h3>
          <p>Please select a month from the dropdown above to view the data analysis</p>
        </div>
      ) : !currentData ? (
        <div className="empty-data">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="#9CA3AF"/>
            </svg>
          </div>
          <h3>No Data Available for {selectedMonth}</h3>
          <p>Please upload data for this month first using the Upload Data section</p>
        </div>
      ) : (
        <>
          {/* Chart Controls */}
          <div className="controls-section">
            <div className="control-tabs">
              <button 
                className={`control-tab ${chartData.title === 'TOP COMPANIES BY VALUE' ? 'active' : ''}`}
                onClick={() => handleDataChange('topValue')}
              >
                Top Companies by Value
              </button>
              <button 
                className={`control-tab ${chartData.title === 'TOP COMPANIES BY VOLUME' ? 'active' : ''}`}
                onClick={() => handleDataChange('topVolume')}
              >
                Top Companies by Volume
              </button>
              <button 
                className={`control-tab ${chartData.title === 'KEY STATISTICS' ? 'active' : ''}`}
                onClick={() => handleDataChange('statistics')}
              >
                Key Statistics
              </button>
            </div>
            
            <div className="chart-type-controls">
              <button 
                className={`chart-type-button ${chartData.type === 'bar' ? 'active' : ''}`}
                onClick={() => handleChartTypeChange('bar')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Bar Chart
              </button>
              <button 
                className={`chart-type-button ${chartData.type === 'line' ? 'active' : ''}`}
                onClick={() => handleChartTypeChange('line')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12h18M7 5v14M17 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Line Chart
              </button>
            </div>
          </div>
          
          {/* Chart */}
          <div className="chart-container">
            <h3 className="section-title">{chartData.title} - {selectedMonth}</h3>
            {renderChart()}
          </div>
          
          {/* Data Tables */}
          <div className="data-tables-grid">
            {renderValueCompaniesTable()}
            {renderVolumeCompaniesTable()}
            {renderStatisticsTable()}
          </div>
        </>
      )}
    </div>
  );
};

export default ExcelAnalyzer;