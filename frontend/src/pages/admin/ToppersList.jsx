import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiAward, FiStar } from 'react-icons/fi';

const ToppersList = () => {
  const [toppers, setToppers] = useState([]);

  useEffect(() => {
    const fetchToppers = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { data } = await axios.get('http://127.0.0.1:5000/api/admin/toppers', {
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
          <div key={topper._id} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-200 transition">
            <div className="flex items-center space-x-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                index === 0 ? 'bg-yellow-400 text-white' : 
                index === 1 ? 'bg-slate-300 text-white' : 
                index === 2 ? 'bg-orange-400 text-white' : 'bg-blue-100 text-blue-600'
              }`}>
                {index + 1}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">{topper.user.name}</h4>
                <p className="text-sm text-gray-500">{topper.student.department} | Reg: {topper.student.registerNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-yellow-500 font-bold text-xl justify-end">
                <FiStar />
                <span>{topper.avgGPA.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Average GPA</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToppersList;
