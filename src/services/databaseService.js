import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * خدمة قاعدة البيانات لحفظ واسترجاع بيانات النشرة
 */
class DatabaseService {
  
  /**
   * حفظ بيانات شهر معين
   * @param {string} month - الشهر (مثل: 'Mar', 'Apr')
   * @param {Object} data - بيانات الشهر
   * @returns {Promise}
   */
  async saveMonthData(month, data) {
    try {
      const docRef = doc(db, 'newsletterData', month);
      await setDoc(docRef, {
        month: month,
        data: data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('تم حفظ البيانات بنجاح للشهر:', month);
      return { success: true };
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      throw error;
    }
  }

  /**
   * استرجاع بيانات شهر معين
   * @param {string} month - الشهر
   * @returns {Promise<Object|null>}
   */
  async getMonthData(month) {
    try {
      const docRef = doc(db, 'newsletterData', month);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const result = docSnap.data();
        console.log('تم استرجاع البيانات للشهر:', month);
        return result.data;
      } else {
        console.log('لا توجد بيانات للشهر:', month);
        return null;
      }
    } catch (error) {
      console.error('خطأ في استرجاع البيانات:', error);
      throw error;
    }
  }

  /**
   * استرجاع جميع الأشهر المتاحة
   * @returns {Promise<Array>}
   */
  async getAllAvailableMonths() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'newsletterData'), orderBy('createdAt', 'desc'))
      );
      
      const months = [];
      querySnapshot.forEach((doc) => {
        months.push(doc.id);
      });
      
      console.log('الأشهر المتاحة:', months);
      return months;
    } catch (error) {
      console.error('خطأ في استرجاع الأشهر:', error);
      throw error;
    }
  }

  /**
   * استرجاع جميع البيانات
   * @returns {Promise<Object>}
   */
  async getAllData() {
    try {
      const querySnapshot = await getDocs(collection(db, 'newsletterData'));
      
      const allData = {};
      querySnapshot.forEach((doc) => {
        allData[doc.id] = doc.data().data;
      });
      
      console.log('تم استرجاع جميع البيانات:', Object.keys(allData));
      return allData;
    } catch (error) {
      console.error('خطأ في استرجاع جميع البيانات:', error);
      throw error;
    }
  }

  /**
   * حذف بيانات شهر معين
   * @param {string} month - الشهر
   * @returns {Promise}
   */
  async deleteMonthData(month) {
    try {
      await deleteDoc(doc(db, 'newsletterData', month));
      console.log('تم حذف البيانات للشهر:', month);
      return { success: true };
    } catch (error) {
      console.error('خطأ في حذف البيانات:', error);
      throw error;
    }
  }

  /**
   * مراقبة التغييرات في الوقت الفعلي
   * @param {Function} callback - دالة تُستدعى عند حدوث تغيير
   * @returns {Function} unsubscribe function
   */
  subscribeToChanges(callback) {
    const q = query(collection(db, 'newsletterData'), orderBy('updatedAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const allData = {};
      querySnapshot.forEach((doc) => {
        allData[doc.id] = doc.data().data;
      });
      callback(allData);
    });
  }

  /**
   * تحديث بيانات شهر موجود
   * @param {string} month - الشهر
   * @param {Object} newData - البيانات الجديدة
   * @returns {Promise}
   */
  async updateMonthData(month, newData) {
    try {
      const docRef = doc(db, 'newsletterData', month);
      const existingDoc = await getDoc(docRef);
      
      if (existingDoc.exists()) {
        await setDoc(docRef, {
          month: month,
          data: newData,
          createdAt: existingDoc.data().createdAt,
          updatedAt: new Date()
        });
        console.log('تم تحديث البيانات للشهر:', month);
      } else {
        // إذا لم يكن موجوداً، أنشئ جديد
        await this.saveMonthData(month, newData);
      }
      return { success: true };
    } catch (error) {
      console.error('خطأ في تحديث البيانات:', error);
      throw error;
    }
  }
}

// تصدير instance واحد من الخدمة
export const databaseService = new DatabaseService();
export default databaseService;