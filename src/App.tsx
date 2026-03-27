import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Trophy, 
  Upload, 
  UserPlus, 
  Trash2, 
  Shuffle, 
  Settings2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  UserCheck
} from 'lucide-react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { Person, Tab } from './types';

export default function App() {
  const [names, setNames] = useState<Person[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('draw');
  
  // Lucky Draw State
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Person | null>(null);
  const [drawHistory, setDrawHistory] = useState<Person[]>([]);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [availableNames, setAvailableNames] = useState<Person[]>([]);

  // Grouping State
  const [groupSize, setGroupSize] = useState(3);
  const [groups, setGroups] = useState<Person[][]>([]);

  useEffect(() => {
    setAvailableNames(names);
    setWinner(null);
    setDrawHistory([]);
    setGroups([]);
  }, [names]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const parsedNames: Person[] = results.data
          .flat()
          .filter((name: any) => typeof name === 'string' && name.trim() !== '')
          .map((name: any, index) => ({
            id: `csv-${index}-${Date.now()}`,
            name: name.trim(),
          }));
        setNames(prev => [...prev, ...parsedNames]);
      },
      header: false,
    });
  };

  const handleAddNames = () => {
    if (!inputText.trim()) return;
    const newNames: Person[] = inputText
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n !== '')
      .map((name, index) => ({
        id: `manual-${index}-${Date.now()}`,
        name,
      }));
    setNames(prev => [...prev, ...newNames]);
    setInputText('');
  };

  const useMockData = () => {
    const mockNames = [
      '陳大文', '林小明', '張美玲', '李志強', '王小華', 
      '趙敏', '周杰倫', '蔡依林', '劉德華', '張學友',
      '郭富城', '黎明', '林青霞', '王祖賢', '張曼玉',
      '梁朝偉', '周星馳', '成龍', '李連杰', '甄子丹'
    ];
    const formattedMock: Person[] = mockNames.map((name, index) => ({
      id: `mock-${index}-${Date.now()}`,
      name,
    }));
    setNames(formattedMock);
  };

  const removeDuplicates = () => {
    const seen = new Set();
    const uniqueNames = names.filter(person => {
      const duplicate = seen.has(person.name);
      seen.add(person.name);
      return !duplicate;
    });
    setNames(uniqueNames);
  };

  const clearNames = () => {
    if (window.confirm('確定要清除所有名單嗎？')) {
      setNames([]);
    }
  };

  const startDraw = () => {
    const pool = allowRepeat ? names : availableNames;
    if (pool.length === 0) {
      alert('沒有可抽籤的人選了！');
      return;
    }

    setIsDrawing(true);
    setWinner(null);

    // Animation duration
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        setWinner(pool[randomIndex]);
        requestAnimationFrame(animate);
      } else {
        const finalIndex = Math.floor(Math.random() * pool.length);
        const finalWinner = pool[finalIndex];
        setWinner(finalWinner);
        setIsDrawing(false);
        setDrawHistory(prev => [finalWinner, ...prev]);
        
        if (!allowRepeat) {
          setAvailableNames(prev => prev.filter(p => p.id !== finalWinner.id));
        }

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
        });
      }
    };

    requestAnimationFrame(animate);
  };

  const handleGroup = () => {
    if (names.length === 0) return;
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const newGroups: Person[][] = [];
    for (let i = 0; i < shuffled.length; i += groupSize) {
      newGroups.push(shuffled.slice(i, i + groupSize));
    }
    setGroups(newGroups);
  };

  const downloadGroupsCSV = () => {
    if (groups.length === 0) return;
    
    let csvContent = "Group,Name\n";
    groups.forEach((group, idx) => {
      group.forEach(person => {
        csvContent += `${idx + 1},${person.name}\n`;
      });
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "grouping_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const duplicateNames = names.filter((person, index) => 
    names.findIndex(p => p.name === person.name) !== index
  ).map(p => p.name);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">HR 管理工具</h1>
            <p className="text-gray-500 mt-1">抽籤與自動分組系統</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">當前名單：{names.length} 人</span>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: List Management */}
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-semibold flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> 名單來源
                </h2>
                {names.length > 0 && (
                  <button 
                    onClick={clearNames}
                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> 清除
                  </button>
                )}
              </div>
              <div className="p-5 space-y-4">
                {/* File Upload */}
                <div className="relative group">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center group-hover:border-blue-400 group-hover:bg-blue-50/30 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500" />
                    <p className="text-sm font-medium text-gray-600">上傳 CSV 檔案</p>
                    <p className="text-xs text-gray-400 mt-1">點擊或拖拽至此</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400">或直接貼上姓名</span>
                  </div>
                </div>

                {/* Text Input */}
                <div className="space-y-2">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="輸入姓名，以換行或逗號分隔..."
                    className="w-full h-32 p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddNames}
                      disabled={!inputText.trim()}
                      className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> 加入名單
                    </button>
                    <button
                      onClick={useMockData}
                      className="px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-all flex items-center justify-center gap-2 text-sm"
                      title="使用模擬名單"
                    >
                      <Copy className="w-4 h-4" /> 模擬
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Name List Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">名單預覽</h3>
                {duplicateNames.length > 0 && (
                  <button 
                    onClick={removeDuplicates}
                    className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold hover:bg-amber-200 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> 移除重複項 ({duplicateNames.length})
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2">
                {names.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 space-y-2">
                    <AlertCircle className="w-6 h-6 mx-auto opacity-20" />
                    <p className="text-xs">尚未加入任何名單</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {names.map((person) => {
                      const isDuplicate = names.filter(p => p.name === person.name).length > 1;
                      return (
                        <div 
                          key={person.id}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                            isDuplicate 
                              ? "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-200" 
                              : "bg-gray-50 text-gray-600 border-gray-100"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{person.name}</span>
                            {isDuplicate && <AlertCircle className="w-3 h-3 text-amber-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right Column: Features */}
          <section className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
              <button
                onClick={() => setActiveTab('draw')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                  activeTab === 'draw' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <Trophy className="w-4 h-4" /> 獎品抽籤
              </button>
              <button
                onClick={() => setActiveTab('group')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                  activeTab === 'group' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <Users className="w-4 h-4" /> 自動分組
              </button>
            </div>

            {/* Feature Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[500px] p-8">
              {activeTab === 'draw' ? (
                <div className="h-full flex flex-col items-center justify-center space-y-12">
                  {/* Settings */}
                  <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">抽籤設定：</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div 
                        onClick={() => setAllowRepeat(!allowRepeat)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative",
                          allowRepeat ? "bg-blue-500" : "bg-gray-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                          allowRepeat ? "left-6" : "left-1"
                        )} />
                      </div>
                      <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700">允許重複中獎</span>
                    </label>
                    {!allowRepeat && (
                      <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">
                        剩餘人選：{availableNames.length}
                      </div>
                    )}
                  </div>

                  {/* Draw Display */}
                  <div className="relative w-full max-w-md aspect-video flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-50 rounded-[40px] blur-3xl opacity-30 animate-pulse"></div>
                    <AnimatePresence mode="wait">
                      {winner ? (
                        <motion.div
                          key={winner.id + (isDrawing ? '-drawing' : '-final')}
                          initial={{ scale: 0.8, opacity: 0, y: 20 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 1.1, opacity: 0 }}
                          className="relative z-10 text-center"
                        >
                          <p className={cn(
                            "text-6xl md:text-8xl font-black tracking-tighter",
                            isDrawing ? "text-gray-300 italic" : "text-gray-900"
                          )}>
                            {winner.name}
                          </p>
                          {!isDrawing && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 flex items-center justify-center gap-2 text-blue-500 font-bold"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                              恭喜中獎！
                            </motion.div>
                          )}
                        </motion.div>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                            <Trophy className="w-10 h-10 text-gray-200" />
                          </div>
                          <p className="text-gray-400 font-medium">準備好開始抽籤了嗎？</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action */}
                  <button
                    onClick={startDraw}
                    disabled={isDrawing || names.length === 0 || (!allowRepeat && availableNames.length === 0)}
                    className={cn(
                      "group relative px-12 py-5 bg-gray-900 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none overflow-hidden",
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {isDrawing ? "正在抽取..." : "開始抽籤"}
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </span>
                    {isDrawing && (
                      <motion.div 
                        className="absolute inset-0 bg-blue-600"
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 2, ease: "linear" }}
                      />
                    )}
                  </button>

                  {/* History */}
                  {drawHistory.length > 0 && (
                    <div className="w-full max-w-2xl">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <div className="h-px flex-1 bg-gray-100"></div>
                        中獎記錄
                        <div className="h-px flex-1 bg-gray-100"></div>
                      </h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        {drawHistory.map((h, i) => (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={`${h.id}-${i}`}
                            className="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-medium text-gray-600 flex items-center gap-2"
                          >
                            <span className="w-5 h-5 bg-gray-50 rounded-full flex items-center justify-center text-[10px] text-gray-400">
                              {drawHistory.length - i}
                            </span>
                            {h.name}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Grouping Controls */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Settings2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">分組設定</p>
                        <p className="text-xs text-gray-500">設定每組的人數上限</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
                        <button 
                          onClick={() => setGroupSize(Math.max(2, groupSize - 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors text-gray-500 font-bold"
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          value={groupSize}
                          onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                          className="w-16 text-center font-bold text-lg outline-none"
                        />
                        <button 
                          onClick={() => setGroupSize(groupSize + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors text-gray-500 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={handleGroup}
                        disabled={names.length === 0}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                      >
                        <Shuffle className="w-4 h-4" /> 開始分組
                      </button>
                      {groups.length > 0 && (
                        <button
                          onClick={downloadGroupsCSV}
                          className="px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                          title="下載 CSV"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grouping Results */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {groups.length > 0 ? (
                      groups.map((group, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx}
                          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all"
                        >
                          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">第 {idx + 1} 組</span>
                            <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{group.length} 人</span>
                          </div>
                          <div className="p-5 space-y-2">
                            {group.map((p) => (
                              <div key={p.id} className="flex items-center gap-3 py-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                <span className="text-sm font-medium text-gray-700">{p.name}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                          <Users className="w-10 h-10 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-medium">點擊「開始分組」來查看結果</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 text-gray-400 text-xs">
          <p>© 2026 HR Tool: Lucky Draw & Grouping System</p>
        </footer>
      </div>
    </div>
  );
}
