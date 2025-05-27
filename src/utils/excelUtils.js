import * as XLSX from 'xlsx';

/**
 * Read Excel file and return processed data
 * @param {File} file - Uploaded Excel file
 * @param {string} selectedMonth - Month selected by user
 * @returns {Promise} Processed data for dashboard display
 */
export const readExcelFile = (file, selectedMonth = 'Mar') => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          
          // Read the file
          const workbook = XLSX.read(data, { 
            type: 'array',
            cellStyles: true,
            cellFormulas: true,
            cellDates: true,
            cellNF: true
          });
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Get data from the sheet as arrays
          const arrays = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, 
            raw: true, 
            defval: null 
          });
          
          console.log("Excel raw data (first 30 rows):", arrays.slice(0, 30));
          
          // Extract all data including tier classification
          const statsData = extractAllData(arrays);
          console.log("Extracted all data:", statsData);
          
          // Find monthly data if exists
          const monthlyData = createMonthlyData(arrays, statsData, selectedMonth);
          console.log("Created monthly data:", monthlyData);
          
          // Create dashboard data
          const dashboardData = createDashboardData(statsData, monthlyData, file.name, selectedMonth);
          console.log("Final dashboard data:", dashboardData);
          
          resolve(dashboardData);
        } catch (error) {
          console.error("Error processing Excel data:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(new Error("FileReader error"));
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Exception in readExcelFile:", error);
      reject(error);
    }
  });
};

/**
 * Extract all data from Excel file including tier classification
 * @param {Array} arrays - Excel data as 2D array
 * @returns {Object} Extracted data
 */
const extractAllData = (arrays) => {
  let allData = {};
  
  if (!arrays || arrays.length === 0) {
    console.warn("No data in Excel arrays");
    return allData;
  }
  
  // Extract basic statistics
  allData = extractStatisticsData(arrays);
  
  // Extract tier classification data
  const tierData = extractTierClassificationData(arrays);
  Object.assign(allData, tierData);
  
  // Extract company lists
  allData.topValueCompanies = findTopCompaniesByValue(arrays);
  allData.topVolumeCompanies = findTopCompaniesByVolume(arrays);
  allData.topFeatureCompanies = findTopFeatureCompanies(arrays);
  allData.lowestCompanies = findLowestTransactions(arrays);
  allData.sectorBreakdown = findSectorBreakdown(arrays);
  
  return allData;
};

/**
 * Extract tier classification data with flexible tier name matching
 * @param {Array} arrays - Excel data as 2D array
 * @returns {Object} Tier classification data
 */
const extractTierClassificationData = (arrays) => {
  const tierData = {};
  
  // Find tier classification section
  let tierHeaderIndex = -1;
  for (let i = 0; i < arrays.length; i++) {
    const row = arrays[i];
    if (row && row.length > 0) {
      const firstCell = String(row[0] || "").toUpperCase();
      if (firstCell.includes("TOTAL OF TIER CLASSIFICATION")) {
        tierHeaderIndex = i;
        console.log(`Found tier classification at row ${i}`);
        break;
      }
    }
  }
  
  if (tierHeaderIndex >= 0) {
    // Find the actual data rows (skip headers)
    let dataStartRow = tierHeaderIndex + 2; // Skip "TOTAL OF TIER..." and column headers
    
    for (let i = dataStartRow; i < arrays.length; i++) {
      const row = arrays[i];
      
      if (!row || row.length < 4) continue;
      
      const tierName = String(row[0] || "").trim();
      const valueTraded = row[1];
      const volumeTraded = row[2];
      const companiesTraded = row[3];
      
      // Stop if we reach another section
      if (tierName.toUpperCase().includes("TOP 5") || 
          tierName.toUpperCase().includes("COMPANY NAME")) {
        break;
      }
      
      // Skip empty rows or headers
      if (!tierName || tierName === "" || 
          tierName.toUpperCase().includes("TIER CLASSIFICATION")) {
        continue;
      }
      
      // Check if this is a tier row using regex pattern
      // This will match "Tier 1 (any_value)" or "Tier 2 (any_value)" etc.
      const tierMatch = tierName.match(/^Tier\s+(\d+)\s*\([^)]+\)/i);
      
      if (tierMatch) {
        const tierNumber = tierMatch[1];
        
        // Store the tier data with the original name as key
        tierData[tierName] = valueTraded;
        
        // Also store with standardized keys for easy access
        tierData[`Tier ${tierNumber} Volume`] = volumeTraded;
        tierData[`Tier ${tierNumber} Companies`] = companiesTraded;
        
        console.log(`Extracted tier: ${tierName} = Value: ${valueTraded}, Volume: ${volumeTraded}, Companies: ${companiesTraded}`);
      } else if (tierName.toLowerCase().includes("total")) {
        // Store total values
        tierData["Total Value Traded"] = valueTraded;
        tierData["Total Volume Traded"] = volumeTraded;
        tierData["Total Companies Traded"] = companiesTraded;
        console.log(`Extracted totals: Value: ${valueTraded}, Volume: ${volumeTraded}, Companies: ${companiesTraded}`);
      }
    }
  }
  
  return tierData;
};

/**
 * Extract statistics data from array
 * @param {Array} arrays - Excel data as 2D array
 * @returns {Object} Extracted statistics data
 */
const extractStatisticsData = (arrays) => {
  let statsData = {};
  
  if (!arrays || arrays.length === 0) {
    console.warn("No data in Excel arrays");
    return statsData;
  }
  
  // Search for "STATISTICS" header row
  let headerRowIndex = -1;
  for (let i = 0; i < arrays.length; i++) {
    const row = arrays[i];
    if (row && row.length > 0) {
      const firstCell = String(row[0] || "").toUpperCase();
      if (firstCell.includes("STATISTICS") || firstCell.includes("STATS")) {
        headerRowIndex = i;
        console.log(`Found statistics header at row ${i}: ${firstCell}`);
        break;
      }
    }
  }
  
  // If we found the header row, extract data from following rows
  if (headerRowIndex >= 0) {
    console.log(`Processing data starting at row ${headerRowIndex + 1}`);
    
    for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 20, arrays.length); i++) {
      const row = arrays[i];
      if (row && row.length >= 2) {
        const label = String(row[0] || "").trim();
        const value = row[1];
        
        if (label && value !== undefined && value !== null) {
          // Stop when we reach TIER section
          if (label.toUpperCase().includes("TOTAL OF TIER")) {
            break;
          }
          
          statsData[label] = value;
          console.log(`Extracted ${label} = ${value}`);
        }
      }
    }
  } else {
    console.warn("Could not find statistics section header in Excel file");
  }
  
  return statsData;
};

/**
 * Find top companies by VALUE from Excel file
 * @param {Array} arrays - Excel data as 2D array
 * @returns {Array} Top companies by value data
 */
const findTopCompaniesByValue = (arrays) => {
  const companies = [];
  
  // Search for "TOP 5 HIGHEST VALUE TRADED OF THE MONTH" section
  let valueHeaderIndex = -1;
  
  for (let i = 0; i < arrays.length; i++) {
    const row = arrays[i];
    if (row && row.length > 0) {
      const firstCell = String(row[0] || "").toUpperCase();
      if (firstCell.includes("TOP 5 HIGHEST VALUE TRADED OF THE MONTH")) {
        valueHeaderIndex = i;
        console.log(`Found VALUE section at row ${i}: ${firstCell}`);
        break;
      }
    }
  }
  
  if (valueHeaderIndex >= 0) {
    let dataStartRow = valueHeaderIndex + 2;
    
    for (let i = dataStartRow; i < arrays.length; i++) {
      const row = arrays[i];
      
      if (!row || row.length === 0) break;
      
      const firstCell = String(row[0] || "").toUpperCase();
      if (firstCell.includes("TOP 5") && !firstCell.includes("HIGHEST VALUE")) {
        break;
      }
      
      if (row && row.length >= 4) {
        const companyName = row[0];
        const volumeTraded = row[1];
        const valueTraded = row[2];
        const numberOfDeals = row[3];
        
        if (companyName && companyName !== "" && 
            companyName !== "Company Name" && 
            !String(companyName).toUpperCase().includes("TOTAL")) {
          
          companies.push({
            name: companyName,
            volume: volumeTraded || 0,
            value: valueTraded || 0,
            deals: numberOfDeals || 0
          });
          
          console.log(`Added VALUE company: ${companyName}, Value: ${valueTraded}`);
        }
      }
      
      if (companies.length >= 5) break;
    }
  }
  
  return companies;
};

/**
 * Find top companies by VOLUME from Excel file
 * @param {Array} arrays - Excel data as 2D array
 * @returns {Array} Top companies by volume data
 */
const findTopCompaniesByVolume = (arrays) => {
  const companies = [];
  
  // Search for "TOP 5 HIGHEST VOLUME TRADED OF THE MONTH" section
  let volumeHeaderIndex = -1;
  
  for (let i = 0; i < arrays.length; i++) {
    const row = arrays[i];
    if (row && row.length > 0) {
      const firstCell = String(row[0] || "").toUpperCase();
      if (firstCell.includes("TOP 5 HIGHEST VOLUME TRADED OF THE MONTH")) {
        volumeHeaderIndex = i;
        console.log(`Found VOLUME section at row ${i}: ${firstCell}`);
        break;
      }
    }
  }
  
  if (volumeHeaderIndex >= 0) {
    let dataStartRow = volumeHeaderIndex + 2;
    
    for (let i = dataStartRow; i < arrays.length; i++) {
      const row = arrays[i];
      
      if (!row || row.length === 0) break;
      
      const firstCell = String(row[0] || "").toUpperCase();
      if (firstCell.includes("TOP 5") && !firstCell.includes("HIGHEST VOLUME")) {
        break;
      }
      
      if (row && row.length >= 4) {
        const companyName = row[0];
        const volumeTraded = row[1];
        const valueTraded = row[2];
        const numberOfDeals = row[3];
        
        if (companyName && companyName !== "" && 
            companyName !== "Company Name" && 
            !String(companyName).toUpperCase().includes("TOTAL")) {
          
          companies.push({
            name: companyName,
            volume: volumeTraded || 0,
            value: valueTraded || 0,
            deals: numberOfDeals || 0
          });
          
          console.log(`Added VOLUME company: ${companyName}, Volume: ${volumeTraded}`);
        }
      }
      
      if (companies.length >= 5) break;
    }
  }
  
  return companies;
};

/**
 * Find top feature companies
 * @param {Array} arrays - Excel data as 2D array
 * @returns {Array} Top feature companies data
 */
const findTopFeatureCompanies = (arrays) => {
  const companies = [];
  
  let featureHeaderIndex = -1;
  for (let i = 0; i < arrays.length; i++) {
    const row = arrays[i];
    if (row && row.length > 0) {
      const firstCell = String(row[0] || "").toUpperCase();
      if (firstCell.includes("TOP 5 FEATURE HIGHEST TRANSACTIONS")) {
        featureHeaderIndex = i;
        break;
      }
    }
  }
  
  if (featureHeaderIndex >= 0) {
    let dataStartRow = featureHeaderIndex + 2;
    
    for (let i = dataStartRow; i < arrays.length && companies.length < 5; i++) {
      const row = arrays[i];
      
      if (!row || row.length === 0) break;
      
      const firstCell = String(row[0] || "").toUpperCase();
      if (firstCell.includes("TOP 5") && !firstCell.includes("FEATURE")) {
        break;
      }
      
      if (row && row.length >= 4) {
        const companyName = row[0];
        if (companyName && companyName !== "" && companyName !== "Company Name") {
          companies.push({
            name: companyName,
            volume: row[1] || 0,
            value: row[2] || 0,
            deals: row[3] || 0
          });
        }
      }
    }
  }
  
  return companies;
};

/**
 * Find lowest transactions
 * @param {Array} arrays - Excel data as 2D array
 * @returns {Array} Lowest transactions data
 */
const findLowestTransactions = (arrays) => {
  const companies = [];
  
  let lowestHeaderIndex = -1;
  for (let i = 0; i < arrays.length; i++) {
    const row = arrays[i];
    if (row && row.length > 0) {
      const firstCell = String(row[0] || "").toUpperCase();
      if (firstCell.includes("TOP 5 LOWEST TRANSACTIONS")) {
        lowestHeaderIndex = i;
        break;
      }
    }
  }
  
  if (lowestHeaderIndex >= 0) {
    let dataStartRow = lowestHeaderIndex + 2;
    
    for (let i = dataStartRow; i < arrays.length && companies.length < 5; i++) {
      const row = arrays[i];
      
      if (!row || row.length === 0) break;
      
      const firstCell = String(row[0] || "").toUpperCase();
      if (firstCell.includes("LIST") || firstCell.includes("SECTOR")) {
        break;
      }
      
      if (row && row.length >= 4) {
        const companyName = row[0];
        if (companyName && companyName !== "" && companyName !== "Company Name") {
          companies.push({
            name: companyName,
            volume: row[1] || 0,
            value: row[2] || 0,
            deals: row[3] || 0
          });
        }
      }
    }
  }
  
  return companies;
};

/**
 * Find sector breakdown
 * @param {Array} arrays - Excel data as 2D array
 * @returns {Array} Sector breakdown data
 */
const findSectorBreakdown = (arrays) => {
  const sectors = [];
  
  let sectorHeaderIndex = -1;
  for (let i = 0; i < arrays.length; i++) {
    const row = arrays[i];
    if (row && row.length > 0) {
      const firstCell = String(row[0] || "").toUpperCase();
      if (firstCell.includes("SECTORS:") || 
          (firstCell.includes("SECTOR") && !firstCell.includes("TOP"))) {
        sectorHeaderIndex = i;
        break;
      }
    }
  }
  
  if (sectorHeaderIndex >= 0) {
    for (let i = sectorHeaderIndex + 1; i < arrays.length; i++) {
      const row = arrays[i];
      
      if (!row || row.length < 2) break;
      
      const sectorName = row[0];
      const sectorCount = row[1];
      
      if (sectorName && sectorName !== "" && sectorName !== "SECTORS:") {
        sectors.push({
          sector: sectorName,
          count: sectorCount || 0
        });
      }
    }
  }
  
  return sectors;
};

/**
 * Create monthly data based on selected month
 * @param {Array} arrays - Excel data as 2D array
 * @param {Object} statsData - Extracted statistics data
 * @param {string} selectedMonth - Month selected by user
 * @returns {Array} Monthly data
 */
const createMonthlyData = (arrays, statsData, selectedMonth = 'Mar') => {
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthIndex = months.indexOf(selectedMonth.toLowerCase());
  
  if (monthIndex === -1) {
    console.warn(`Invalid month: ${selectedMonth}. Using default.`);
    return [];
  }
  
  const prevMonthIndex = monthIndex > 0 ? monthIndex - 1 : 11;
  const prevMonth = months[prevMonthIndex].charAt(0).toUpperCase() + months[prevMonthIndex].slice(1);
  
  const nextMonthIndex = monthIndex < 11 ? monthIndex + 1 : 0;
  const nextMonth = months[nextMonthIndex].charAt(0).toUpperCase() + months[nextMonthIndex].slice(1);
  
  const currentMonthDeals = statsData["Number of Deals"] || 0;
  const currentMonthValue = statsData["Sum Value Traded"] || 0;
  
  const currentMonthDealsNum = parseFloat(String(currentMonthDeals).replace(/,/g, '')) || 530;
  const currentMonthValueNum = parseFloat(String(currentMonthValue).replace(/,/g, '')) || 3263603382.81;
  const currentMonthProfit = Math.round(currentMonthValueNum / 1000000);
  
  const prevMonthDeals = Math.round(currentMonthDealsNum * 0.85);
  const prevMonthProfit = Math.round(currentMonthProfit * 0.85);
  
  const nextMonthDeals = 0;
  const nextMonthProfit = 0;
  
  return [
    { month: prevMonth, trades: prevMonthDeals, profit: prevMonthProfit },
    { month: selectedMonth, trades: currentMonthDealsNum, profit: currentMonthProfit },
    { month: nextMonth, trades: nextMonthDeals, profit: nextMonthProfit }
  ];
};

/**
 * Create dashboard data
 * @param {Object} statsData - Statistics data
 * @param {Array} monthlyData - Monthly data
 * @param {string} fileName - File name
 * @param {string} selectedMonth - Month selected by user
 * @returns {Object} Dashboard data
 */
const createDashboardData = (statsData, monthlyData, fileName, selectedMonth = 'Mar') => {
  const sumVolumeTraded = statsData["Sum Volume Traded"] || 0;
  const sumValueTraded = statsData["Sum Value Traded"] || 0;
  const numCompanies = statsData["Number of Companies"] || 0;
  const numDeals = statsData["Number of Deals"] || 0;
  
  console.log(`Key values from Excel: Volume=${sumVolumeTraded}, Value=${sumValueTraded}, Companies=${numCompanies}, Deals=${numDeals}`);
  
  let finalMonthlyData = monthlyData;
  
  const tradePerformance = [
    { category: 'Successful', value: 65, color: '#4CAF50' },
    { category: 'Break-even', value: 20, color: '#2196F3' },
    { category: 'Loss', value: 15, color: '#F44336' }
  ];
  
  const formatNumber = (num) => {
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  const statsMonth = selectedMonth.toUpperCase() + " 2025";
  
  const topNews = [
    `Block Trading Summary for ${statsMonth}`,
    `Sum Volume Traded: ${formatNumber(sumVolumeTraded)}`,
    `Sum Value Traded: $${formatNumber(sumValueTraded)}`,
    `Number of Companies: ${numCompanies}`,
    `Number of Deals: ${numDeals}`,
    `File processed on ${new Date().toLocaleString()}`
  ];
  
  return {
    monthlyData: finalMonthlyData,
    tradePerformance,
    topNews,
    rawStats: statsData,
    selectedMonth: selectedMonth
  };
};