
import React, { useState, useEffect, useMemo } from 'react';

// --- Types & Constants ---
const ICE_LEVELS = ['固定', '微冰', '去冰', '溫熱'];
const SWEETNESS_LEVELS = ['固定', '半糖', '三分糖', '二分糖', '一分糖', '無糖'];
const DEFAULT_SHOPS = ['50嵐', '一沐日', '五桐號', '迷客夏', '可不可', '得正'];

// --- Utility Functions ---
const getFormattedDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateString = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
};

const calculateStats = (records, currentMonth) => {
  // 年度紀錄
  const annual = records;
  // 月份紀錄
  const monthly = records.filter(r => {
    const d = new Date(parseDateString(r.date));
    return d.getMonth() === currentMonth;
  });
  
  // 修正加總邏輯：確保使用更嚴謹的 parseFloat 並給予初始值
  const sumPrice = (acc, curr) => acc + (parseFloat(curr.price) || 0);

  return {
    monthlyCount: monthly.length,
    monthlyCost: Math.round(monthly.reduce(sumPrice, 0)),
    annualCount: annual.length,
    annualCost: Math.round(annual.reduce(sumPrice, 0))
  };
};

const getTopFrequency = (records, key) => {
  if (records.length === 0) return { name: '暫無數據', count: 0 };
  const counts = {};
  records.forEach(r => {
    const val = r[key];
    if (val) counts[val] = (counts[val] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return { name: '暫無數據', count: 0 };
  return { name: sorted[0][0], count: sorted[0][1] };
};

// --- Sub-Components ---

const StatCard = ({ label, subLabel, value, unit, bgColor, textColor, onClick, smallValue = false }) => (
  <div 
    style={{ backgroundColor: bgColor }} 
    onClick={onClick}
    className={`p-6 rounded-[2.5rem] card-shadow border border-white/20 flex flex-col justify-between aspect-square transition-transform active:scale-95 ${onClick ? 'cursor-pointer hover:brightness-95' : ''}`}
  >
    <div>
      <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">{label}</p>
      <p className={`text-xs font-bold ${textColor} opacity-60`}>{subLabel}</p>
    </div>
    <div className="flex items-baseline space-x-1">
      <span className={`${smallValue ? 'text-2xl' : 'text-4xl'} font-black ${textColor} tracking-tighter`}>{value}</span>
      <span className={`text-[10px] font-bold ${textColor} opacity-60`}>{unit}</span>
    </div>
  </div>
);

const RecordForm = ({ onSave, onCancel, existingCount, availableShops }) => {
  const [shop, setShop] = useState('');
  const [item, setItem] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [sweetness, setSweetness] = useState('三分糖');
  const [ice, setIce] = useState('微冰');
  const [isCustomShop, setIsCustomShop] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanPrice = parseFloat(priceStr);
    if (!shop || !item || isNaN(cleanPrice)) return;
    onSave({ shop, item, price: cleanPrice, sweetness, ice });
  };

  return (
    <div className="bg-white rounded-t-[3rem] sm:rounded-[3.5rem] p-10 card-shadow animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em]">New Prescription</p>
          <h3 className="text-2xl font-black text-stone-700">開立處方箋 {existingCount + 1}</h3>
        </div>
        <button onClick={onCancel} className="text-stone-300 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-4">
        <div className="space-y-3">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Shop 店家</p>
          {!isCustomShop ? (
            <div className="flex flex-col space-y-3">
              <select 
                className="w-full bg-stone-50 p-5 rounded-2xl font-bold text-stone-700 outline-none border-none appearance-none cursor-pointer"
                value={shop}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setIsCustomShop(true);
                    setShop("");
                  } else {
                    setShop(e.target.value);
                  }
                }}
              >
                <option value="" disabled>請選擇店家</option>
                {availableShops.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="__new__" className="text-rose-500 font-bold">+ 新增店家...</option>
              </select>
            </div>
          ) : (
            <div className="relative">
              <input 
                autoFocus
                placeholder="輸入新店家名稱" 
                className="w-full bg-stone-50 border-none p-5 rounded-2xl font-bold focus:ring-2 ring-stone-200 outline-none"
                value={shop} onChange={e => setShop(e.target.value)}
              />
              <button type="button" onClick={() => setIsCustomShop(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 underline">返回</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input 
            placeholder="飲品名稱" 
            className="w-full bg-stone-50 border-none p-5 rounded-2xl font-bold focus:ring-2 ring-stone-200 outline-none"
            value={item} onChange={e => setItem(e.target.value)}
          />
          <input 
            type="number" 
            inputMode="decimal"
            placeholder="價格 (例如: 30)" 
            className="w-full bg-stone-50 border-none p-5 rounded-2xl font-bold focus:ring-2 ring-stone-200 outline-none"
            value={priceStr} onChange={e => setPriceStr(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Sweetness 甜度</p>
          <div className="flex flex-wrap gap-2">
            {SWEETNESS_LEVELS.map(s => (
              <button key={s} type="button" onClick={() => setSweetness(s)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${sweetness === s ? 'bg-stone-700 border-stone-700 text-white shadow-md' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Ice Level 冰塊</p>
          <div className="flex flex-wrap gap-2">
            {ICE_LEVELS.map(i => (
              <button key={i} type="button" onClick={() => setIce(i)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${ice === i ? 'bg-stone-600 border-stone-600 text-white shadow-md' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'}`}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-stone-700 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-stone-200 active:scale-95 transition-transform mt-4">
          確認加入紀錄
        </button>
      </form>
    </div>
  );
};

// --- Main App Component ---

const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
};

const App = () => {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('drink_records_2026');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [shops, setShops] = useState(() => {
    try {
      const saved = localStorage.getItem('drink_shops_2026');
      return saved ? JSON.parse(saved) : DEFAULT_SHOPS;
    } catch { return DEFAULT_SHOPS; }
  });

  const [currentViewDate, setCurrentViewDate] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState(getFormattedDate(new Date()));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [analyticsType, setAnalyticsType] = useState(null);

  useEffect(() => {
    localStorage.setItem('drink_records_2026', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('drink_shops_2026', JSON.stringify(shops));
  }, [shops]);

  const stats = useMemo(() => calculateStats(records, currentViewDate.getMonth()), [records, currentViewDate]);
  const favoriteShop = useMemo(() => getTopFrequency(records, 'shop'), [records]);
  const favoriteItem = useMemo(() => getTopFrequency(records, 'item'), [records]);

  const allAnalyticsData = useMemo(() => {
    if (!analyticsType) return [];
    const map = new Map();
    records.forEach(r => {
      const val = r[analyticsType];
      if (val) map.set(val, (map.get(val) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, [records, analyticsType]);

  const monthLabel = `${currentViewDate.getFullYear()} / ${String(currentViewDate.getMonth() + 1).padStart(2, '0')}`;
  const firstDayOfMonth = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 0).getDate();

  const addRecord = (newDrink) => {
    if (!selectedDate) return;
    // 再次確保 price 是純數字存入
    const record = { 
      ...newDrink, 
      price: parseFloat(newDrink.price) || 0,
      id: crypto.randomUUID(), 
      date: selectedDate 
    };
    if (!shops.includes(newDrink.shop)) setShops(prev => [...prev, newDrink.shop]);
    setRecords(prev => [...prev, record]);
    setIsFormOpen(false);
  };

  const removeRecord = (id) => setRecords(prev => prev.filter(r => r.id !== id));
  const getRecordsForDate = (dateStr) => records.filter(r => r.date === dateStr);
  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    if (getRecordsForDate(dateStr).length < 2) {
      setIsFormOpen(true);
    }
  };

  const colors = { 
    blue: '#DCE4E9', 
    purple: '#E7E4ED', 
    sage: '#E5E9E4', 
    pink: '#EFE8E8', 
    dot: '#A8B8A8', 
    shopColor: 'rgba(231, 223, 226, 0.8)', 
    drinkColor: 'rgba(188, 207, 195, 0.8)' 
  };

  return (
    <div className="min-h-screen bg-[#ffffff] font-sans selection:bg-stone-200">
      <div className="max-w-xl mx-auto px-6 pt-12 pb-24 space-y-12">
        <div className="flex justify-center">
           <div className="bg-stone-600 px-10 py-5 rounded-full shadow-xl border border-stone-500 flex items-center space-x-3">
             <span className="text-lg font-black text-white tracking-[0.2em]">手搖成癮患者 🥤</span>
           </div>
        </div>

        <div className="space-y-3 px-2 text-center">
          <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.5em] ml-[0.5em]">2026 Case Report</p>
          <h2 className="text-xl font-black text-stone-700 tracking-[0.6em] leading-tight ml-[0.6em] whitespace-nowrap">
            2026 手搖成癮病歷表 📋
          </h2>
        </div>

        {/* 主要數據卡片 */}
        <section className="grid grid-cols-2 gap-6">
          <StatCard label="Monthly Dose" subLabel="當月劑量" value={stats.monthlyCount} unit="杯" bgColor={colors.blue} textColor="text-stone-700" />
          <StatCard label="Monthly Fee" subLabel="當月診療費" value={`$${stats.monthlyCost}`} unit="" bgColor={colors.purple} textColor="text-stone-700" />
          <StatCard label="Annual Dose" subLabel="年度劑量" value={stats.annualCount} unit="杯" bgColor={colors.sage} textColor="text-stone-700" />
          <StatCard label="Annual Fee" subLabel="年度診療費" value={`$${stats.annualCost}`} unit="" bgColor={colors.pink} textColor="text-stone-700" />
        </section>

        {/* 日曆區塊 */}
        <section className="bg-white rounded-[4rem] p-8 sm:p-10 shadow-2xl shadow-stone-100 border border-stone-100">
          <div className="flex justify-between items-center mb-10 px-4">
            <button onClick={() => setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1))} className="text-stone-300 p-2"><Icons.ChevronLeft /></button>
            <h3 className="text-2xl font-black text-stone-600 font-mono tracking-tighter">{monthLabel}</h3>
            <button onClick={() => setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1))} className="text-stone-300 p-2"><Icons.ChevronRight /></button>
          </div>
          <div className="grid grid-cols-7 gap-y-6 text-center">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d} className="text-[10px] font-black text-stone-400 tracking-[0.2em] pb-3">{d}</div>)}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dStr = getFormattedDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), day));
              const dayRecs = getRecordsForDate(dStr);
              return (
                <button key={day} onClick={() => handleDateClick(dStr)} className={`relative h-16 flex flex-col items-center justify-center transition-all ${selectedDate === dStr ? 'bg-stone-100 rounded-[1.5rem] scale-110 shadow-md' : ''}`}>
                  <span className={`text-sm font-black ${selectedDate === dStr ? 'text-stone-800' : 'text-stone-400'}`}>{day}</span>
                  <div className="flex space-x-1 mt-2 h-1.5">
                    {dayRecs.map((_, idx) => (
                      <div key={idx} style={{backgroundColor: colors.dot}} className="w-1.5 h-1.5 rounded-full" />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 選中日期的紀錄 */}
        {selectedDate && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-stone-700 p-10 rounded-[3.5rem] shadow-xl text-white">
               <h4 className="text-3xl font-black tracking-tight">{new Date(parseDateString(selectedDate)).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}</h4>
            </div>
            {getRecordsForDate(selectedDate).map((r, i) => (
              <div key={r.id} className="bg-white p-8 rounded-[3rem] shadow-lg border border-stone-100 flex justify-between items-center">
                <div className="space-y-1">
                  <h5 className="font-black text-stone-700 text-xl">{r.shop} {r.item}</h5>
                  <p className="text-sm text-stone-500 font-bold">{r.sweetness} / {r.ice}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-black text-stone-700">${parseFloat(r.price) || 0}</span>
                  <button onClick={() => removeRecord(r.id)} className="text-stone-200 hover:text-rose-400"><Icons.Trash /></button>
                </div>
              </div>
            ))}
            {getRecordsForDate(selectedDate).length < 2 && (
              <button onClick={() => setIsFormOpen(true)} className="w-full py-10 border-2 border-dashed border-stone-200 rounded-[3rem] text-stone-400 flex items-center justify-center space-x-4 bg-white hover:border-stone-400 transition-all">
                <Icons.Plus /> <span className="font-black text-sm tracking-widest uppercase">Add Prescription</span>
              </button>
            )}
          </div>
        )}

        {/* 年度統計卡片 */}
        <section className="grid grid-cols-2 gap-6 pt-4">
           <StatCard 
             label="Favorite Shop" 
             subLabel="最愛店家" 
             value={favoriteShop.name} 
             unit={`${favoriteShop.count}次`} 
             bgColor={colors.shopColor} 
             textColor="text-stone-700" 
             onClick={() => setAnalyticsType('shop')}
             smallValue={true}
           />
           <StatCard 
             label="Favorite Drink" 
             subLabel="最愛飲品" 
             value={favoriteItem.name} 
             unit={`${favoriteItem.count}次`} 
             bgColor={colors.drinkColor} 
             textColor="text-stone-700" 
             onClick={() => setAnalyticsType('item')}
             smallValue={true}
           />
        </section>

        <footer className="pt-12 text-center pb-8">
          <p className="text-[10px] text-stone-400 uppercase tracking-[0.6em] font-black">Tea Addiction Clinic &copy; 2026</p>
        </footer>

        {/* 統計詳情彈窗 */}
        {analyticsType && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-sm p-0 sm:p-8">
            <div className="w-full max-w-lg bg-white rounded-t-[3.5rem] sm:rounded-[3.5rem] p-10 card-shadow max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em]">Analytics</p>
                  <h3 className="text-2xl font-black text-stone-700">{analyticsType === 'shop' ? '店家成癮排名' : '飲品成癮排名'}</h3>
                </div>
                <button onClick={() => setAnalyticsType(null)} className="text-stone-300 p-2"><Icons.Close /></button>
              </div>
              <div className="overflow-y-auto custom-scrollbar space-y-4 pr-2 pb-4">
                {allAnalyticsData.map((data, idx) => (
                  <div key={data.name} className="flex items-center justify-between p-6 bg-stone-50 rounded-[2rem]">
                    <div className="flex items-center space-x-4">
                      <span className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-black text-stone-500">{idx + 1}</span>
                      <span className="font-bold text-stone-700 text-lg">{data.name}</span>
                    </div>
                    <span className="text-stone-400 font-black">{data.count} 次</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 新增紀錄彈窗 */}
        {isFormOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-sm p-0 sm:p-8">
            <div className="w-full max-w-lg">
              <RecordForm onSave={addRecord} onCancel={() => setIsFormOpen(false)} existingCount={getRecordsForDate(selectedDate).length} availableShops={shops} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
