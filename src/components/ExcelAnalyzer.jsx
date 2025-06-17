import React, { useState, useEffect, useCallback } from 'react';
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
  // ===== STATE MANAGEMENT =====
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

  // ===== CHART DATA LOADERS =====
  
  // Extract top companies by value from data
  const loadTopValueCompanies = useCallback((data) => {
    console.log("Loading top value companies...");
    
    if (!data.rawStats.topValueCompanies || 
        !Array.isArray(data.rawStats.topValueCompanies) || 
        data.rawStats.topValueCompanies.length === 0) {
      console.warn("No top VALUE companies data found");
      setChartData(prevChartData => ({
        ...prevChartData,
        title: 'TOP COMPANIES BY VALUE',
        data: [],
        xAxisKey: 'name',
        yAxisKey: 'value',
        yAxisLabel: 'Value Traded ($)'
      }));
      return;
    }
    
    const valueCompanies = data.rawStats.topValueCompanies.map(company => ({
      name: company.name,
      value: parseFloat(String(company.value || 0).replace(/,/g, '')) || 0
    }));
    
    setChartData(prevChartData => ({
      ...prevChartData,
      title: 'TOP COMPANIES BY VALUE',
      data: valueCompanies,
      xAxisKey: 'name',
      yAxisKey: 'value',
      yAxisLabel: 'Value Traded ($)'
    }));
  }, []);
  
  // Extract top companies by volume from data
  const loadTopVolumeCompanies = useCallback((data) => {
    console.log("Loading top volume companies...");
    
    if (!data.rawStats.topVolumeCompanies || 
        !Array.isArray(data.rawStats.topVolumeCompanies) || 
        data.rawStats.topVolumeCompanies.length === 0) {
      console.warn("No top VOLUME companies data found");
      setChartData(prevChartData => ({
        ...prevChartData,
        title: 'TOP COMPANIES BY VOLUME',
        data: [],
        xAxisKey: 'name',
        yAxisKey: 'volume',
        yAxisLabel: 'Volume Traded'
      }));
      return;
    }
    
    const volumeCompanies = data.rawStats.topVolumeCompanies.map(company => ({
      name: company.name,
      volume: parseFloat(String(company.volume || 0).replace(/,/g, '')) || 0
    }));
    
    setChartData(prevChartData => ({
      ...prevChartData,
      title: 'TOP COMPANIES BY VOLUME',
      data: volumeCompanies,
      xAxisKey: 'name',
      yAxisKey: 'volume',
      yAxisLabel: 'Volume Traded'
    }));
  }, []);
  
  // Extract key statistics from data
  const loadKeyStatistics = useCallback((data) => {
    console.log("Loading key statistics...");
    
    if (!data.rawStats) {
      console.warn("No statistics data found");
      setChartData(prevChartData => ({
        ...prevChartData,
        title: 'KEY STATISTICS',
        data: [],
        xAxisKey: 'name',
        yAxisKey: 'value',
        yAxisLabel: 'Value'
      }));
      return;
    }
    
    const stats = [];
    for (const key in data.rawStats) {
      if (key === 'topValueCompanies' || key === 'topVolumeCompanies' || 
          key === 'topFeatureCompanies' || key === 'lowestCompanies' ||
          key === 'tierClassification' || key === 'sectorBreakdown' ||
          typeof data.rawStats[key] === 'object') continue;
      
      const value = data.rawStats[key];
      if (value !== undefined && value !== null) {
        const numValue = parseFloat(String(value).replace(/,/g, ''));
        if (!isNaN(numValue)) {
          stats.push({
            name: key,
            value: numValue
          });
        }
      }
    }
    
    setChartData(prevChartData => ({
      ...prevChartData,
      title: 'KEY STATISTICS',
      data: stats.slice(0, 8),
      xAxisKey: 'name',
      yAxisKey: 'value',
      yAxisLabel: 'Value'
    }));
  }, []);

  // ===== CHART INITIALIZATION =====
  
  // Initialize chart data based on selected data type
  const initializeChartData = useCallback((dataType, data = currentData) => {
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
        loadTopValueCompanies(data);
    }
  }, [currentData, loadTopValueCompanies, loadTopVolumeCompanies, loadKeyStatistics]);
  
  // ===== EFFECTS =====
  
  // Update current data when selected month changes
  useEffect(() => {
    if (selectedMonth) {
      const data = getDataByMonth(selectedMonth);
      setCurrentData(data);
      
      if (data && data.rawStats) {
        setIsLoading(true);
        try {
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
  }, [selectedMonth, globalData, getDataByMonth, initializeChartData]);
  
  // ===== EVENT HANDLERS =====
  
  // Handle chart type change (bar/line)
  const handleChartTypeChange = (type) => {
    setChartData(prevChartData => ({
      ...prevChartData,
      type: type
    }));
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
  
  // ===== UTILITY FUNCTIONS =====
  
  // Format numbers with commas
  const formatValue = (value) => {
    if (value === undefined || value === null) return "—";
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'string') {
      const numValue = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(numValue)) return numValue.toLocaleString();
      return value;
    }
    return String(value);
  };
  
  // ===== RENDER FUNCTIONS =====
  
  // Render the appropriate chart based on selected type
  const renderChart = () => {
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
  
  // ===== TABLE RENDER FUNCTIONS =====
  
  // Render main statistics table
  const renderMainStatisticsTable = () => {
    if (!currentData || !currentData.rawStats) {
      return null;
    }
    
    const mainStats = [
      { key: 'Average Volume Traded', value: currentData.rawStats['Average Volume Traded'] },
      { key: 'Average Value Traded', value: currentData.rawStats['Average Value Traded'] },
      { key: 'Sum Volume Traded', value: currentData.rawStats['Sum Volume Traded'] },
      { key: 'Sum Value Traded', value: currentData.rawStats['Sum Value Traded'] },
      { key: 'Number of Companies', value: currentData.rawStats['Number of Companies'] },
      { key: 'Number of Deals', value: currentData.rawStats['Number of Deals'] }
    ].filter(stat => stat.value !== undefined);
    
    if (mainStats.length === 0) return null;
    
    return (
      <div className="data-table-section">
        <h3 className="section-title">{selectedMonth?.toUpperCase()} 2025 STATISTICS</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>STATISTIC</th>
                <th>VALUE</th>
              </tr>
            </thead>
            <tbody>
              {mainStats.map((stat, index) => (
                <tr key={`main-stat-${index}`}>
                  <td>{stat.key}</td>
                  <td>{formatValue(stat.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render tier classification table with flexible tier name matching
  const renderTierClassificationTable = () => {
    if (!currentData || !currentData.rawStats) {
      return null;
    }
    
    // Extract tier data dynamically from rawStats using flexible matching
    const tierData = [];
    
    // Get all keys that match tier pattern
    const tierKeys = Object.keys(currentData.rawStats).filter(key => 
      key.match(/^Tier\s+\d+\s*\([^)]+\)/i)
    );
    
    // Sort tier keys by tier number
    tierKeys.sort((a, b) => {
      const tierA = parseInt(a.match(/Tier\s+(\d+)/i)?.[1] || '0');
      const tierB = parseInt(b.match(/Tier\s+(\d+)/i)?.[1] || '0');
      return tierA - tierB;
    });
    
    console.log('Found tier keys:', tierKeys);
    
    // Build tier data array
    tierKeys.forEach(tierKey => {
      const tierMatch = tierKey.match(/^Tier\s+(\d+)\s*\([^)]+\)/i);
      if (tierMatch) {
        const tierNumber = tierMatch[1];
        const tierValue = currentData.rawStats[tierKey];
        
        // Get corresponding volume and companies data
        const tierVolume = currentData.rawStats[`Tier ${tierNumber} Volume`] || 
                          currentData.rawStats[`Tier${tierNumber}Volume`];
        const tierCompanies = currentData.rawStats[`Tier ${tierNumber} Companies`] || 
                             currentData.rawStats[`Tier${tierNumber}Companies`];
        
        tierData.push({
          tier: tierKey, // Use the original tier name as it appears in Excel
          valueTraded: tierValue,
          volumeTraded: tierVolume,
          companiesTraded: tierCompanies
        });
        
        console.log(`Added tier data: ${tierKey}, Value: ${tierValue}, Volume: ${tierVolume}, Companies: ${tierCompanies}`);
      }
    });
    
    if (tierData.length === 0) {
      console.warn('No tier data found in rawStats');
      return null;
    }
    
    // Calculate totals dynamically
    const totalValueTraded = tierData.reduce((sum, tier) => {
      const value = parseFloat(String(tier.valueTraded || 0).replace(/,/g, ''));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    
    const totalVolumeTraded = tierData.reduce((sum, tier) => {
      const value = parseFloat(String(tier.volumeTraded || 0).replace(/,/g, ''));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    
    const totalCompaniesTraded = tierData.reduce((sum, tier) => {
      const value = parseFloat(String(tier.companiesTraded || 0).replace(/,/g, ''));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    
    return (
      <div className="data-table-section">
        <h3 className="section-title">TOTAL OF TIER CLASSIFICATION FOR VALUE TRADED & VOLUME TRADED</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tier Classification</th>
                <th>Value Traded</th>
                <th>Volume Traded</th>
                <th>Number of Companies Traded</th>
              </tr>
            </thead>
            <tbody>
              {tierData.map((tier, index) => (
                <tr key={`tier-${index}`}>
                  <td>{tier.tier}</td>
                  <td>{formatValue(tier.valueTraded)}</td>
                  <td>{tier.volumeTraded !== undefined ? formatValue(tier.volumeTraded) : '—'}</td>
                  <td>{tier.companiesTraded !== undefined ? formatValue(tier.companiesTraded) : '—'}</td>
                </tr>
              ))}
              {/* Total Row - only show if we have meaningful totals */}
              {(totalValueTraded > 0 || totalVolumeTraded > 0 || totalCompaniesTraded > 0) && (
                <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', borderTop: '2px solid #00695c' }}>
                  <td><strong>Total:</strong></td>
                  <td><strong>{formatValue(totalValueTraded)}</strong></td>
                  <td><strong>{totalVolumeTraded > 0 ? formatValue(totalVolumeTraded) : '—'}</strong></td>
                  <td><strong>{totalCompaniesTraded > 0 ? formatValue(totalCompaniesTraded) : '—'}</strong></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
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
                  <td>{formatValue(company.value)}</td>
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
                  <td>{formatValue(company.value)}</td>
                  <td>{formatValue(company.deals)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render top feature companies table
  const renderTopFeatureCompaniesTable = () => {
    if (!currentData || !currentData.rawStats || !currentData.rawStats.topFeatureCompanies) {
      return null;
    }
    
    const featureCompanies = currentData.rawStats.topFeatureCompanies;
    if (!Array.isArray(featureCompanies) || featureCompanies.length === 0) return null;
    
    return (
      <div className="data-table-section">
        <h3 className="section-title">TOP 5 FEATURE HIGHEST TRANSACTIONS OF THE MONTH</h3>
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
              {featureCompanies.map((company, index) => (
                <tr key={`feature-${index}`}>
                  <td>{company.name}</td>
                  <td>{formatValue(company.volume)}</td>
                  <td>{formatValue(company.value)}</td>
                  <td>{formatValue(company.deals)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render lowest transactions table
  const renderLowestTransactionsTable = () => {
    if (!currentData || !currentData.rawStats || !currentData.rawStats.lowestCompanies) {
      return null;
    }
    
    const lowestCompanies = currentData.rawStats.lowestCompanies;
    if (!Array.isArray(lowestCompanies) || lowestCompanies.length === 0) return null;
    
    return (
      <div className="data-table-section">
        <h3 className="section-title">TOP 5 LOWEST TRANSACTIONS OF THE MONTH</h3>
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
              {lowestCompanies.map((company, index) => (
                <tr key={`lowest-${index}`}>
                  <td>{company.name}</td>
                  <td>{formatValue(company.volume)}</td>
                  <td>{formatValue(company.value)}</td>
                  <td>{formatValue(company.deals)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render sector breakdown table
  const renderSectorBreakdownTable = () => {
    if (!currentData || !currentData.rawStats || !currentData.rawStats.sectorBreakdown) {
      return null;
    }
    
    const sectorData = currentData.rawStats.sectorBreakdown;
    if (!Array.isArray(sectorData) || sectorData.length === 0) return null;
    
    return (
      <div className="data-table-section">
        <h3 className="section-title">SECTORS</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>SECTOR</th>
                <th>NUMBER OF SECTORS</th>
              </tr>
            </thead>
            <tbody>
              {sectorData.map((sector, index) => (
                <tr key={`sector-${index}`}>
                  <td>{sector.sector || sector.name}</td>
                  <td>{formatValue(sector.count || sector.companies)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // ===== MAIN RENDER =====
  
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
          {/* Chart Controls with Month Selector */}
          <div className="controls-section">
            {/* Month Selector */}
            <div className="month-selector-container">
              <label htmlFor="analysis-month-select" className="month-selector-label">
                Select Month to Analyze:
              </label>
              <select 
                id="analysis-month-select"
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="month-selector"
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
                <div className="available-months-info">
                  Available months: {availableMonths.join(', ')}
                </div>
              )}
            </div>

            <div className="control-tabs-row">
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
          </div>
          
          {/* Chart */}
          <div className="chart-container">
            <h3 className="section-title">{chartData.title} - {selectedMonth}</h3>
            {renderChart()}
          </div>
          
          {/* All Data Tables in Original Excel Order */}
          <div className="data-tables-grid">
            {/* Main Statistics First */}
            {renderMainStatisticsTable()}
            
            {/* Tier Classification */}
            {renderTierClassificationTable()}
            
            {/* Top 5 Highest Value Traded */}
            {renderValueCompaniesTable()}
            
            {/* Top 5 Highest Volume Traded */}
            {renderVolumeCompaniesTable()}
            
            {/* Top 5 Feature Highest Transactions */}
            {renderTopFeatureCompaniesTable()}
            
            {/* Top 5 Lowest Transactions */}
            {renderLowestTransactionsTable()}
            
            {/* Sector Breakdown */}
            {renderSectorBreakdownTable()}
          </div>
        </>
      )}
    </div>
  );
};

export default ExcelAnalyzer;