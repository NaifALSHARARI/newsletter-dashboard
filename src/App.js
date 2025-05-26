import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './pages/Dashboard';
import databaseService from './services/databaseService';
import './dashboard.css';

function App() {
  // Global state to store all uploaded data across tabs
  const [globalData, setGlobalData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * تحميل البيانات الأولية من Firebase
   */
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await databaseService.getAllData();
      setGlobalData(data);
      
      // تعيين أول شهر متاح كافتراضي فقط إذا لم يكن هناك شهر محدد
      const availableMonths = Object.keys(data);
      if (availableMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(availableMonths[0]);
      }
      
      console.log('تم تحميل البيانات الأولية:', data);
    } catch (error) {
      console.error('خطأ في تحميل البيانات الأولية:', error);
      setError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  }, []); // إزالة selectedMonth من dependencies

  // تحميل البيانات عند بدء التطبيق فقط
  useEffect(() => {
    loadInitialData();
    
    // الاشتراك في التغييرات في الوقت الفعلي
    const unsubscribe = databaseService.subscribeToChanges((data) => {
      console.log('تم استلام تحديث من Firebase:', data);
      setGlobalData(prevData => {
        // تحديث البيانات مع الحفاظ على الشهر المحدد حالياً
        const newData = { ...data };
        return newData;
      });
    });

    // تنظيف الاشتراك عند إنهاء المكون
    return () => unsubscribe();
  }, []); // dependencies فارغة - التحميل مرة واحدة فقط

  // useEffect منفصل لتعيين الشهر الافتراضي عند توفر البيانات
  useEffect(() => {
    if (Object.keys(globalData).length > 0 && !selectedMonth) {
      const availableMonths = Object.keys(globalData).sort();
      setSelectedMonth(availableMonths[0]);
    }
  }, [globalData, selectedMonth]);

  /**
   * حفظ بيانات شهر جديد
   * @param {string} month - الشهر
   * @param {Object} data - البيانات
   */
  const storeDataByMonth = async (month, data) => {
    try {
      console.log('حفظ البيانات للشهر:', month, data);
      
      // تحديث البيانات محلياً فوراً
      setGlobalData(prevData => ({
        ...prevData,
        [month]: data
      }));
      setSelectedMonth(month);
      
      // حفظ في Firebase
      await databaseService.saveMonthData(month, data);
      
      console.log('تم حفظ البيانات بنجاح في Firebase');
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      setError('فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.');
      
      // إزالة البيانات المحلية في حالة فشل الحفظ
      setGlobalData(prevData => {
        const newData = { ...prevData };
        delete newData[month];
        return newData;
      });
    }
  };

  /**
   * استرجاع بيانات شهر معين
   * @param {string} month - الشهر
   * @returns {Object|null}
   */
  const getDataByMonth = useCallback((month) => {
    return globalData[month] || null;
  }, [globalData]);

  /**
   * الحصول على قائمة الأشهر المتاحة
   * @returns {Array}
   */
  const getAvailableMonths = useCallback(() => {
    return Object.keys(globalData).sort();
  }, [globalData]);

  /**
   * تغيير الشهر المحدد بشكل آمن
   * @param {string} month - الشهر الجديد
   */
  const handleMonthChange = useCallback((month) => {
    console.log('تغيير الشهر من', selectedMonth, 'إلى', month);
    setSelectedMonth(month);
    // لا نقوم بإعادة تحميل البيانات، فقط تغيير الشهر المحدد
  }, [selectedMonth]);

  /**
   * حذف بيانات شهر معين
   * @param {string} month - الشهر
   */
  const deleteMonthData = async (month) => {
    try {
      // حذف محلياً
      setGlobalData(prevData => {
        const newData = { ...prevData };
        delete newData[month];
        return newData;
      });
      
      // حذف من Firebase
      await databaseService.deleteMonthData(month);
      
      // إذا كان الشهر المحذوف هو المحدد حالياً، إعادة تعيين
      if (selectedMonth === month) {
        const remainingMonths = Object.keys(globalData).filter(m => m !== month);
        setSelectedMonth(remainingMonths.length > 0 ? remainingMonths[0] : '');
      }
      
      console.log('تم حذف البيانات بنجاح للشهر:', month);
    } catch (error) {
      console.error('خطأ في حذف البيانات:', error);
      setError('فشل في حذف البيانات. يرجى المحاولة مرة أخرى.');
      
      // إعادة تحميل البيانات في حالة الفشل
      loadInitialData();
    }
  };

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>جارٍ تحميل التطبيق...</h2>
          <p>يتم استرجاع البيانات من قاعدة البيانات</p>
        </div>
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <div className="app-error">
        <div className="error-container">
          <h2>حدث خطأ</h2>
          <p>{error}</p>
          <button 
            onClick={loadInitialData}
            className="retry-button"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Dashboard 
        globalData={globalData}
        selectedMonth={selectedMonth}
        setSelectedMonth={handleMonthChange} // استخدم الدالة الآمنة
        storeDataByMonth={storeDataByMonth}
        getDataByMonth={getDataByMonth}
        getAvailableMonths={getAvailableMonths}
        deleteMonthData={deleteMonthData}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

export default App;