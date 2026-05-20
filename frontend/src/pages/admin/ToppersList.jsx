import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiAward, FiStar } from 'react-icons/fi';

const ToppersList = () => {
  const [toppers, setToppers] = useState([]);

  useEffect(() => {
    const fetchToppers = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get('/api/admin/toppers', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setToppers(data);
    };
    fetchToppers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
          <FiAward className="text-2xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Academic Toppers</h3>
      </div>

      <div className="space-y-4">
        {toppers.map((topper, index) => (
          <div key={topper._id} className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-200 transition gap-4 sm:gap-0">
            <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg shrink-0 ${
                index === 0 ? 'bg-yellow-400 text-white' : 
                index === 1 ? 'bg-slate-300 text-white' : 
                index === 2 ? 'bg-orange-400 text-white' : 'bg-blue-100 text-blue-600'
              }`}>
                {index + 1}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-gray-800 text-base sm:text-lg truncate">{topper.user.name}</h4>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{topper.student.department} | Reg: {topper.student.registerNumber}</p>
              </div>
            </div>
            <div className="text-center sm:text-right w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-200">
              <div className="flex items-center space-x-1 text-yellow-500 font-bold text-lg sm:text-xl justify-center sm:justify-end">
                <FiStar />
                <span>{topper.avgGPA.toFixed(2)}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider">CGPA</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToppersList;
