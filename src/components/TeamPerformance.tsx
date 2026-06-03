import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Sparkles, 
  Award, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Target,
  Lock,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Table,
  PlusCircle,
  Edit2,
  Trash2,
  ListTodo,
  Plus,
  Check,
  CheckSquare,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { Member, Task, MarketingDivision, SystemRole, RolePermissions } from '../types';

function SecurePasswordText({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="inline-flex items-center gap-1.5 font-sans">
      <span className="font-mono font-bold select-all min-w-[34px]">
        {show ? value : '••••••'}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShow(!show);
        }}
        className="p-0.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
        title={show ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
      >
        {show ? (
          <EyeOff className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
      </button>
    </span>
  );
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', // Female 1
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', // Male 1
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', // Female 2
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', // Male 2
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', // Female 3
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'  // Male 3
];

interface TeamPerformanceProps {
  members: Member[];
  tasks: Task[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  currentUser: Member;
  permissions: RolePermissions;
  onUpdateMemberRole?: (memberId: string, systemRole: SystemRole) => void;
  divisions?: string[];
  onAddDivision?: (newDiv: string) => void;
  onDeleteDivision?: (division: string) => void;
  onClearAllDivisions?: () => void;
  onUpdateMember?: (id: string, updatedFields: Partial<Member>) => void;
  onDeleteMember?: (id: string) => void;
}

export default function TeamPerformance({ 
  members, 
  tasks, 
  onAddMember,
  currentUser,
  permissions: passedPermissions,
  onUpdateMemberRole,
  divisions: passedDivisions,
  onAddDivision,
  onDeleteDivision,
  onClearAllDivisions,
  onUpdateMember,
  onDeleteMember
}: TeamPerformanceProps) {
  const divisions = passedDivisions || ['Content', 'Design', 'Digital Ads', 'Event & PR'];
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
  const [filterDivision, setFilterDivision] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddDivisionOpen, setIsAddDivisionOpen] = useState(false);
  const [divisionInput, setDivisionInput] = useState('');

  // Daily checklist states
  const [activeChecklistMemberId, setActiveChecklistMemberId] = useState<string | null>(null);
  const [newDailyTaskText, setNewDailyTaskText] = useState('');
  const [dailyChecklists, setDailyChecklists] = useState<Record<string, { id: string; text: string; completed: boolean }[]>>(() => {
    const saved = localStorage.getItem('mkt_daily_checklists');
    if (saved) return JSON.parse(saved);

    // Initial dummy data for best user experience on first load
    const initialChecklists: Record<string, { id: string; text: string; completed: boolean }[]> = {
      m1: [
        { id: 'dc1_1', text: 'Duyệt kế hoạch ngân sách quảng cáo tuần tới', completed: true },
        { id: 'dc1_2', text: 'Họp giao ban định kỳ với các Ban trưởng', completed: false },
        { id: 'dc1_3', text: 'Duyệt báo cáo hiệu quả chiến dịch Facebook Ads', completed: false },
      ],
      m2: [
        { id: 'dc2_1', text: 'Hoàn thành 3 bài viết PR nhãn hàng mới', completed: true },
        { id: 'dc2_2', text: 'Lên outline content TikTok tuần 1 tháng 6', completed: true },
        { id: 'dc2_3', text: 'Họp brainstorm ý tưởng mini-game Fanpage', completed: false },
      ],
      m3: [
        { id: 'dc3_1', text: 'Thiết kế ấn phẩm banner chính cho website', completed: true },
        { id: 'dc3_2', text: 'Chỉnh sửa layout Key Visual theo feedback', completed: false },
        { id: 'dc3_3', text: 'Đóng gói tài nguyên thiết kế gửi dev', completed: false },
      ],
      m4: [
        { id: 'dc4_1', text: 'Kiểm tra tỷ lệ chuyển đổi Google Ads', completed: true },
        { id: 'dc4_2', text: 'Tối ưu bid chiến dịch quảng cáo TikTok', completed: false },
      ],
      m5: [
        { id: 'dc5_1', text: 'Liên hệ 5 bên KOLs review sản phẩm', completed: true },
        { id: 'dc5_2', text: 'Gửi thiệp mời họp báo ra mắt offline', completed: false },
      ],
      m6: [
        { id: 'dc6_1', text: 'Lên kịch bản chi tiết cho 2 video TikTok', completed: true },
        { id: 'dc6_2', text: 'Quay thô video review sản phẩm tại văn phòng', completed: false },
      ],
    };
    localStorage.setItem('mkt_daily_checklists', JSON.stringify(initialChecklists));
    return initialChecklists;
  });

  useEffect(() => {
    localStorage.setItem('mkt_daily_checklists', JSON.stringify(dailyChecklists));
  }, [dailyChecklists]);

  // Search, Sorting and View Mode states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'realEfficiency' | 'overdueCount' | 'contributionPercent' | 'name'>('realEfficiency');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [divisionToDelete, setDivisionToDelete] = useState<string | null>(null);
  const [isClearingAllDivisions, setIsClearingAllDivisions] = useState(false);

  // Form states
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('123');
  const [newMemberDivision, setNewMemberDivision] = useState<MarketingDivision>(divisions[0] || 'Content');
  const [newMemberEfficiency, setNewMemberEfficiency] = useState(85);
  const [newMemberSystemRole, setNewMemberSystemRole] = useState<SystemRole>('Member');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberBirthDate, setNewMemberBirthDate] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState(PRESET_AVATARS[0]);
  const [showNewMemberPassword, setShowNewMemberPassword] = useState(false);

  // Edit member states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberRole, setEditMemberRole] = useState('');
  const [editMemberEmail, setEditMemberEmail] = useState('');
  const [editMemberPassword, setEditMemberPassword] = useState('123');
  const [showEditMemberPassword, setShowEditMemberPassword] = useState(false);
  const [editMemberDivision, setEditMemberDivision] = useState<MarketingDivision>('Content');
  const [editMemberEfficiency, setEditMemberEfficiency] = useState(85);
  const [editMemberSystemRole, setEditMemberSystemRole] = useState<SystemRole>('Member');
  const [editMemberPhone, setEditMemberPhone] = useState('');
  const [editMemberBirthDate, setEditMemberBirthDate] = useState('');
  const [editMemberAvatar, setEditMemberAvatar] = useState('');

  const openEditModal = (member: Member) => {
    setEditingMemberId(member.id);
    setEditMemberName(member.name);
    setEditMemberRole(member.role);
    setEditMemberEmail(member.email);
    setEditMemberPassword(member.password || '123');
    setEditMemberDivision(member.division);
    setEditMemberEfficiency(member.efficiencyScore);
    setEditMemberSystemRole(member.systemRole);
    setEditMemberPhone(member.phone || '');
    setEditMemberBirthDate(member.birthDate || '');
    setEditMemberAvatar(member.avatar || '');
    setIsEditOpen(true);
  };

  const stats = useMemo(() => {
    return members.map(m => {
      const assigned = tasks.filter(t => t.assigneeId === m.id);
      const completed = assigned.filter(t => t.status === 'Completed').length;
      const inProgress = assigned.filter(t => t.status === 'InProgress').length;
      const todo = assigned.filter(t => t.status === 'Todo').length;
      
      const overdue = assigned.filter(t => {
        const deadlineDate = new Date(t.deadline);
        return t.status !== 'Completed' && deadlineDate < new Date();
      }).length;

      // Contribution to total completed tasks of the department
      const totalCompletedDept = tasks.filter(t => t.status === 'Completed').length;
      const contributionPercent = totalCompletedDept > 0 ? Math.round((completed / totalCompletedDept) * 100) : 0;

      // Realtime Calculated Efficiency Index
      // Balanced formula: (Completed Tasks count / Total Assigned Tasks) weighed, penalized by Overdues
      let calculatedEff = m.efficiencyScore;
      if (assigned.length > 0) {
        const complRatio = (completed / assigned.length) * 105; // slightly scaled
        const penalty = overdue * 15;
        calculatedEff = Math.max(0, Math.min(100, Math.round((complRatio * 0.7) + (m.efficiencyScore * 0.3) - penalty)));
      }

      return {
        ...m,
        assignedCount: assigned.length,
        completedCount: completed,
        inProgressCount: inProgress,
        todoCount: todo,
        overdueCount: overdue,
        contributionPercent,
        realEfficiency: calculatedEff
      };
    });
  }, [members, tasks]);

  const processedStats = useMemo(() => {
    let result = [...stats];

    // 1. Filter by division
    if (filterDivision !== 'All') {
      result = result.filter(s => s.division === filterDivision);
    }

    // 2. Filter by search keyword (name or role, case-insensitive)
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        s => s.name.toLowerCase().includes(query) || s.role.toLowerCase().includes(query)
      );
    }

    // 3. Sort by chosen column
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string' && typeof valB === 'string') {
        const comp = valA.localeCompare(valB, 'vi'); // Excellent Vietnamese sorting support
        return sortOrder === 'asc' ? comp : -comp;
      }

      // Numeric columns (realEfficiency, overdueCount, contributionPercent)
      const numA = (valA as number) || 0;
      const numB = (valB as number) || 0;
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return result;
  }, [stats, filterDivision, searchTerm, sortBy, sortOrder]);

  const handleSort = (field: 'realEfficiency' | 'overdueCount' | 'contributionPercent' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to descending order for metrics
    }
  };

  const renderSortIcon = (field: 'realEfficiency' | 'overdueCount' | 'contributionPercent' | 'name') => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600 shrink-0 font-extrabold" />
      : <ArrowDown className="w-3.5 h-3.5 text-indigo-600 shrink-0 font-extrabold" />;
  };

  const departmentAverages = useMemo(() => {
    return divisions.map(d => {
      const deptMembers = stats.filter(m => m.division === d);
      const avgEff = deptMembers.length > 0 
        ? Math.round(deptMembers.reduce((sum, item) => sum + item.realEfficiency, 0) / deptMembers.length)
        : 0;
      const completedTasks = tasks.filter(t => t.division === d && t.status === 'Completed').length;
      
      return {
        division: d,
        avgEfficiency: avgEff,
        completedTasks,
        memberCount: deptMembers.length
      };
    });
  }, [stats, tasks, divisions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberRole || !newMemberEmail) return;

    onAddMember({
      name: newMemberName,
      role: newMemberRole,
      email: newMemberEmail,
      password: newMemberPassword || '123',
      division: newMemberDivision,
      systemRole: newMemberSystemRole,
      avatar: newMemberAvatar || PRESET_AVATARS[0],
      efficiencyScore: Number(newMemberEfficiency),
      joinedDate: new Date().toISOString().split('T')[0],
      phone: newMemberPhone,
      birthDate: newMemberBirthDate
    });

    // Reset Form
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberEmail('');
    setNewMemberPassword('123');
    setNewMemberDivision(divisions[0] || 'Content');
    setNewMemberEfficiency(85);
    setNewMemberSystemRole('Member');
    setNewMemberPhone('');
    setNewMemberBirthDate('');
    setNewMemberAvatar(PRESET_AVATARS[0]);
    setIsAddOpen(false);
  };

  const handleAddNewDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!divisionInput || divisionInput.trim() === '') return;
    if (onAddDivision) {
      onAddDivision(divisionInput);
    }
    setDivisionInput('');
    setIsAddDivisionOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemberId || !editMemberName || !editMemberRole || !editMemberEmail) return;

    if (onUpdateMember) {
      onUpdateMember(editingMemberId, {
        name: editMemberName,
        role: editMemberRole,
        email: editMemberEmail,
        password: editMemberPassword || '123',
        division: editMemberDivision,
        systemRole: editMemberSystemRole,
        efficiencyScore: Number(editMemberEfficiency),
        phone: editMemberPhone,
        birthDate: editMemberBirthDate,
        avatar: editMemberAvatar
      });
    }

    // Reset Edit Form
    setEditingMemberId(null);
    setEditMemberName('');
    setEditMemberRole('');
    setEditMemberEmail('');
    setEditMemberPassword('123');
    setEditMemberDivision(divisions[0] || 'Content');
    setEditMemberEfficiency(85);
    setEditMemberSystemRole('Member');
    setEditMemberPhone('');
    setEditMemberBirthDate('');
    setEditMemberAvatar('');
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-8" id="team_performance_view">
      {/* Upper Grid metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {departmentAverages.map((dept, idx) => {
          let bgStyle = 'bg-white border-slate-100';
          let textColor = 'text-slate-800';
          let barColor = 'bg-indigo-600';
          
          if (dept.division === 'Digital Ads') {
            bgStyle = 'bg-indigo-50/50 border-indigo-100';
            textColor = 'text-indigo-950';
            barColor = 'bg-indigo-600';
          } else if (dept.division === 'Content') {
            bgStyle = 'bg-emerald-50/50 border-emerald-100';
            textColor = 'text-emerald-950';
            barColor = 'bg-emerald-600';
          }
          
          return (
            <div key={idx} className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${bgStyle}`}>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phân ban</span>
                <h3 className={`text-sm font-bold mt-1 ${textColor}`}>{dept.division}</h3>
                <span className="text-xs text-slate-500 mt-1 block">
                  {dept.memberCount} thành viên • {dept.completedTasks} hoàn thành
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-slate-500">Hiệu suất trung bình</span>
                  <span className="text-slate-950">{dept.avgEfficiency}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full`} style={{ width: `${dept.avgEfficiency}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Roster with Filters and Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2" id="member_list_heading">
              <Users className="w-5 h-5 text-indigo-600" />
              Danh Sách Thành Viên
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi tiến độ hoàn thành và hiệu suất thực lĩnh theo KPIs thực tế của từng thành viên.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Division Filter Pills */}
            <div className="flex border border-slate-200 rounded-xl overflow-hidden p-1 bg-slate-50 text-xs flex-wrap max-w-full">
              {['All', ...divisions].map((div) => (
                <button
                  key={div}
                  onClick={() => setFilterDivision(div)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    filterDivision === div 
                      ? 'bg-white text-indigo-600 shadow-xs ring-1 ring-slate-105 font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {div === 'All' ? 'Tất cả' : div}
                </button>
              ))}
            </div>

            {permissions.team_add_member ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddDivisionOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 hover:text-indigo-850 text-xs font-semibold ring-1 ring-slate-200 shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4 text-indigo-500" />
                  Tạo phân ban mới
                </button>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Thêm nhân viên
                </button>
              </div>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed opacity-75 transition"
                title="Yêu cầu quyền admin ban để bổ sung nhân sự"
              >
                <Lock className="w-3.5 h-3.5" />
                Thêm nhân viên
              </button>
            )}
          </div>
        </div>

        {/* Secondary Utility Controls Row (Search, Sorting & View Toggles) */}
        <div className="px-6 pb-5 pt-1 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Quick Search Input */}
          <div className="relative flex-1 max-w-md w-full" id="team_performance_search_container">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="team_performance_search_input"
              placeholder="Tìm kiếm thành viên bằng tên hoặc chức vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-slate-950 transition duration-150 shadow-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Control Dropdown (convenient for grid mode and smaller devices) */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Sắp xếp:</span>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent pl-2 pr-7 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_8px_center] bg-no-repeat"
                >
                  <option value="realEfficiency">Hiệu suất thực</option>
                  <option value="overdueCount">Việc quá hạn</option>
                  <option value="contributionPercent">Tỷ lệ đóng góp</option>
                  <option value="name">Họ & Tên</option>
                </select>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition shrink-0"
                  title={sortOrder === 'asc' ? 'Sắp xếp tăng dần' : 'Sắp xếp giảm dần'}
                >
                  {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* View switcher dropdown tool */}
            <div className="flex border border-slate-200 rounded-xl overflow-hidden p-1 bg-white shadow-xs text-xs shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${
                  viewMode === 'table'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Xem dạng Bảng đóng góp"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dạng Bảng</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${
                  viewMode === 'grid'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Xem dạng Khung thẻ grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dạng Thẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Members Roster View Body */}
        <div className="p-0">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="team_performance_table">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    {/* Column 1: Họ tên */}
                    <th 
                      onClick={() => handleSort('name')}
                      className="p-4 pl-6 cursor-pointer hover:bg-slate-100 hover:text-indigo-600 transition select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Thành viên</span>
                        {renderSortIcon('name')}
                      </div>
                    </th>
                    
                    {/* Column 2: Phân ban */}
                    <th className="p-4 select-none">
                      <span>Phân ban & Vai trò</span>
                    </th>

                    {/* Column 3: Email */}
                    <th className="p-4 hidden md:table-cell select-none">
                      <span>Liên hệ (Email)</span>
                    </th>

                    {/* Column 4: Đóng góp phòng */}
                    <th 
                      onClick={() => handleSort('contributionPercent')}
                      className="p-4 cursor-pointer hover:bg-slate-100 hover:text-indigo-600 transition text-center select-none group"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Đóng góp phòng</span>
                        {renderSortIcon('contributionPercent')}
                      </div>
                    </th>

                    {/* Column 5: Việc quá hạn */}
                    <th 
                      onClick={() => handleSort('overdueCount')}
                      className="p-4 cursor-pointer hover:bg-slate-100 hover:text-indigo-600 transition text-center select-none group"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Công Việc Quá Hạn</span>
                        {renderSortIcon('overdueCount')}
                      </div>
                    </th>

                    {/* Column: Checklist hàng ngày */}
                    <th className="p-4 text-center select-none">
                      <span>Việc hàng ngày</span>
                    </th>

                    {/* Column 6: Hiệu suất thực */}
                    <th 
                      onClick={() => handleSort('realEfficiency')}
                      className="p-4 pr-6 cursor-pointer hover:bg-slate-100 hover:text-indigo-600 transition select-none group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Hiệu suất thực</span>
                        {renderSortIcon('realEfficiency')}
                      </div>
                    </th>

                    {permissions.team_add_member && (
                      <th className="p-4 pr-6 text-center select-none w-20">
                        <span>Thao tác</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 col-span-1">
                  {processedStats.length === 0 ? (
                    <tr>
                      <td colSpan={permissions.team_add_member ? 8 : 7} className="text-center p-16 text-slate-400 italic">
                        Không tìm thấy thành viên nào phù hợp với bộ lọc tìm kiếm
                      </td>
                    </tr>
                  ) : (
                    processedStats.map((emp) => {
                      let ratingClass = 'bg-emerald-100 text-emerald-800';
                      let ratingText = 'Vận hành Xuất sắc';
                      if (emp.realEfficiency < 75) {
                        ratingClass = 'bg-rose-100 text-rose-800';
                        ratingText = 'Cần được hỗ trợ';
                      } else if (emp.realEfficiency < 88) {
                        ratingClass = 'bg-blue-100 text-blue-800';
                        ratingText = 'Đạt chỉ tiêu';
                      }

                      const isSecuredAdmin = emp.systemRole === 'Admin' && currentUser.systemRole !== 'Admin';

                      return (
                        <tr 
                          key={emp.id} 
                          className="hover:bg-indigo-50/10 transition duration-150 group"
                        >
                          {/* 1. Thành viên */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <img 
                                src={emp.avatar} 
                                alt={emp.name} 
                                className="w-9 h-9 rounded-xl object-cover border border-slate-150 shadow-xs shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 tracking-tight leading-snug">{emp.name}</h4>
                                <span className="text-[10px] text-slate-400 font-medium">Tham gia: {emp.joinedDate}</span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Phân ban & Vai trò */}
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-indigo-55 text-indigo-650 text-indigo-600 bg-indigo-50">
                                  {emp.division}
                                </span>
                                <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1 py-0.2 rounded ${
                                  emp.systemRole === 'Admin' 
                                    ? 'bg-indigo-950 text-white' 
                                    : emp.systemRole === 'Manager' 
                                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                      : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {emp.systemRole}
                                </span>
                              </div>
                              <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{emp.role}</span>
                              </div>
                            </div>
                          </td>

                          {/* 3. Email */}
                          <td className="p-4 hidden md:table-cell text-slate-500 font-mono truncate max-w-[180px]">
                            <div className="space-y-1 text-left">
                              <span className="block font-medium text-slate-805">
                                {isSecuredAdmin ? '••••••••@••••••••' : emp.email}
                              </span>
                              <div className="text-[10px] text-slate-400 font-sans space-y-0.5 mt-1 font-medium">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1 rounded font-bold font-sans pb-0.5">Mật khẩu:</span> 
                                  {isSecuredAdmin ? (
                                    <span className="font-mono font-bold select-all text-indigo-950 bg-indigo-50/20 px-1 rounded border border-indigo-100/30">••••••••</span>
                                  ) : (
                                    <SecurePasswordText value={emp.password || '123'} />
                                  )}
                                </div>
                                {emp.phone && (
                                  <div className="flex items-center gap-1 font-mono pt-0.5">
                                    SĐT: {isSecuredAdmin ? '••••••••' : emp.phone}
                                  </div>
                                )}
                                {emp.birthDate && (
                                  <div className="flex items-center gap-1 font-mono">
                                    NS: {isSecuredAdmin ? '••••••••' : emp.birthDate.split('-').reverse().join('/')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 4. Đóng góp phòng */}
                          <td className="p-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-xs font-black text-slate-900 font-mono bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg shadow-2xs">
                                {emp.contributionPercent}%
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold mt-0.5">{emp.completedCount} đã xong</span>
                            </div>
                          </td>

                          {/* 5. Việc quá hạn */}
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded-xl border ${
                              emp.overdueCount > 0 
                                ? 'bg-rose-50 text-rose-600 border-rose-105 animate-pulse' 
                                : 'bg-emerald-50 text-emerald-600 border-emerald-105'
                            }`}>
                              {emp.overdueCount > 0 && <AlertCircle className="w-3.5 h-3.5" />}
                              {emp.overdueCount} việc
                            </span>
                          </td>

                          {/* Checklist hàng ngày */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setActiveChecklistMemberId(emp.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold transition text-[11px] border border-indigo-100 shadow-3xs cursor-pointer group/chk"
                              id={`checklist_btn_${emp.id}`}
                            >
                              <ListTodo className="w-3.5 h-3.5 text-indigo-600 group-hover/chk:scale-110 transition" />
                              <span>Checklist ({dailyChecklists[emp.id]?.length || 0})</span>
                            </button>
                          </td>

                          {/* 6. Hiệu suất thực */}
                          <td className="p-4 pr-6">
                            <div className="flex flex-col items-end space-y-1 bg-white p-2 border border-slate-100 rounded-xl max-w-[165px] ml-auto">
                              <div className="flex items-center justify-between w-full gap-2">
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase tracking-wider shrink-0 ${ratingClass}`}>
                                  {ratingText}
                                </span>
                                <span className="text-xs font-black text-slate-900 font-mono text-right">{emp.realEfficiency}%</span>
                              </div>
                              
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    emp.realEfficiency < 75 ? 'bg-rose-500' : emp.realEfficiency < 88 ? 'bg-blue-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${emp.realEfficiency}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {permissions.team_add_member && (
                            <td className="p-4 pr-6 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  disabled={isSecuredAdmin}
                                  onClick={() => openEditModal(emp)}
                                  className={`p-2 rounded-xl transition ${
                                    isSecuredAdmin
                                      ? 'text-slate-300 cursor-not-allowed opacity-50'
                                      : 'text-indigo-600 hover:text-indigo-850 hover:bg-slate-100 cursor-pointer'
                                  }`}
                                  title={isSecuredAdmin ? 'Chỉ Admin mới có quyền sửa thông tin Admin' : 'Sửa thông tin'}
                                  id={`edit_member_btn_${emp.id}`}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  disabled={emp.id === 'm1' || emp.id === currentUser.id || isSecuredAdmin}
                                  onClick={() => setDeleteConfirmId(emp.id)}
                                  className={`p-2 rounded-xl transition ${
                                    emp.id === 'm1' || emp.id === currentUser.id || isSecuredAdmin
                                      ? 'text-slate-300 cursor-not-allowed opacity-50'
                                      : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50 cursor-pointer'
                                  }`}
                                  title={
                                    emp.id === 'm1' 
                                      ? 'Không thể xóa Admin hệ thống' 
                                      : emp.id === currentUser.id 
                                        ? 'Không thể tự xóa chính mình' 
                                        : isSecuredAdmin 
                                          ? 'Chỉ Admin mới có quyền xóa Admin' 
                                          : 'Xóa thành viên'
                                  }
                                  id={`delete_member_btn_${emp.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedStats.length === 0 ? (
                  <div className="col-span-full text-center p-16 text-slate-400 italic">
                    Không tìm thấy thành viên nào phù hợp với bộ lọc tìm kiếm
                  </div>
                ) : (
                  processedStats.map((emp) => {
                    // Efficiency tier mapping
                    let ratingClass = 'bg-emerald-100 text-emerald-800';
                    let ratingText = 'Vận hành Xuất sắc';
                    if (emp.realEfficiency < 75) {
                      ratingClass = 'bg-rose-100 text-rose-800';
                      ratingText = 'Cần được hỗ trợ';
                    } else if (emp.realEfficiency < 88) {
                      ratingClass = 'bg-blue-100 text-blue-800';
                      ratingText = 'Đạt chỉ tiêu kế hoạch';
                    }

                    const isSecuredAdmin = emp.systemRole === 'Admin' && currentUser.systemRole !== 'Admin';

                    return (
                      <div 
                        key={emp.id} 
                        className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 hover:border-indigo-150 hover:shadow-md transition duration-200 flex flex-col justify-between group"
                      >
                  <div className="space-y-4">
                    {/* Upper profile section */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <img 
                          src={emp.avatar} 
                          alt={emp.name} 
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-55 px-2 py-0.5 text-indigo-600 bg-indigo-50">
                              {emp.division}
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                              emp.systemRole === 'Admin' 
                                ? 'bg-indigo-950 text-white' 
                                : emp.systemRole === 'Manager' 
                                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-205'
                                  : 'bg-slate-100 text-slate-650'
                            }`}>
                              {emp.systemRole}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{emp.name}</h3>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {emp.role}
                          </p>
                        </div>
                      </div>

                      {permissions.team_add_member && (
                        <div className="flex gap-1 self-start">
                          <button
                            disabled={isSecuredAdmin}
                            onClick={() => openEditModal(emp)}
                            className={`p-1.5 rounded-lg border shadow-xs transition ${
                              isSecuredAdmin
                                ? 'text-slate-200 cursor-not-allowed opacity-40 border-transparent bg-transparent shadow-none'
                                : 'text-slate-400 hover:text-indigo-600 hover:bg-white border-transparent hover:border-slate-100 cursor-pointer'
                            }`}
                            title={isSecuredAdmin ? 'Chỉ Admin mới có quyền sửa thông tin Admin' : 'Sửa thông tin'}
                            id={`grid_edit_member_btn_${emp.id}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={emp.id === 'm1' || emp.id === currentUser.id || isSecuredAdmin}
                            onClick={() => setDeleteConfirmId(emp.id)}
                            className={`p-1.5 rounded-lg border shadow-xs transition ${
                              emp.id === 'm1' || emp.id === currentUser.id || isSecuredAdmin
                                ? 'text-slate-200 cursor-not-allowed opacity-40 border-transparent shadow-none'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-white hover:border-rose-100 cursor-pointer'
                            }`}
                            title={
                              emp.id === 'm1' 
                                ? 'Không thể xóa Admin hệ thống' 
                                : emp.id === currentUser.id 
                                  ? 'Không thể tự xóa chính mình' 
                                  : isSecuredAdmin 
                                    ? 'Chỉ Admin mới có quyền xóa Admin' 
                                    : 'Xóa thành viên'
                            }
                            id={`grid_delete_member_btn_${emp.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
                       <div className="flex gap-1.5 items-center bg-white px-2 py-1.5 rounded-xl border border-slate-100 overflow-hidden" title={isSecuredAdmin ? '••••••••@••••••••' : emp.email}>
                         <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                         <span className="truncate text-[10.5px] font-mono">
                           {isSecuredAdmin ? '••••••••@••••••••' : emp.email}
                         </span>
                       </div>
                       <div className="flex gap-1.5 items-center bg-indigo-50/50 px-2 py-1.5 rounded-xl border border-indigo-100/30 text-indigo-950 font-semibold justify-between">
                         <div className="flex gap-1.5 items-center">
                           <Key className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                           <span className="text-[10.5px]">Pass:</span>
                         </div>
                         {isSecuredAdmin ? (
                           <span className="font-mono text-[10.5px] font-bold select-all text-indigo-950 px-1">••••••••</span>
                         ) : (
                           <SecurePasswordText value={emp.password || '123'} />
                         )}
                       </div>
                     </div>

                    {(emp.phone || emp.birthDate) && (
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-100/80">
                        {emp.phone && (
                          <div className="truncate">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">Số ĐT</span>
                            <span className="font-mono font-semibold">
                              {isSecuredAdmin ? '••••••••' : emp.phone}
                            </span>
                          </div>
                        )}
                        {emp.birthDate && (
                          <div className="truncate">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">Ngày sinh</span>
                            <span className="font-mono font-semibold">
                              {isSecuredAdmin ? '••••••••' : emp.birthDate.split('-').reverse().join('/')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Numeric workload indicators */}
                    <div className="grid grid-cols-3 gap-2 py-2 text-center bg-white rounded-xl border border-slate-100">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Hoàn thành</span>
                        <div className="flex items-center justify-center gap-1 text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold font-mono">{emp.completedCount}</span>
                        </div>
                      </div>
                      <div className="space-y-0.5 border-x border-slate-100">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Đang chạy</span>
                        <div className="flex items-center justify-center gap-1 text-blue-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold font-mono">{emp.inProgressCount + emp.todoCount}</span>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Quá Hạn ⚠️</span>
                        <div className="flex items-center justify-center gap-1 text-red-600">
                          <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                          <span className="text-xs font-bold font-mono">{emp.overdueCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Daily Checklist Button */}
                    <button
                      onClick={() => setActiveChecklistMemberId(emp.id)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 mt-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold transition text-xs border border-indigo-100/80 shadow-3xs cursor-pointer group/chk bg-indigo-50/50"
                      id={`grid_checklist_btn_${emp.id}`}
                    >
                      <ListTodo className="w-3.5 h-3.5 text-indigo-600 group-hover/chk:scale-110 transition" />
                      <span>Việc Hàng Ngày ({dailyChecklists[emp.id]?.length || 0})</span>
                    </button>
                  </div>

                  {/* Rating / Efficiency bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${ratingClass}`}>
                        {ratingText}
                      </span>
                      <span className="text-xs font-bold text-slate-800">Hiệu suất: {emp.realEfficiency}%</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="w-full bg-slate-150 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            emp.realEfficiency < 75 ? 'bg-rose-500' : emp.realEfficiency < 88 ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${emp.realEfficiency}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Đóng góp phòng: {emp.contributionPercent}%</span>
                        <span>Tham gia: {emp.joinedDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    )}
  </div>
</div>

      {/* Modal Add Member */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Bổ nhiệm Thành viên mới</h3>
                <p className="text-xs text-slate-500">Thêm nhân viên mới vào phòng ban Marketing</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              {/* Ảnh đại diện (Avatar Selector) */}
              <div className="space-y-2 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
                <label className="text-slate-700 font-bold block">Ảnh Đại Diện</label>
                <div className="flex items-center gap-4">
                  <img 
                    src={newMemberAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                    alt="Chọn ảnh đại diện" 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-2">
                    <span className="text-[10px] text-slate-500 font-semibold block">Chọn từ thư viện sẵn có:</span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_AVATARS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewMemberAvatar(p)}
                          className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition duration-200 cursor-pointer hover:scale-105 shrink-0 select-none ${
                            newMemberAvatar === p ? 'border-indigo-600 ring-2 ring-indigo-100 scale-105' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={p} alt={`Thư viện ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 mt-2">
                  <span className="text-[10px] text-slate-500 font-semibold block">Hoặc dán URL ảnh tùy chỉnh:</span>
                  <input 
                    type="url" 
                    placeholder="https://example.com/avatar.jpg"
                    value={newMemberAvatar} 
                    onChange={(e) => setNewMemberAvatar(e.target.value)}
                    className="w-full text-[10px] p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 font-bold bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Họ và Tên</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Hoàng Anh Tuấn"
                  value={newMemberName} 
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Phân Ban</label>
                  <select 
                    value={newMemberDivision} 
                    onChange={(e) => setNewMemberDivision(e.target.value as MarketingDivision)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950"
                  >
                    {divisions.map((div) => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Vị Trí / Chức Danh</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: SEO Specialist"
                    value={newMemberRole} 
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="tuan.hoang@marketing.co"
                    value={newMemberEmail} 
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Mật khẩu Đăng nhập</label>
                  <div className="relative">
                    <input 
                      type={showNewMemberPassword ? "text" : "password"} 
                      required
                      placeholder="Mật khẩu tài khoản (Mặc định: 123)"
                      value={newMemberPassword} 
                      onChange={(e) => setNewMemberPassword(e.target.value)}
                      className="w-full text-xs p-3 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewMemberPassword(!showNewMemberPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                      title={showNewMemberPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showNewMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Số Điện Thoại</label>
                  <input 
                    type="tel"
                    placeholder="Quy chuẩn: 09xx xxx xxx"
                    value={newMemberPhone} 
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Ngày Sinh</label>
                  <input 
                    type="date"
                    value={newMemberBirthDate} 
                    onChange={(e) => setNewMemberBirthDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-slate-700 font-semibold">
                  <label>Chỉ Số Năng Lực Cơ Bản (KPI target)</label>
                  <span className="font-bold text-indigo-600">{newMemberEfficiency}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  value={newMemberEfficiency} 
                  onChange={(e) => setNewMemberEfficiency(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Khá (50%)</span>
                  <span>Xuất sắc (100%)</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Phân quyền hệ thống</label>
                <select 
                  value={newMemberSystemRole} 
                  onChange={(e) => setNewMemberSystemRole(e.target.value as SystemRole)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950"
                >
                  <option value="Member">Nhân viên thông thường (Member)</option>
                  <option value="Manager">Quản lý duyệt chi (Manager)</option>
                  <option value="Admin">Quản trị viên tối cao (Admin)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition duration-150 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white font-bold bg-indigo-600 hover:bg-indigo-700 transition duration-150 rounded-xl"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Division */}
      {isAddDivisionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-sm p-6 relative" id="add_division_modal">
            <button 
              onClick={() => setIsAddDivisionOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition inline-block cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Quản Lý Phân Ban</h3>
                <p className="text-xs text-slate-500">Tạo mới hoặc xóa bỏ các phân ban chuyên môn</p>
              </div>
            </div>

            <form onSubmit={handleAddNewDivision} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Tên Phân Ban Mới</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: R&D, TikTok Growth..."
                    value={divisionInput} 
                    onChange={(e) => setDivisionInput(e.target.value)}
                    className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 font-bold"
                  />
                  <button
                    type="submit"
                    className="px-4.5 py-3 text-white font-bold bg-indigo-600 hover:bg-indigo-700 transition duration-150 rounded-xl cursor-pointer shrink-0"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Danh sách hiện tại ({divisions.length})</label>
                {divisions.length > 0 && onClearAllDivisions && (
                  <div>
                    {isClearingAllDivisions ? (
                      <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                        <span className="text-[9px] font-bold text-rose-500 uppercase">Chắc chắn xóa?</span>
                        <button
                          type="button"
                          onClick={() => setIsClearingAllDivisions(false)}
                          className="px-1.5 py-0.5 text-[9px] text-slate-500 hover:text-slate-700 bg-slate-100 rounded font-bold cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClearAllDivisions();
                            setIsClearingAllDivisions(false);
                          }}
                          className="px-2 py-0.5 text-[9px] text-white bg-rose-600 hover:bg-rose-700 rounded font-bold cursor-pointer shadow-xs"
                        >
                          Xóa hết
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsClearingAllDivisions(true)}
                        className="text-[10px] font-bold text-red-600 hover:text-red-800 transition uppercase tracking-wider cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                )}
              </div>

              {divisions.length === 0 ? (
                <div className="p-4 bg-slate-50 text-slate-400 text-center rounded-xl border border-dashed text-xs font-semibold">
                  Chưa có phân ban nào được thiết lập. Hãy tạo phân ban để phân phối việc hiệu quả hơn!
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1" id="active_divisions_mgmt_list">
                  {divisions.map((div) => (
                    <div 
                      key={div} 
                      className="flex items-center justify-between p-2.5 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition"
                    >
                      <span className="text-xs font-bold text-slate-800">{div}</span>
                      {onDeleteDivision && (
                        <div className="flex items-center gap-1">
                          {divisionToDelete === div ? (
                            <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                              <button
                                type="button"
                                onClick={() => setDivisionToDelete(null)}
                                className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-700 bg-slate-150 bg-slate-200 font-extrabold rounded-md cursor-pointer whitespace-nowrap"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteDivision(div);
                                  setDivisionToDelete(null);
                                }}
                                className="px-2 py-0.5 text-[10px] text-white bg-rose-600 hover:bg-rose-700 font-extrabold rounded-md cursor-pointer whitespace-nowrap shadow-xs"
                              >
                                Xác nhận
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDivisionToDelete(div)}
                              className="p-1 px-1.5 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              title="Xóa phân ban"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddDivisionOpen(false)}
                className="w-full py-2.5 text-center text-xs text-slate-600 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 transition duration-150 rounded-xl border border-slate-200 cursor-pointer"
              >
                Đóng Quản Lý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Member */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Chỉnh sửa thông tin</h3>
                <p className="text-xs text-slate-500 font-medium">Cập nhật thông tin chi tiết của nhân sự</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-medium">
              {/* Ảnh đại diện (Avatar Selector) */}
              <div className="space-y-2 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
                <label className="text-slate-700 font-bold block">Ảnh Đại Diện</label>
                <div className="flex items-center gap-4">
                  <img 
                    src={editMemberAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                    alt="Chọn ảnh đại diện" 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-2">
                    <span className="text-[10px] text-slate-500 font-semibold block">Chọn từ thư viện sẵn có:</span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_AVATARS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditMemberAvatar(p)}
                          className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition duration-200 cursor-pointer hover:scale-105 shrink-0 select-none ${
                            editMemberAvatar === p ? 'border-indigo-600 ring-2 ring-indigo-100 scale-105' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={p} alt={`Thư viện ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 mt-2">
                  <span className="text-[10px] text-slate-500 font-semibold block">Hoặc dán URL ảnh tùy chỉnh:</span>
                  <input 
                    type="url" 
                    placeholder="https://example.com/avatar.jpg"
                    value={editMemberAvatar} 
                    onChange={(e) => setEditMemberAvatar(e.target.value)}
                    className="w-full text-[10px] p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 font-bold bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Họ và Tên</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Hoàng Anh Tuấn"
                  value={editMemberName} 
                  onChange={(e) => setEditMemberName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Phân Ban</label>
                  <select 
                    value={editMemberDivision} 
                    onChange={(e) => setEditMemberDivision(e.target.value as MarketingDivision)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950"
                  >
                    {divisions.map((div) => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Vị Trí / Chức Danh</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: SEO Specialist"
                    value={editMemberRole} 
                    onChange={(e) => setEditMemberRole(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="tuan.hoang@marketing.co"
                    value={editMemberEmail} 
                    onChange={(e) => setEditMemberEmail(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Mật khẩu Đăng nhập</label>
                  <div className="relative">
                    <input 
                      type={showEditMemberPassword ? "text" : "password"} 
                      required
                      placeholder="Mật khẩu tài khoản (Mặc định: 123)"
                      value={editMemberPassword} 
                      onChange={(e) => setEditMemberPassword(e.target.value)}
                      className="w-full text-xs p-3 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditMemberPassword(!showEditMemberPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                      title={showEditMemberPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showEditMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Số Điện Thoại</label>
                  <input 
                    type="tel"
                    placeholder="Quy chuẩn: 09xx xxx xxx"
                    value={editMemberPhone} 
                    onChange={(e) => setEditMemberPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Ngày Sinh</label>
                  <input 
                    type="date"
                    value={editMemberBirthDate} 
                    onChange={(e) => setEditMemberBirthDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-slate-700 font-semibold">
                  <label>Chỉ Số Năng Lực Cơ Bản (KPI target)</label>
                  <span className="font-bold text-indigo-600">{editMemberEfficiency}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  value={editMemberEfficiency} 
                  onChange={(e) => setEditMemberEfficiency(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Khá (50%)</span>
                  <span>Xuất sắc (100%)</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Phân quyền hệ thống</label>
                <select 
                  value={editMemberSystemRole} 
                  onChange={(e) => setEditMemberSystemRole(e.target.value as SystemRole)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950"
                >
                  <option value="Member">Nhân viên thông thường (Member)</option>
                  <option value="Manager">Quản lý duyệt chi (Manager)</option>
                  <option value="Admin">Quản trị viên tối cao (Admin)</option>
                </select>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition duration-150 rounded-xl"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-white font-bold bg-indigo-600 hover:bg-indigo-700 transition duration-150 rounded-xl"
                  >
                    Xác nhận lưu
                  </button>
                </div>
                {permissions.team_add_member && editingMemberId !== 'm1' && editingMemberId !== currentUser.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditOpen(false);
                      setDeleteConfirmId(editingMemberId);
                    }}
                    className="w-full py-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold border border-rose-200 hover:border-rose-300 transition duration-150 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    id="modal_delete_member_btn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa thành viên này khỏi hệ thống
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal for Deleting Member */}
      {deleteConfirmId && (() => {
        const targetMember = members.find(m => m.id === deleteConfirmId);
        if (!targetMember) return null;
        
        // Find tasks assigned to this member
        const assignedTasks = tasks.filter(t => t.assigneeId === deleteConfirmId);

        return (
          <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-150 shadow-2xl w-full max-w-sm p-5 relative">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition whitespace-nowrap block"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                  <AlertCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa thành viên</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Hành động này không thể khôi phục</p>
                </div>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                  <img src={targetMember.avatar} alt={targetMember.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200" referrerPolicy="no-referrer" />
                  <div className="overflow-hidden">
                    <span className="font-bold text-slate-900 block truncate">{targetMember.name}</span>
                    <span className="text-[10px] text-indigo-650 font-bold block truncate">{targetMember.division} • {targetMember.role}</span>
                  </div>
                </div>

                <div className="bg-rose-50/50 border border-rose-100 text-rose-950 p-3.5 rounded-xl space-y-1">
                  <p className="font-bold text-[11px] text-rose-800">⚠️ Ảnh hưởng hệ thống:</p>
                  <ul className="list-disc pl-3.5 space-y-0.5 text-[10.5px] font-medium leading-relaxed text-slate-600">
                    <li>Gỡ bỏ hoàn toàn hồ sơ và vai trò của người dùng này.</li>
                    {assignedTasks.length > 0 ? (
                      <li><strong>{assignedTasks.length} công việc</strong> đang phụ trách sẽ tự động thu hồi về trạng thái <strong>chưa bàn giao (Unassigned)</strong>.</li>
                    ) : (
                      <li>Nhân sự hiện tại không có công việc dở dang nào.</li>
                    )}
                  </ul>
                </div>

                <div className="pt-2 flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-2.5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition duration-150 rounded-xl text-center cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteMember) {
                        onDeleteMember(deleteConfirmId);
                      }
                      setDeleteConfirmId(null);
                    }}
                    className="flex-1 py-2.5 text-white font-bold bg-rose-600 hover:bg-rose-700 transition duration-150 rounded-xl text-center cursor-pointer"
                    id="confirm_delete_member_btn"
                  >
                    Xác nhận xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Daily Checklist Modal */}
      {activeChecklistMemberId && (() => {
        const targetMember = members.find(m => m.id === activeChecklistMemberId);
        if (!targetMember) return null;

        const memberTasks = dailyChecklists[activeChecklistMemberId] || [];
        const completedTasks = memberTasks.filter(t => t.completed).length;
        const totalTasks = memberTasks.length;
        const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const boundedProgress = Math.min(100, progressPercent);

        const handleAddTaskLocal = (e: React.FormEvent) => {
          e.preventDefault();
          if (!newDailyTaskText.trim()) return;
          const newTask = {
            id: 'dc_' + Date.now(),
            text: newDailyTaskText.trim(),
            completed: false
          };
          setDailyChecklists(prev => {
            const list = prev[activeChecklistMemberId] || [];
            return {
              ...prev,
              [activeChecklistMemberId]: [...list, newTask]
            };
          });
          setNewDailyTaskText('');
        };

        const handleToggleTaskLocal = (taskId: string) => {
          setDailyChecklists(prev => {
            const list = prev[activeChecklistMemberId] || [];
            const updated = list.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
            return {
              ...prev,
              [activeChecklistMemberId]: updated
            };
          });
        };

        const handleDeleteTaskLocal = (taskId: string) => {
          setDailyChecklists(prev => {
            const list = prev[activeChecklistMemberId] || [];
            const updated = list.filter(t => t.id !== taskId);
            return {
              ...prev,
              [activeChecklistMemberId]: updated
            };
          });
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto" id="daily_checklist_modal_container">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg p-6 relative flex flex-col max-h-[90vh]">
              {/* Close Button */}
              <button 
                onClick={() => {
                  setActiveChecklistMemberId(null);
                  setNewDailyTaskText('');
                }}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition whitespace-nowrap block cursor-pointer"
                id="close_daily_checklist_modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 pb-4">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <ListTodo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Danh Sách Công Việc Hàng Ngày</h3>
                  <p className="text-xs text-slate-500 font-medium">Bổ sung và theo dõi tiến trình thực tế của từng nhân sự</p>
                </div>
              </div>

              {/* Member profile block */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3.5 mb-5">
                <img 
                  src={targetMember.avatar} 
                  alt={targetMember.name} 
                  className="w-12 h-12 rounded-2xl object-cover shrink-0 border-2 border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="overflow-hidden">
                  <span className="font-extrabold text-slate-900 text-sm block truncate">{targetMember.name}</span>
                  <span className="text-xs font-bold text-indigo-600 bg-white border border-slate-150 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {targetMember.division} • {targetMember.role}
                  </span>
                </div>
              </div>

              {/* Today's Checklist Progress Tracker */}
              <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/35 mb-5 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600">Tiến trình ngày hôm nay:</span>
                  <span className="text-indigo-700 font-bold font-mono">
                    {completedTasks}/{totalTasks} việc ({boundedProgress}%)
                  </span>
                </div>
                
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300 bg-indigo-600"
                    style={{ width: `${boundedProgress}%` }}
                  ></div>
                </div>

                {totalTasks > 0 && boundedProgress === 100 && (
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1 bg-emerald-50 p-2 rounded-xl border border-emerald-100/55">
                    <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>Thành viên đã hoàn thành toàn bộ công việc ngày hôm nay!</span>
                  </p>
                )}
              </div>

              {/* Checklist Tasks List Area */}
              <div className="flex-1 overflow-y-auto max-h-[300px] pr-1 space-y-2.5 min-h-[120px]">
                {memberTasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 italic flex flex-col items-center justify-center space-y-2 bg-slate-25/55 border border-dashed border-slate-200 rounded-2xl">
                    <CheckSquare className="w-8 h-8 text-slate-350 stroke-1" />
                    <div className="text-xs font-semibold">Hiện chưa lập danh sách công việc hàng ngày</div>
                    <p className="text-[10px] text-slate-400 max-w-[280px]">Bắt đầu thêm công việc cụ thể bên dưới để theo sát hiệu suất hoạt động.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memberTasks.map((t) => (
                      <div 
                        key={t.id} 
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                          t.completed 
                            ? 'bg-slate-50/55 border-slate-100/80 text-slate-400' 
                            : 'bg-white border-slate-100/90 text-slate-800 hover:border-slate-200 shadow-3xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          {/* Stylized Checkbox Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleTaskLocal(t.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              t.completed 
                                ? 'bg-emerald-500 border-emerald-600 text-white shadow-2xs' 
                                : 'border-slate-300 hover:border-indigo-500 bg-white'
                            }`}
                          >
                            {t.completed && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </button>
                          
                          <span className={`text-xs font-medium truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {t.text}
                          </span>
                        </div>

                        {/* Trash Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTaskLocal(t.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                          title="Xóa công việc"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Task Add Input Form */}
              <form onSubmit={handleAddTaskLocal} className="mt-5 border-t border-slate-100 pt-4">
                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2">Thêm công việc hôm nay:</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    required
                    maxLength={120}
                    placeholder="Ví dụ: Thiết kế xong banner TikTok, Gửi email báo cáo..."
                    value={newDailyTaskText}
                    onChange={(e) => setNewDailyTaskText(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 bg-white shadow-3xs"
                    id="new_daily_task_input"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
