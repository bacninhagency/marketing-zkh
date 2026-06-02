import React, { useMemo, useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Users, 
  PieChart as PieIcon, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  ChevronRight,
  Sparkles,
  Layers,
  CalendarDays,
  Lock,
  Download,
  FileSpreadsheet,
  Table,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Task, Member, Invoice, RolePermissions } from '../types';

interface DashboardProps {
  tasks: Task[];
  members: Member[];
  invoices: Invoice[];
  onNavigate: (tab: string) => void;
  currentUser: Member;
  permissions: RolePermissions;
  divisions?: string[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Dashboard({ 
  tasks, 
  members, 
  invoices, 
  onNavigate, 
  currentUser, 
  permissions: passedPermissions,
  divisions: passedDivisions
}: DashboardProps) {
  const divisionsList = passedDivisions || ['Content', 'Design', 'Digital Ads', 'Event & PR'];
  const permissions = passedPermissions || {
    tasks_create: false,
    tasks_edit_all: false,
    tasks_delete: false,
    billing_view: false,
    billing_create: false,
    billing_status_update: false,
    billing_delete: false,
    team_add_member: false,
    roles_manage: false
  };

  const [showPreview, setShowPreview] = useState(false);

  const handleExportCSV = () => {
    // BOM for Excel display in Vietnamese UTF-8
    let csvContent = '\uFEFF';
    
    // Header
    csvContent += 'BÁO CÁO TỔNG HỢP HIỆU SUẤT PHÂN BAN\n';
    csvContent += `Thời gian xuất báo cáo: ${new Date().toLocaleString('vi-VN')}\n`;
    csvContent += `Người xuất: ${currentUser.name} (${currentUser.role})\n\n`;
    
    // Section 1: Division Performance
    csvContent += 'PHẦN 1: BẢNG SO SÁNH HIỆU SUẤT GIỮA CÁC PHÂN BAN\n';
    csvContent += 'Thứ tự,Phân ban (Division),Số thành viên,Hiệu suất trung bình (%),Đạt tiến độ công việc (%),Tổng số công việc\n';
    
    divisionEfficiencyData.forEach((item, index) => {
      const totalTasksCount = tasks.filter(t => t.division === item.name).length;
      csvContent += `${index + 1},"${item.name}",${item['Số thành viên']},${item['Hiệu suất trung bình (%)']}%,${item['Đạt tiến độ công việc (%)']}%,${totalTasksCount}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bao_cao_tong_hop_marketing_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Live ticking real-time clock instead of simulated time
  const [liveTime, setLiveTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const CURRENT_DATE = liveTime;

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'InProgress').length;
    const todo = tasks.filter(t => t.status === 'Todo').length;
    
    // Quá hạn: Trạng thái khác Completed và hạn chót trước 2026-05-20
    const overdue = tasks.filter(t => {
      const deadlineDate = new Date(t.deadline);
      return t.status !== 'Completed' && deadlineDate < CURRENT_DATE;
    }).length;

    // Chi phí và VAT
    const totalPreTax = invoices.reduce((sum, inv) => sum + inv.preTaxAmount, 0);
    const totalVAT = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.preTaxAmount), 0);
    const totalBudget = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      totalPreTax,
      totalVAT,
      totalBudget
    };
  }, [tasks, invoices, CURRENT_DATE]);

  // Priority Stats
  const priorityData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach(t => {
      counts[t.priority]++;
    });
    return [
      { name: 'Ưu tiên Cao', value: counts.High, color: '#EF4444' },
      { name: 'Ưu tiên Trung bình', value: counts.Medium, color: '#F59E0B' },
      { name: 'Ưu tiên Thấp', value: counts.Low, color: '#10B981' },
    ];
  }, [tasks]);

  // Tasks by Internal Division / Phân ban
  const divisionData = useMemo(() => {
    const divisions: Record<string, { total: number; completed: number; inProgress: number; todo: number }> = {};
    
    // Seed with standard or created divisions
    divisionsList.forEach(div => {
      divisions[div] = { total: 0, completed: 0, inProgress: 0, todo: 0 };
    });

    tasks.forEach(t => {
      if (!divisions[t.division]) {
        divisions[t.division] = { total: 0, completed: 0, inProgress: 0, todo: 0 };
      }
      divisions[t.division].total++;
      if (t.status === 'Completed') divisions[t.division].completed++;
      else if (t.status === 'InProgress') divisions[t.division].inProgress++;
      else divisions[t.division].todo++;
    });

    return Object.entries(divisions).map(([name, data]) => ({
      name,
      'Đã hoàn thành': data.completed,
      'Đang thực hiện': data.inProgress,
      'Chưa bắt đầu': data.todo,
      'Tổng số': data.total
    }));
  }, [tasks, divisionsList]);

  // Tasks by Stage / Giai đoạn chiến dịch
  const stageData = useMemo(() => {
    const stageMap: Record<string, string> = {
      'Planning': 'Lập kế hoạch',
      'Production': 'Sản xuất',
      'Execution': 'Triển khai',
      'Optimization': 'Tối ưu hóa'
    };
    
    const counts: Record<string, number> = {
      'Planning': 0,
      'Production': 0,
      'Execution': 0,
      'Optimization': 0
    };

    tasks.forEach(t => {
      counts[t.stage]++;
    });

    return Object.entries(counts).map(([key, value]) => ({
      name: stageMap[key] || key,
      'Số công việc': value
    }));
  }, [tasks]);

  // Employees total tasks and contributions
  const employeeStats = useMemo(() => {
    return members.map(m => {
      const assignedTasks = tasks.filter(t => t.assigneeId === m.id);
      const completedTasks = assignedTasks.filter(t => t.status === 'Completed');
      const inProgressTasks = assignedTasks.filter(t => t.status === 'InProgress');
      const overdueTasks = assignedTasks.filter(t => {
        const deadlineDate = new Date(t.deadline);
        return t.status !== 'Completed' && deadlineDate < CURRENT_DATE;
      });

      // Efficiency index (completed tasks ratio weight + timeline performance)
      // Base: efficiencyScore, Adjusted by task completions vs overdue
      const completedCount = completedTasks.length;
      const totalAssigned = assignedTasks.length;
      let calculatedEfficiency = m.efficiencyScore;
      
      if (totalAssigned > 0) {
        const onTimeRatio = (completedCount / totalAssigned) * 100;
        const penaltyOverdue = overdueTasks.length * 15;
        calculatedEfficiency = Math.max(0, Math.min(100, Math.round((onTimeRatio * 0.7) + (m.efficiencyScore * 0.3) - penaltyOverdue)));
      }

      return {
        ...m,
        assignedCount: totalAssigned,
        completedCount,
        inProgressCount: inProgressTasks.length,
        overdueCount: overdueTasks.length,
        contributionPercent: totalAssigned > 0 ? Math.round((completedCount / (tasks.filter(t => t.status === 'Completed').length || 1)) * 100) : 0,
        realEfficiency: calculatedEfficiency
      };
    }).sort((a, b) => b.realEfficiency - a.realEfficiency);
  }, [tasks, members, CURRENT_DATE]);

  // Budget expense breakdown
  const budgetCategoryData = useMemo(() => {
    const categories: Record<string, number> = {
      'Ads Budget': 0,
      'Production Fee': 0,
      'PR Service': 0,
      'Software Licensing': 0,
      'Other': 0
    };

    const catNameMap: Record<string, string> = {
      'Ads Budget': 'Ngân sách Quảng cáo',
      'Production Fee': 'Sản xuất Ấn phẩm',
      'PR Service': 'Dịch vụ Truyền thông/PR',
      'Software Licensing': 'Bản quyền Phần mềm',
      'Other': 'Chi phí Khác'
    };

    invoices.forEach(inv => {
      categories[inv.category] += inv.totalAmount;
    });

    return Object.entries(categories).map(([key, value]) => ({
      name: catNameMap[key] || key,
      'Chi phí (VNĐ)': value,
    })).filter(item => item['Chi phí (VNĐ)'] > 0);
  }, [invoices]);

  // Division Efficiency comparison
  const divisionEfficiencyData = useMemo(() => {
    return divisionsList.map(div => {
      const divisionMembers = employeeStats.filter(m => m.division === div);
      let avgEfficiency = 0;
      if (divisionMembers.length > 0) {
        const sum = divisionMembers.reduce((acc, m) => acc + m.realEfficiency, 0);
        avgEfficiency = Math.round(sum / divisionMembers.length);
      }
      
      const completedTasks = tasks.filter(t => t.division === div && t.status === 'Completed').length;
      const totalTasks = tasks.filter(t => t.division === div).length;
      
      return {
        name: div,
        'Hiệu suất trung bình (%)': avgEfficiency,
        'Số thành viên': divisionMembers.length,
        'Đạt tiến độ công việc (%)': totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };
    }).sort((a, b) => b['Hiệu suất trung bình (%)'] - a['Hiệu suất trung bình (%)']);
  }, [employeeStats, divisionsList, tasks]);

  return (
    <div className="space-y-8" id="dashboard_view">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between border border-indigo-950/40">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-emerald-500/5 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Bảng điều khiển hoạt động Marketing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Hệ Thống Quản Trị Marketing</h1>
          <p className="text-slate-300 max-w-xl text-sm leading-relaxed">
            Kiểm soát tập trung {stats.total} dự án quảng bá, bài viết thương hiệu, tiến độ vận hành hoạt động và nhân sự hiệu quả.
          </p>
        </div>

        <div className="relative z-10 mt-6 md:mt-0 flex gap-4 text-xs font-mono self-start md:self-auto bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-slate-300">
          <div className="text-left">
            <span className="text-indigo-400 block text-[10px] uppercase font-bold tracking-wider">Thời gian hệ thống</span>
            <span className="text-emerald-400 font-bold text-xs sm:text-sm whitespace-nowrap">
              {CURRENT_DATE.toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="w-px bg-white/10 my-0.5"></div>
          <div>
            <span className="text-indigo-400 block text-[10px] uppercase font-bold tracking-wider">Hiệu suất chung</span>
            <span className="text-white text-sm font-bold">
              {Math.round(employeeStats.reduce((sum, item) => sum + item.realEfficiency, 0) / members.length)}%
            </span>
          </div>
        </div>
      </div>

      {/* 1. Core Counters Row - KPI Metric Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng việc</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-4">{stats.total}</p>
          <span className="text-xs text-slate-500 block mt-1">Đang phân bổ vận hành</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">Hoàn thành</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-4">{stats.completed}</p>
          <span className="text-xs text-emerald-600 font-medium block mt-1">
             đạt {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% tổng việc
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">Đang làm</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-4">{stats.inProgress}</p>
          <span className="text-xs text-slate-500 block mt-1">
            {stats.todo} việc khác chưa chạy
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider">Quá hạn ⚠️</span>
          </div>
          <p className="text-2xl font-extrabold text-red-600 mt-4">{stats.overdue}</p>
          <span className="text-xs text-red-600 font-semibold block mt-1">Cần triển khai gấp</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3 & 4. Progress by Department and priority distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Công việc theo Phòng Ban
              </h2>
              <span className="text-xs text-slate-500">Bộ phận nội bộ</span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Phân phối công việc trực quan theo các nhóm chuyên trách Marketing: Content, Design, Digital Ads và Event/PR.
            </p>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={divisionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Đang thực hiện" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Đã hoàn thành" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Chưa bắt đầu" stackId="a" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4 & 5. Timeline Priority Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                Mức Độ Ưu Tiên & Giai Đoạn
              </h2>
              <span className="text-xs text-slate-500">Tần suất và phân nhóm</span>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Mức độ quan trọng (Cao/Thấp) để phân bổ nguồn lực và ưu tiên đẩy mạnh hoàn thiện trước.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 items-center">
            <div className="h-44 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ zIndex: 50 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Tổng</span>
                <span className="block text-xl font-bold text-slate-800">{stats.total}</span>
              </div>
            </div>

            <div className="space-y-3">
              {priorityData.map((item, idx) => {
                const percent = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">{item.value} ({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 7. Tasks count by Campaign Stages / Giai đoạn chiến dịch */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Vận Hành theo Giai Đoạn
              </h2>
              <span className="text-xs text-slate-500">Tính chu kỳ chiến dịch</span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Mỗi công việc thuộc 1 trong 4 khối chính: Lập kế hoạch, Sản xuất content, Triển khai quảng cáo, Tối ưu hóa.
            </p>
          </div>

          <div className="space-y-4">
            {stageData.map((item, idx) => {
              const maxVal = Math.max(...stageData.map(v => v['Số công việc'])) || 1;
              const percentOfMax = (item['Số công việc'] / maxVal) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 font-semibold">{item.name}</span>
                    <span className="text-slate-900 font-bold">{item['Số công việc']} công việc</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentOfMax}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Division Efficiency Performance Comparison Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm" id="division_efficiency_comparison_card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Hiệu Suất Thực Nghiệm Giữa Các Phân Ban
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hiệu suất làm việc trung bình (%) dựa trên tiến độ thực tế, thời hạn bàn giao và chỉ số năng lực của các nhân sự.
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-bold text-indigo-650 bg-indigo-50/80 px-3 py-1.5 rounded-xl border border-indigo-100/50">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
            Phòng ban dẫn đầu: <strong className="font-black uppercase text-indigo-700">{divisionEfficiencyData[0]?.name || 'N/A'}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart area */}
          <div className="lg:col-span-2 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={divisionEfficiencyData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="efficiencyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0.25}/>
                  </linearGradient>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0.25}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [`${value}%`]}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none', padding: '10px' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                  labelStyle={{ fontWeight: 800, fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                <Bar name="Hiệu suất trung bình (%)" dataKey="Hiệu suất trung bình (%)" fill="url(#efficiencyGrad)" radius={[4, 4, 0, 0]} barSize={28} />
                <Bar name="Đạt tiến độ công việc (%)" dataKey="Đạt tiến độ công việc (%)" fill="url(#progressGrad)" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick ranking table / cards */}
          <div className="flex flex-col justify-center space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Xếp hạng năng suất</h3>
            <div className="space-y-2">
              {divisionEfficiencyData.map((item, idx) => {
                let badgeBg = 'bg-slate-100 text-slate-700';
                if (idx === 0) badgeBg = 'bg-amber-100 text-amber-800 font-extrabold';
                else if (idx === 1) badgeBg = 'bg-slate-200 text-slate-800 font-bold';
                
                let scoreBg = 'text-indigo-600 bg-indigo-50';
                if (item['Hiệu suất trung bình (%)'] >= 85) {
                  scoreBg = 'text-emerald-700 bg-emerald-50';
                } else if (item['Hiệu suất trung bình (%)'] < 70) {
                  scoreBg = 'text-rose-700 bg-rose-50';
                }

                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-100/50 transition duration-150 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${badgeBg}`}>
                        #{idx + 1}
                      </span>
                      <div className="overflow-hidden">
                        <span className="text-xs font-black text-slate-800 block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {item['Số thành viên']} nhân sự • {tasks.filter(t => t.division === item.name).length} công việc
                        </span>
                      </div>
                    </div>
                    <div className={`p-1.5 px-2.5 rounded-lg shrink-0 text-center ${scoreBg}`}>
                      <span className="text-xs font-black block">
                        {item['Hiệu suất trung bình (%)']}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Member contributions & performance (Requirement 6, 8, 10) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm" id="member_performance_contribution_card">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Hiệu Suất & Đóng Góp Nhân Sự
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Số lượng đóng góp (Task đóng góp / Tổng số hoàn thành) và hiệu suất làm việc.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('members')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 hover:underline"
          >
            Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {employeeStats.map((emp, index) => {
            // Efficiency tier mapping
            let tierColor = 'bg-emerald-100 text-emerald-700';
            let tierText = 'Xuất sắc';
            if (emp.realEfficiency < 75) {
              tierColor = 'bg-rose-100 text-rose-700';
              tierText = 'Cần cải thiện';
            } else if (emp.realEfficiency < 88) {
              tierColor = 'bg-amber-100 text-amber-700';
              tierText = 'Khá tốt';
            }

            return (
              <div key={emp.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={emp.avatar} 
                    alt={emp.name} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {emp.name}
                      {index === 0 && <span className="text-[10px] px-1.5 py-0.2 bg-yellow-100 text-yellow-800 font-semibold rounded">Top 1 🔥</span>}
                    </h4>
                    <span className="text-[11px] text-slate-500">{emp.role} • {emp.division}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Đã làm / Được giao</span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {emp.completedCount} / {emp.assignedCount} việc
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Chỉ số đóng góp</span>
                    <span className="text-xs font-bold text-indigo-600">
                      {emp.contributionPercent}%
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Hiệu suất thực</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold mt-0.5 ${tierColor}`}>
                      {emp.realEfficiency}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 11. Report Export Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-6" id="dashboard_report_export_card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Xuất Báo Cáo Tổng Hợp
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Thống kê và tổng hợp dữ liệu hiệu suất và đóng góp của các phân bộ chuyên môn Marketing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition duration-150 rounded-xl cursor-pointer"
              id="btn_toggle_preview_report"
            >
              <Table className="w-3.5 h-3.5 text-slate-500" />
              {showPreview ? 'Ẩn xem trước' : 'Xem dạng bảng đơn giản'}
              {showPreview ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition duration-150 rounded-xl cursor-pointer"
              id="btn_download_csv_report"
            >
              <Download className="w-3.5 h-3.5" />
              Tải xuống file CSV (.csv)
            </button>
          </div>
        </div>

        {/* Live Simple Table Preview inside the dashboard card when showPreview is true */}
        {showPreview && (
          <div className="mt-6 space-y-6 pt-6 border-t border-slate-100 animate-fadeIn" id="report_table_preview_container">
            {/* Table 1: Division Performance */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-indigo-600 rounded-sm"></span>
                Bảng 1: Hiệu suất thực nghiệm giữa các phân ban (Division)
              </h3>
              <div className="overflow-x-auto border border-slate-150 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-150 text-slate-500 font-bold">
                      <th className="p-3 pl-4">Hạng</th>
                      <th className="p-3">Phân ban</th>
                      <th className="p-3 text-center">Số nhân sự</th>
                      <th className="p-3 text-center">Hiệu suất TB</th>
                      <th className="p-3 text-center">Đạt tiến độ</th>
                      <th className="p-3 text-center">Tổng công việc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {divisionEfficiencyData.map((item, idx) => {
                      const totalTasksCount = tasks.filter(t => t.division === item.name).length;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 pl-4 font-bold text-slate-400">#{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{item.name}</td>
                          <td className="p-3 text-center font-semibold">{item['Số thành viên']} người</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold text-[11px]">
                              {item['Hiệu suất trung bình (%)']}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[11px]">
                              {item['Đạt tiến độ công việc (%)']}%
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-semibold">{totalTasksCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
