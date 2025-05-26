import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Dashboard Overview component displaying the main charts and statistics
 * @param {Object} props - Component props
 * @param {Object} props.data - Dashboard data
 */
const DashboardOverview = ({ data }) => {
  // Check if data exists
  console.log("Dashboard Data received:", data);
  
  if (!data || !data.monthlyData || !data.topNews) {
    return (
      <div className="empty-dashboard">
        <div className="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="#9CA3AF"/>
          </svg>
        </div>
        <h3>No Data Available</h3>
        <p>Please upload an Excel file to view data</p>
      </div>
    );
  }
  
  // Format numbers with commas for thousands
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Get selected month from data or use default
  const selectedMonth = data.selectedMonth || "Mar";
  const statsTitle = `${selectedMonth.toUpperCase()} 2025 STATISTICS`;
  
  return (
    <div className="dashboard-content">
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Monthly Trading Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="trades" fill="#00695c" name="Number of Deals" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="dashboard-card">
          <h3>Monthly Profit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${formatNumber(value)}`} />
              <Legend />
              <Line type="monotone" dataKey="profit" stroke="#22c55e" name="Sum Value Traded ($M)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="dashboard-grid-3">
        {/* Trade Performance section has been removed */}
        
        <div className="dashboard-card" style={{ gridColumn: "span 2" }}>
          <h3>{statsTitle}</h3>
          <ul className="news-list">
            {data.topNews.map((news, index) => (
              <li key={index} className="news-item">{news}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;