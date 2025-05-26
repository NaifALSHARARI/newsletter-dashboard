import React, { useState, useEffect } from 'react';
import ExcelAnalyzer from '../components/ExcelAnalyzer';
import FileUpload from '../components/FileUpload';
import ReportsTab from '../components/ReportsTab';

/**
 * مكون Dashboard الرئيسي للتطبيق مع إدارة البيانات حسب الشهر
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

  // تحديث البيانات عند تغيير الشهر المحدد
  useEffect(() => {
    if (selectedMonth && globalData[selectedMonth]) {
      setDashboardData(globalData[selectedMonth]);
    }
  }, [selectedMonth, globalData]);

  // معالجة البيانات المرفوعة
  const handleDataProcessed = (newData, month) => {
    console.log('تم استلام البيانات المعالجة:', newData, 'للشهر:', month);
    
    // التأكد من وجود البيانات المطلوبة
    if (!newData || !newData.monthlyData || !newData.tradePerformance || !newData.topNews) {
      console.error('البيانات المستلمة غير مكتملة:', newData);
      return;
    }
    
    // حفظ البيانات حسب الشهر
    storeDataByMonth(month, newData);
    
    // تحديث البيانات المحلية
    setDashboardData(newData);
    
    // الانتقال إلى صفحة تحليل البيانات بعد الرفع
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
        {/* عرض ملخص البيانات المرفوعة */}
        {availableMonths.length > 0 && (
          <div className="dashboard-card full-width uploaded-data-summary">
            <h3>📋 ملخص البيانات المرفوعة</h3>
            <div className="uploaded-months-grid">
              {availableMonths.map(month => {
                const monthData = getDataByMonth(month);
                return (
                  <div key={month} className="month-summary-card">
                    <h4>{month} 2025</h4>
                    <div className="month-stats">
                      <div className="stat-item">
                        <span className="stat-label">عدد الصفقات</span>
                        <span className="stat-value">
                          {monthData?.rawStats?.["Number of Deals"] || "N/A"}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">قيمة التداول</span>
                        <span className="stat-value">
                          {monthData?.rawStats?.["Sum Value Traded"] || "N/A"}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">عدد الشركات</span>
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
                      عرض التفاصيل
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
            <h3>📈 أخبار التداول اليوم</h3>
            <ul className="news-list">
              <li className="news-item">السوق السعودي يسجل ارتفاعاً بنسبة 2.5% في تداولات اليوم</li>
              <li className="news-item">أرامكو تعلن عن نتائج قوية للربع الماضي</li>
              <li className="news-item">قطاع البنوك يتصدر المكاسب بارتفاع 3.2%</li>
              <li className="news-item">تداول أكثر من 150 مليون سهم بقيمة 4.2 مليار ريال</li>
              <li className="news-item">المؤشر العام يغلق عند مستوى 12,850 نقطة</li>
            </ul>
          </div>

          <div className="dashboard-card market-overview">
            <h3>📊 نظرة عامة على السوق</h3>
            <div className="market-stats">
              <div className="stat-item">
                <span className="stat-label">المؤشر العام</span>
                <span className="stat-value positive">12,850.25 ↗</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">حجم التداول</span>
                <span className="stat-value">150.2 مليون سهم</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">قيمة التداول</span>
                <span className="stat-value">4.2 مليار ريال</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">عدد الصفقات</span>
                <span className="stat-value">285,400</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card analysis-card">
            <h3>🔍 تحليل السوق</h3>
            <div className="analysis-content">
              <p><strong>الاتجاه العام:</strong> صاعد بقوة</p>
              <p><strong>مستوى المقاومة:</strong> 12,900 نقطة</p>
              <p><strong>مستوى الدعم:</strong> 12,700 نقطة</p>
              <p><strong>القطاعات الرابحة:</strong> البنوك، البتروكيماويات، التأمين</p>
              <p><strong>القطاعات الخاسرة:</strong> العقارات، الاتصالات</p>
            </div>
          </div>

          <div className="dashboard-card top-stocks">
            <h3>🏆 أفضل الأسهم</h3>
            <div className="stocks-list">
              <div className="stock-item">
                <span className="stock-name">أرامكو السعودية</span>
                <span className="stock-change positive">+2.8%</span>
              </div>
              <div className="stock-item">
                <span className="stock-name">البنك الأهلي</span>
                <span className="stock-change positive">+3.5%</span>
              </div>
              <div className="stock-item">
                <span className="stock-name">سابك</span>
                <span className="stock-change positive">+1.9%</span>
              </div>
              <div className="stock-item">
                <span className="stock-name">مصرف الراجحي</span>
                <span className="stock-change positive">+2.1%</span>
              </div>
              <div className="stock-item">
                <span className="stock-name">معادن</span>
                <span className="stock-change negative">-1.3%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card full-width">
          <h3>💡 نصائح وتوصيات</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <h4>استراتيجية الاستثمار</h4>
              <p>التركيز على الأسهم ذات الأساسيات القوية في القطاعات الدفاعية</p>
            </div>
            <div className="tip-item">
              <h4>إدارة المخاطر</h4>
              <p>وضع أوامر وقف الخسارة عند مستويات الدعم المحددة</p>
            </div>
            <div className="tip-item">
              <h4>الفرص المتاحة</h4>
              <p>قطاع البنوك يظهر إشارات إيجابية قوية للاستثمار طويل المدى</p>
            </div>
          </div>
        </div>

        {/* Call to Action if no data uploaded */}
        {availableMonths.length === 0 && (
          <div className="dashboard-card full-width cta-card">
            <h3>🚀 ابدأ بتحليل بياناتك</h3>
            <p>لا توجد بيانات مرفوعة حتى الآن. ابدأ برفع ملف Excel الخاص بالنشرة الإخبارية لتحليل البيانات.</p>
            <button 
              className="cta-button"
              onClick={() => setActiveTab('upload')}
            >
              رفع البيانات الآن
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