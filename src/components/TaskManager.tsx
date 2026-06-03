import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Paperclip, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Calendar, 
  Layers,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  User,
  X,
  PlusCircle,
  FileSpreadsheet,
  Gauge,
  Lock,
  Copy,
  Trello
} from 'lucide-react';
import { Task, Member, Priority, TaskStatus, TaskStage, MarketingDivision, Attachment, RolePermissions } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  members: Member[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updatedFields: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  currentUser: Member;
  permissions: RolePermissions;
  divisions?: string[];
}

export default function TaskManager({ 
  tasks, 
  members, 
  onAddTask, 
  onUpdateTask, 
  onDeleteTask,
  currentUser,
  permissions: passedPermissions,
  divisions: passedDivisions
}: TaskManagerProps) {
  const divisions = passedDivisions || ['Content', 'Design', 'Digital Ads', 'Event & PR'];
  // Safe fallback to avoid any potential undefined property access error
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
  // Live ticking real-time clock instead of simulated time
  const [liveTime, setLiveTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const CURRENT_DATE = liveTime;

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterDivision, setFilterDivision] = useState<string>('All');
  const [filterStage, setFilterStage] = useState<string>('All');
  const [filterAssignee, setFilterAssignee] = useState<string>('All');
  const [filterPendingOnly, setFilterPendingOnly] = useState(false); // "Công việc tồn"
  const [filterProgressRange, setFilterProgressRange] = useState<string>('All');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const selectedTask = useMemo(() => {
    return tasks.find(t => t.id === selectedTaskId);
  }, [tasks, selectedTaskId]);

  const isRestrictedEdit = useMemo(() => {
    if (!isEditOpen) return false;
    if (permissions.tasks_edit_all) return false;
    if (selectedTask && selectedTask.createdBy === currentUser.id) return false;
    return true;
  }, [isEditOpen, permissions.tasks_edit_all, selectedTask, currentUser.id]);

  // Clipboard copy state
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);

  // View mode & Calendar State
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth()); // current month
  const [hoveredDateCell, setHoveredDateCell] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<TaskStatus | null>(null);

  // Task form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [division, setDivision] = useState<MarketingDivision>('Content');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Todo');
  const [stage, setStage] = useState<TaskStage>('Production');
  const [progress, setProgress] = useState<number>(0);
  const [deadline, setDeadline] = useState(() => {
    const today = new Date();
    // Default to +5 days or today
    today.setDate(today.getDate() + 5);
    return today.toISOString().split('T')[0];
  });
  const [fileInputName, setFileInputName] = useState('');
  const [fileInputSize, setFileInputSize] = useState('1.5 MB');
  const [tempAttachments, setTempAttachments] = useState<Attachment[]>([]);
  const [sendNotification, setSendNotification] = useState(true);

  // Compute status metrics in filters Header
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'InProgress').length;
    const todo = tasks.filter(t => t.status === 'Todo').length;
    const overdue = tasks.filter(t => {
      const deadlineDate = new Date(t.deadline);
      return t.status !== 'Completed' && deadlineDate < CURRENT_DATE;
    }).length;
    
    // "Công việc tồn" - Pending tasks (Todo or InProgress)
    const pendingTotal = tasks.filter(t => t.status !== 'Completed').length;

    return { total, completed, inProgress, todo, overdue, pendingTotal };
  }, [tasks]);

  // Handle edit launch
  const openEditModal = (task: Task) => {
    setSelectedTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setDivision(task.division);
    setAssigneeId(task.assigneeId);
    setPriority(task.priority);
    setStatus(task.status);
    setStage(task.stage);
    setProgress(task.progress);
    setDeadline(task.deadline);
    setTempAttachments(task.attachments);
    setIsEditOpen(true);
  };

  const handleAddAttachment = () => {
    if (!fileInputName) return;
    const newAttachment: Attachment = {
      name: fileInputName,
      size: fileInputSize || '1.0 MB',
      type: fileInputName.split('.').pop() || 'file',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setTempAttachments([...tempAttachments, newAttachment]);
    setFileInputName('');
  };

  const handleRemoveAttachment = (idx: number) => {
    setTempAttachments(tempAttachments.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDivision('Content');
    setAssigneeId(members[0]?.id || '');
    setPriority('Medium');
    setStatus('Todo');
    setStage('Production');
    setProgress(0);
    const today = new Date();
    today.setDate(today.getDate() + 5);
    setDeadline(today.toISOString().split('T')[0]);
    setFileInputName('');
    setTempAttachments([]);
    setSelectedTaskId(null);
    setSendNotification(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !assigneeId) return;

    if (isEditOpen && selectedTaskId) {
      onUpdateTask(selectedTaskId, {
        title,
        description,
        division,
        assigneeId,
        priority,
        status,
        stage,
        progress: Number(progress),
        deadline,
        attachments: tempAttachments,
        completedAt: status === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
      });
      setIsEditOpen(false);
    } else {
      onAddTask({
        title,
        description,
        division,
        assigneeId,
        priority,
        status,
        stage,
        progress: Number(progress),
        deadline,
        attachments: tempAttachments,
        completedAt: status === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
      });
      setIsAddOpen(false);
    }
    resetForm();
  };

  const handleCopyTaskDetails = (task: Task) => {
    const textToCopy = `Tiêu đề: ${task.title}\nMô tả: ${task.description}\nHạn chót: ${task.deadline}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedTaskId(task.id);
      setTimeout(() => {
        setCopiedTaskId(prev => prev === task.id ? null : prev);
      }, 2000);
    }).catch(err => {
      console.error('Không thể copy vào clipboard: ', err);
    });
  };

  // Calculation of progress counts for badges (filtering-reactive)
  const progressCounts = useMemo(() => {
    const baseTasks = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
      const matchesDivision = filterDivision === 'All' || task.division === filterDivision;
      const matchesStage = filterStage === 'All' || task.stage === filterStage;
      const matchesAssignee = filterAssignee === 'All' || task.assigneeId === filterAssignee;
      const matchesPendingFilter = !filterPendingOnly || task.status !== 'Completed';

      let matchesDateRange = true;
      if (filterStartDate) {
        matchesDateRange = matchesDateRange && task.deadline >= filterStartDate;
      }
      if (filterEndDate) {
        matchesDateRange = matchesDateRange && task.deadline <= filterEndDate;
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDivision && matchesStage && matchesAssignee && matchesPendingFilter && matchesDateRange;
    });

    return {
      All: baseTasks.length,
      '0-25': baseTasks.filter(t => t.progress >= 0 && t.progress <= 25).length,
      '26-50': baseTasks.filter(t => t.progress >= 26 && t.progress <= 50).length,
      '51-75': baseTasks.filter(t => t.progress >= 51 && t.progress <= 75).length,
      '76-100': baseTasks.filter(t => t.progress >= 76 && t.progress <= 100).length
    };
  }, [tasks, searchTerm, filterStatus, filterPriority, filterDivision, filterStage, filterAssignee, filterPendingOnly, filterStartDate, filterEndDate]);

  // Perform multi-layered filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Search term match
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Status match
      const matchesStatus = filterStatus === 'All' || task.status === filterStatus;

      // 3. Priority match
      const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;

      // 4. Division match
      const matchesDivision = filterDivision === 'All' || task.division === filterDivision;

      // 5. Stage match
      const matchesStage = filterStage === 'All' || task.stage === filterStage;

      // 6. Assignee match
      const matchesAssignee = filterAssignee === 'All' || task.assigneeId === filterAssignee;

      // 7. Outstanding "Công việc tồn" filter (NOT completed)
      const matchesPendingFilter = !filterPendingOnly || task.status !== 'Completed';

      // 8. Progress Range filter
      let matchesProgressRange = true;
      if (filterProgressRange !== 'All') {
        const p = task.progress;
        if (filterProgressRange === '0-25') {
          matchesProgressRange = p >= 0 && p <= 25;
        } else if (filterProgressRange === '26-50') {
          matchesProgressRange = p >= 26 && p <= 50;
        } else if (filterProgressRange === '51-75') {
          matchesProgressRange = p >= 51 && p <= 75;
        } else if (filterProgressRange === '76-100') {
          matchesProgressRange = p >= 76 && p <= 100;
        }
      }

      // 9. Date Range filter (Start & End Date of tasks)
      let matchesDateRange = true;
      if (filterStartDate) {
        matchesDateRange = matchesDateRange && task.deadline >= filterStartDate;
      }
      if (filterEndDate) {
        matchesDateRange = matchesDateRange && task.deadline <= filterEndDate;
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDivision && matchesStage && matchesAssignee && matchesPendingFilter && matchesProgressRange && matchesDateRange;
    });
  }, [tasks, searchTerm, filterStatus, filterPriority, filterDivision, filterStage, filterAssignee, filterPendingOnly, filterProgressRange, filterStartDate, filterEndDate]);

  // Month Selection Labels
  const MONTHS_VIETNAMESE = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  // Month navigation
  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnDate = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateTask(taskId, { deadline: dateStr });
    }
    setHoveredDateCell(null);
  };

  const handleDropOnColumn = (e: React.DragEvent, columnStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedFields: Partial<Task> = { status: columnStatus };
        if (columnStatus === 'Completed') {
          updatedFields.progress = 100;
          updatedFields.completedAt = new Date().toISOString().split('T')[0];
        } else if (columnStatus === 'Todo' && task.progress === 100) {
          updatedFields.progress = 0;
        } else if (columnStatus === 'InProgress' && (task.progress === 100 || task.progress === 0)) {
          updatedFields.progress = 50;
        }
        onUpdateTask(taskId, updatedFields);
      }
    }
    setHoveredColumn(null);
  };

  // Generate 42 days grid for standard desktop/mobile calendar view
  const daysInMonthGrid = useMemo(() => {
    const year = calendarYear;
    const month = calendarMonth;
    
    // First day of target month
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay(); 
    
    const gridCells: { date: Date; dateString: string; isCurrentMonth: boolean }[] = [];
    
    const tempDate = new Date(year, month, 1);
    tempDate.setDate(tempDate.getDate() - startOffset);
    
    for (let i = 0; i < 42; i++) {
      const curDate = new Date(tempDate);
      const yyyy = curDate.getFullYear();
      const mm = String(curDate.getMonth() + 1).padStart(2, '0');
      const dd = String(curDate.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      
      gridCells.push({
        date: curDate,
        dateString,
        isCurrentMonth: curDate.getMonth() === month && curDate.getFullYear() === year
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    return gridCells;
  }, [calendarYear, calendarMonth]);

  // Group current filtered tasks by date strings
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    filteredTasks.forEach(task => {
      const dateStr = task.deadline;
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(task);
    });
    return grouped;
  }, [filteredTasks]);

  return (
    <div className="space-y-6" id="tasks_manager_view">
      
      {/* View Mode Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-3xs gap-3">
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
              viewMode === 'kanban' 
                ? 'bg-white text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="view_mode_kanban_tab"
          >
            <Trello className="w-3.5 h-3.5" />
            <span>Bảng Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-white text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="view_mode_list_tab"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Danh sách công việc</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition duration-200 cursor-pointer ${
              viewMode === 'calendar' 
                ? 'bg-white text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="view_mode_calendar_tab"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Lịch tháng</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 px-1">
          {viewMode === 'calendar' && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
              <button 
                onClick={prevMonth}
                className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-lg shadow-3xs hover:shadow-2xs border border-transparent hover:border-slate-100 text-slate-500 transition cursor-pointer"
                title="Tháng trước"
                id="cal_prev_month_btn"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-extrabold text-slate-800 min-w-24 text-center select-none" id="current_calendar_label">
                {MONTHS_VIETNAMESE[calendarMonth]} - {calendarYear}
              </span>
              <button 
                onClick={nextMonth}
                className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-lg shadow-3xs hover:shadow-2xs border border-transparent hover:border-slate-100 text-slate-500 transition cursor-pointer"
                title="Tháng sau"
                id="cal_next_month_btn"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="text-[11px] font-bold text-slate-400 self-center hidden md:block">
            Tổng bộ lọc: <span className="text-slate-800 font-extrabold">{filteredTasks.length}</span> công việc
          </div>
        </div>
      </div>
      
      {/* Search & Comprehensive Filters Layout */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        
        {/* Core Search & High priority Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 group-focus-within:scale-110 transition-all duration-300" />
            <input 
              type="text" 
              placeholder="Tìm kiếm công việc theo từ khóa (Ví dụ: Tết, Banner, viết bài...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-950 focus:shadow-md focus:scale-[1.006]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 p-1 rounded-lg transition-all duration-200 cursor-pointer"
                title="Xóa tìm kiếm"
                id="reset_search_btn"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle công việc tồn */}
            <button
              onClick={() => setFilterPendingOnly(!filterPendingOnly)}
              className={`p-2.5 px-4 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                filterPendingOnly 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold shadow-sm' 
                  : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Gauge className="w-4 h-4 shrink-0" />
              Chỉ xem công việc tồn ({metrics.pendingTotal})
            </button>

            {permissions.tasks_create ? (
              <button
                onClick={() => {
                  resetForm();
                  setIsAddOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4.5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                Giao việc mới
              </button>
            ) : (
              <button
                onClick={() => {
                  resetForm();
                  setAssigneeId(currentUser.id);
                  if (currentUser.division) {
                    setDivision(currentUser.division);
                  }
                  setIsAddOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                id="create_own_plan_btn"
              >
                <PlusCircle className="w-4 h-4" />
                Viết kế hoạch cá nhân
              </button>
            )}
          </div>
        </div>

        {/* Multi Selectors Fields */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-700">
          
          <div className="space-y-1">
            <label className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Trạng Thái</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-250 focus:outline-none rounded-lg text-slate-700"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Todo">Đã giao (Chờ làm)</option>
              <option value="InProgress">Đang thực hiện</option>
              <option value="Completed">Đã hoàn thành</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Mức Ưu Tiên</label>
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-250 focus:outline-none rounded-lg text-slate-700"
            >
              <option value="All">Tất cả mức ưu tiên</option>
              <option value="High">Ưu tiên Cao 🔴</option>
              <option value="Medium">Ưu tiên Trung bình 🟡</option>
              <option value="Low">Ưu tiên Thấp 🟢</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Phòng ban / Phân ban</label>
            <select 
              value={filterDivision} 
              onChange={(e) => setFilterDivision(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-250 focus:outline-none rounded-lg text-slate-700"
            >
              <option value="All">Tất cả phòng ban</option>
              {divisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Giai Đoạn Chiến Dịch</label>
            <select 
              value={filterStage} 
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-250 focus:outline-none rounded-lg text-slate-700"
            >
              <option value="All">Tất cả giai đoạn</option>
              <option value="Planning">Lập kế hoạch</option>
              <option value="Production">Sản xuất</option>
              <option value="Execution">Triển khai</option>
              <option value="Optimization">Tối ưu hóa</option>
            </select>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Người Phụ Trách</label>
            <select 
              value={filterAssignee} 
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-250 focus:outline-none rounded-lg text-slate-700"
            >
              <option value="All">Tất cả thành viên</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Filter to filter list by start / end date */}
        <div className="pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] font-semibold text-slate-700 font-sans" id="task_date_range_filter">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Phạm Vi Ngày Chốt Việc (Deadline)</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Từ ngày:</span>
              <input 
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="p-1.5 px-2.5 bg-slate-50 border border-slate-205 outline-none focus:ring-2 focus:ring-indigo-600 rounded-lg text-xs text-slate-800 transition cursor-pointer"
                id="task_filter_start_date"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Đến ngày:</span>
              <input 
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="p-1.5 px-2.5 bg-slate-50 border border-slate-205 outline-none focus:ring-2 focus:ring-indigo-600 rounded-lg text-xs text-slate-800 transition cursor-pointer"
                id="task_filter_end_date"
              />
            </div>

            {(filterStartDate || filterEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setFilterStartDate('');
                  setFilterEndDate('');
                }}
                className="text-[10px] uppercase font-black text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg hover:bg-rose-50 border border-rose-100 transition cursor-pointer"
                id="clear_date_filter_btn"
              >
                Xóa lọc ngày
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Range Filtering (Requirement) */}
        <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2.5" id="task_progress_range_filter">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-500" />
              Lọc trực quan theo tiến độ thực hiện
            </span>
            {filterProgressRange !== 'All' && (
              <button 
                onClick={() => setFilterProgressRange('All')} 
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            {[
              { id: 'All', title: 'Tất cả mức độ', range: '0-100%', color: 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50', activeColor: 'bg-indigo-950 text-white border-indigo-950 ring-2 ring-indigo-50', barColor: 'bg-indigo-400' },
              { id: '0-25', title: 'Ý tưởng & Bắt đầu', range: '0% - 25%', color: 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50', activeColor: 'bg-slate-100 border-slate-400 text-slate-800 font-extrabold ring-2 ring-slate-100', barColor: 'bg-slate-400' },
              { id: '26-50', title: 'Đang triển khai', range: '26% - 50%', color: 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50', activeColor: 'bg-blue-50 border-blue-400 text-blue-700 font-extrabold ring-2 ring-blue-50', barColor: 'bg-blue-500' },
              { id: '51-75', title: 'Đang hoàn thiện', range: '51% - 75%', color: 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50', activeColor: 'bg-amber-50 border-amber-400 text-amber-700 font-extrabold ring-2 ring-amber-50', barColor: 'bg-amber-500' },
              { id: '76-100', title: 'Bàn giao & Nghiệm thu', range: '76% - 100%', color: 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50', activeColor: 'bg-emerald-50 border-emerald-400 text-emerald-700 font-extrabold ring-2 ring-emerald-50', barColor: 'bg-emerald-500' }
            ].map(rangeOpt => {
              const count = progressCounts[rangeOpt.id as keyof typeof progressCounts] || 0;
              const isActive = filterProgressRange === rangeOpt.id;
              
              return (
                <button
                  key={rangeOpt.id}
                  onClick={() => setFilterProgressRange(rangeOpt.id)}
                  className={`border font-semibold rounded-xl p-2.5 flex flex-col justify-between text-left transition-all duration-150 cursor-pointer shadow-2xs relative overflow-hidden group ${
                    isActive ? rangeOpt.activeColor : rangeOpt.color
                  }`}
                >
                  {/* Miniature Visual Bar indicator at bottom of each bracket button */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 opacity-60">
                    <div className={`h-full ${rangeOpt.barColor} transition-all duration-300 ${isActive ? 'w-full' : 'w-1/4 group-hover:w-1/2'}`} />
                  </div>

                  <div className="flex items-center justify-between w-full gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-tight block truncate uppercase">{rangeOpt.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive 
                        ? (rangeOpt.id === 'All' ? 'bg-white/20 text-white' : 'bg-white text-slate-950 border border-slate-205') 
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}>
                      {count}
                    </span>
                  </div>

                  <div className="text-[11px] font-black font-mono leading-none pt-0.5">
                    {rangeOpt.range}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task List Grid Representation / Monthly Calendar View / Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="kanban_board_container">
          {([
            { status: 'Todo', label: 'Cần làm (Todo)', icon: <Clock className="w-4 h-4 text-slate-500" />, bg: 'bg-slate-50/70', border: 'border-slate-200/60', hoverBg: 'bg-slate-100/85', badgeColor: 'bg-slate-200 text-slate-800' },
            { status: 'InProgress', label: 'Đang thực hiện (In Progress)', icon: <Sparkles className="w-4 h-4 text-indigo-600" />, bg: 'bg-indigo-50/30', border: 'border-indigo-100/60', hoverBg: 'bg-indigo-50/60', badgeColor: 'bg-indigo-100 text-indigo-800' },
            { status: 'Completed', label: 'Đã hoàn thành (Completed)', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, bg: 'bg-emerald-50/20', border: 'border-emerald-100/40', hoverBg: 'bg-emerald-50/40', badgeColor: 'bg-emerald-100 text-emerald-800' }
          ] as const).map(({ status: columnStatus, label, icon, bg, border, hoverBg, badgeColor }) => {
            const columnTasks = filteredTasks.filter(t => t.status === columnStatus);
            const isHovered = hoveredColumn === columnStatus;

            return (
              <div
                key={columnStatus}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (hoveredColumn !== columnStatus) {
                    setHoveredColumn(columnStatus);
                  }
                }}
                onDragLeave={() => setHoveredColumn(null)}
                onDrop={(e) => handleDropOnColumn(e, columnStatus)}
                className={`flex flex-col h-[750px] rounded-2xl border p-4.5 transition-all duration-200 ${bg} ${border} ${
                  isHovered ? `${hoverBg} border-indigo-400 border-2 border-dashed shadow-inner scale-[1.01]` : 'shadow-2xs'
                }`}
                id={`kanban_column_${columnStatus}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 select-none shrink-0">
                  <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">{label}</h3>
                  </div>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${badgeColor}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Draggable Cards Stack container */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {columnTasks.length > 0 ? (
                    columnTasks.map((task) => {
                      const assignee = members.find(m => m.id === task.assigneeId);
                      const deadlineDate = new Date(task.deadline);
                      const isOverdue = task.status !== 'Completed' && deadlineDate < CURRENT_DATE;
                      const diffTime = deadlineDate.getTime() - CURRENT_DATE.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      let deadlineLabel = '';
                      let deadlineClass = 'text-[10px] text-slate-550 bg-slate-50 border border-slate-150';
                      
                      if (task.status === 'Completed') {
                        deadlineLabel = `Xong: ${task.completedAt || 'Hạn đúng'}`;
                        deadlineClass = 'text-[10px] text-emerald-700 bg-emerald-50/80 border border-emerald-100/50';
                      } else if (isOverdue) {
                        deadlineLabel = `Quá hạn ${Math.abs(diffDays)} ngày ⚠️`;
                        deadlineClass = 'text-[10px] text-red-700 bg-red-50 border border-red-200 font-bold';
                      } else if (diffDays === 0) {
                        deadlineLabel = 'Hạn chót hôm nay ⏳';
                        deadlineClass = 'text-[10px] text-amber-700 bg-amber-50 border border-amber-200 font-extrabold';
                      } else if (diffDays <= 3) {
                        deadlineLabel = `Còn ${diffDays} ngày`;
                        deadlineClass = 'text-[10px] text-amber-600 bg-amber-50/50 border border-amber-100 font-semibold';
                      } else {
                        deadlineLabel = `${task.deadline} (Còn ${diffDays} ngày)`;
                        deadlineClass = 'text-[10px] text-slate-500 bg-slate-50/50 border border-slate-100';
                      }

                      let priorityBadge = <span className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.2 rounded font-bold">Thấp</span>;
                      if (task.priority === 'High') {
                        priorityBadge = <span className="bg-red-50 text-red-700 text-[9px] px-1.5 py-0.2 rounded font-black">Cao 🔴</span>;
                      } else if (task.priority === 'Medium') {
                        priorityBadge = <span className="bg-amber-50 text-amber-700 text-[9px] px-1.5 py-0.2 rounded font-bold">Trung bình</span>;
                      }

                      let stageVietnamese = '';
                      switch(task.stage) {
                        case 'Planning': stageVietnamese = 'Lập KH'; break;
                        case 'Production': stageVietnamese = 'Sản xuất'; break;
                        case 'Execution': stageVietnamese = 'Triển khai'; break;
                        case 'Optimization': stageVietnamese = 'Tối ưu hóa'; break;
                      }

                      return (
                        <div
                          key={task.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className={`bg-white rounded-xl border border-slate-150 p-3.5 shadow-3xs cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 transition duration-150 flex flex-col justify-between space-y-3 relative group/card ${
                            isOverdue ? 'border-red-200 ring-1 ring-red-50' : ''
                          }`}
                          id={`kanban_task_card_${task.id}`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center gap-1.5 shrink-0 select-none">
                              <span className="text-[8.5px] font-bold uppercase tracking-wider text-indigo-650 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                                {stageVietnamese}
                              </span>
                              <div className="flex gap-1">
                                {priorityBadge}
                              </div>
                            </div>

                            <div>
                              <h4 
                                className="text-xs font-bold text-slate-900 leading-snug group-hover/card:text-indigo-600 transition cursor-pointer font-sans"
                                onClick={() => openEditModal(task)}
                                title="Bấm vào để mở bảng điều khiển chi tiết"
                              >
                                {task.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-normal font-sans">
                                {task.description}
                              </p>
                            </div>

                            {/* Progress info */}
                            <div className="space-y-1 select-none">
                              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                                <span>Tiến trình</span>
                                <span className="text-slate-800 font-extrabold">{task.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    task.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-600'
                                  }`}
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Deadline info */}
                            <div className={`p-1.5 px-2.5 rounded-lg flex items-center gap-1.5 select-none ${deadlineClass}`}>
                              <Calendar className="w-3 h-3 text-current shrink-0" />
                              <span className="truncate">{deadlineLabel}</span>
                            </div>

                            {/* Attachments quick-show */}
                            {task.attachments && task.attachments.length > 0 && (
                              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 select-none">
                                <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{task.attachments.length} tài liệu đính kèm</span>
                              </div>
                            )}
                          </div>

                          {/* Footer with avatar & hover quick controls */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 select-none shrink-0">
                            {assignee ? (
                              <div className="flex items-center gap-1.5">
                                <img 
                                  src={assignee.avatar} 
                                  alt={assignee.name} 
                                  className="w-5.5 h-5.5 rounded-full object-cover border border-slate-100"
                                  title={`Phụ trách: ${assignee.name}`}
                                  referrerPolicy="no-referrer"
                                />
                                <span className="text-[10px] font-bold text-slate-600 max-w-20 truncate">{assignee.name.split(' ').pop()}</span>
                              </div>
                            ) : (
                              <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5">
                                <AlertCircle className="w-2.5 h-2.5" /> Không ai phụ trách
                              </span>
                            )}

                            {/* Interactive Quick buttons */}
                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover/card:opacity-100 transition duration-155">
                              <button
                                onClick={() => handleCopyTaskDetails(task)}
                                className={`p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition cursor-pointer`}
                                title="Sao chép chi tiết công việc"
                                id={`copy_kanban_btn_${task.id}`}
                              >
                                {copiedTaskId === task.id ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              
                              {(() => {
                                const canEdit = permissions.tasks_edit_all || task.assigneeId === currentUser.id || task.createdBy === currentUser.id;
                                return (
                                  <button 
                                    disabled={!canEdit}
                                    onClick={() => openEditModal(task)}
                                    className={`p-1 rounded border border-transparent transition cursor-pointer ${
                                      canEdit 
                                        ? 'text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100' 
                                        : 'text-slate-350 cursor-not-allowed opacity-50'
                                    }`}
                                    title={canEdit ? "Chỉnh sửa công việc" : "Không có quyền sửa"}
                                  >
                                    {canEdit ? <Edit className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                  </button>
                                );
                              })()}

                              {(() => {
                                const canDelete = permissions.tasks_delete || task.createdBy === currentUser.id;
                                return (
                                  <button 
                                    disabled={!canDelete}
                                    onClick={() => {
                                      setTaskToDelete(task);
                                      setIsDeleteConfirmOpen(true);
                                    }}
                                    className={`p-1 rounded border border-transparent transition cursor-pointer ${
                                      canDelete 
                                        ? 'text-red-500 hover:bg-red-50 hover:border-red-150' 
                                        : 'text-slate-300 cursor-not-allowed opacity-50'
                                    }`}
                                    title={canDelete ? "Xóa" : "Không có quyền xóa"}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 border-2 border-dashed border-slate-150 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center text-center p-4">
                      <Clock className="w-6 h-6 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400">Trống cột {label.split(' ')[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const assignee = members.find(m => m.id === task.assigneeId);
            
            // Calculate timing differences
            const deadlineDate = new Date(task.deadline);
            const isOverdue = task.status !== 'Completed' && deadlineDate < CURRENT_DATE;
            const diffTime = deadlineDate.getTime() - CURRENT_DATE.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let deadlineLabel = '';
            let deadlineClass = 'text-slate-500 bg-slate-55';
            
            if (task.status === 'Completed') {
              deadlineLabel = `Đã hoàn thành lúc: ${task.completedAt || 'Hạn đúng'}`;
              deadlineClass = 'text-emerald-700 bg-emerald-50';
            } else if (isOverdue) {
              deadlineLabel = `Quá hạn ${Math.abs(diffDays)} ngày ⚠️`;
              deadlineClass = 'text-red-700 bg-red-100 font-bold animate-pulse';
            } else if (diffDays === 0) {
              deadlineLabel = 'Hạn chót vào hôm nay ⏳';
              deadlineClass = 'text-amber-700 bg-amber-100 font-extrabold';
            } else if (diffDays <= 3) {
              deadlineLabel = `Còn ${diffDays} ngày nữa - Sắp hết hạn`;
              deadlineClass = 'text-amber-700 bg-amber-50 font-bold';
            } else {
              deadlineLabel = `Hạn chót: ${task.deadline} (Còn ${diffDays} ngày)`;
              deadlineClass = 'text-slate-650 bg-slate-100';
            }

            // Priorities badges
            let priorityBadge = <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">Thấp 🟢</span>;
            if (task.priority === 'High') {
              priorityBadge = <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-black tracking-wide">Cao 🔴</span>;
            } else if (task.priority === 'Medium') {
              priorityBadge = <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">Trung bình 🟡</span>;
            }

            // Stage Label
            let stageVietnamese = '';
            switch(task.stage) {
              case 'Planning': stageVietnamese = 'GĐ 1: Lập kế hoạch'; break;
              case 'Production': stageVietnamese = 'GĐ 2: Sản xuất Content'; break;
              case 'Execution': stageVietnamese = 'GĐ 3: Triển khai Ads/Event'; break;
              case 'Optimization': stageVietnamese = 'GĐ 4: Tối ưu hoá/SEO'; break;
            }

            return (
              <div 
                key={task.id} 
                className={`bg-white rounded-2xl border p-5 hover:shadow-lg transition flex flex-col justify-between ${
                  isOverdue ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-100'
                }`}
              >
                <div className="space-y-4">
                  
                  {/* Title and stage row */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {stageVietnamese}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      {priorityBadge}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' 
                        : task.status === 'InProgress' ? 'bg-blue-100 text-blue-800' 
                        : 'bg-slate-100 text-slate-700'
                      }`}>
                        {task.status === 'Completed' ? 'Đã hoàn thành' : task.status === 'InProgress' ? 'Đang thực hiện' : 'Đã giao'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug hover:text-indigo-600 cursor-pointer" onClick={() => openEditModal(task)}>
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 lines-clamp-3 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  {/* Deadline box */}
                  <div className={`p-2.5 rounded-xl text-center text-xs flex items-center justify-center gap-2 ${deadlineClass}`}>
                    <Calendar className="w-4 h-4 text-current" />
                    <span>{deadlineLabel}</span>
                  </div>

                  {/* Task progress bar (Requirement 5) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Tiến độ thực tế</span>
                      <span className="text-slate-900 font-bold">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          task.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Attachments Section (Requirement 2) */}
                  {task.attachments && task.attachments.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Tài liệu đính kèm ({task.attachments.length})</span>
                      <div className="space-y-1">
                        {task.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs font-semibold bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 truncate text-slate-700 hover:text-indigo-600 cursor-pointer">
                              <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{file.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{file.size}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Team interaction, assignee, action buttons (Requirement 2 & 10) */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  {assignee ? (
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={assignee.avatar} 
                        alt={assignee.name} 
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Phụ trách</span>
                        <span className="text-xs font-bold text-slate-900">{assignee.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-600 font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      Chưa có người phụ trách
                    </div>
                  )}

                  {/* Task Actions checking assignee and permissions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyTaskDetails(task)}
                      className={`p-1 px-2 text-[10px] font-semibold rounded transition flex items-center gap-1 cursor-pointer border ${
                        copiedTaskId === task.id
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-650 hover:bg-slate-100'
                      }`}
                      title="Sao chép thông tin chi tiết công việc"
                      id={`copy_task_btn_${task.id}`}
                    >
                      {copiedTaskId === task.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>

                    {(() => {
                      const canEdit = permissions.tasks_edit_all || task.assigneeId === currentUser.id || task.createdBy === currentUser.id;
                      return (
                        <button 
                          disabled={!canEdit}
                          onClick={() => openEditModal(task)}
                          className={`p-1 px-2 text-[10px] font-semibold rounded transition flex items-center gap-1 ${
                            canEdit 
                              ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 cursor-pointer' 
                              : 'text-slate-400 bg-slate-100 cursor-not-allowed opacity-75'
                          }`}
                          title={canEdit ? (permissions.tasks_edit_all ? "Sửa toàn bộ thông tin" : "Cập nhật tiến độ hoặc kế hoạch tự viết") : "Chỉ người phụ trách hoặc Quản lý được thao tác"}
                        >
                          {canEdit ? <Edit className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          Thao tác
                        </button>
                      );
                    })()}

                    {(() => {
                      const canDelete = permissions.tasks_delete || task.createdBy === currentUser.id;
                      return (
                        <button 
                          disabled={!canDelete}
                          onClick={() => {
                            setTaskToDelete(task);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className={`p-2 rounded transition ${
                            canDelete 
                              ? 'bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer' 
                              : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                          }`}
                          title={canDelete ? "Xóa công việc" : "Chỉ người lập kế hoạch hoặc Quản trị viên mới được xóa"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-100 italic text-slate-400">
            Không tìm thấy công việc nào thỏa mãn bộ lọc hiện tại.
          </div>
        )}
      </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="calendar_view_container">
          {/* Calendar Day names column headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 text-center py-3 text-xs font-extrabold text-slate-500 uppercase tracking-wider select-none">
            <div className="text-rose-500">CN</div>
            <div>T2</div>
            <div>T3</div>
            <div>T4</div>
            <div>T5</div>
            <div>T6</div>
            <div className="text-indigo-600">T7</div>
          </div>

          {/* Monthly Day cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 border-b border-slate-100 bg-slate-100/10">
            {daysInMonthGrid.map(({ date, dateString, isCurrentMonth }, idx) => {
              const dayTasks = tasksByDate[dateString] || [];
              const isToday = dateString === CURRENT_DATE.toISOString().split('T')[0]; // Current clock date
              const isHovered = hoveredDateCell === dateString;

              return (
                <div
                  key={idx}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setHoveredDateCell(dateString);
                  }}
                  onDragLeave={() => setHoveredDateCell(null)}
                  onDrop={(e) => handleDropOnDate(e, dateString)}
                  onDoubleClick={() => {
                    resetForm();
                    if (!permissions.tasks_create) {
                      setAssigneeId(currentUser.id);
                      if (currentUser.division) {
                        setDivision(currentUser.division);
                      }
                    }
                    setDeadline(dateString);
                    setIsAddOpen(true);
                  }}
                  className={`min-h-[145px] p-2 flex flex-col justify-between transition group hover:bg-slate-50/70 relative ${
                    isCurrentMonth ? 'bg-white text-slate-900' : 'bg-slate-50/30 text-slate-400'
                  } ${isToday ? 'ring-2 ring-inset ring-indigo-500 bg-indigo-50/20' : ''} ${
                    isHovered ? 'bg-indigo-50/50 border-2 border-dashed border-indigo-400' : ''
                  }`}
                  id={`calendar_day_${dateString}`}
                >
                  <div className="flex items-center justify-between mb-1.5 select-none">
                    <span className={`text-xs font-bold leading-none w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday 
                        ? 'bg-indigo-600 text-white font-black' 
                        : isCurrentMonth ? 'text-slate-805' : 'text-slate-450'
                    }`}>
                      {date.getDate()}
                    </span>
                    {isToday && (
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-md leading-none">
                        Hôm nay
                      </span>
                    )}
                    {!isToday && isCurrentMonth && dayTasks.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md leading-none">
                        {dayTasks.length} việc
                      </span>
                    )}
                  </div>

                  {/* Plotted task items */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[105px] scrollbar-thin scrollbar-thumb-slate-200 pr-1 select-none">
                    {dayTasks.map((task) => {
                      const assignee = members.find(m => m.id === task.assigneeId);
                      
                      // Priority color accent border
                      let priorityStyle = 'border-l-[3px] border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/35 text-emerald-950';
                      if (task.priority === 'High') {
                        priorityStyle = 'border-l-[3px] border-red-500 bg-red-50/20 hover:bg-red-50/35 text-red-950';
                      } else if (task.priority === 'Medium') {
                        priorityStyle = 'border-l-[3px] border-amber-500 bg-amber-50/20 hover:bg-amber-50/35 text-amber-950';
                      }

                      return (
                        <div
                          key={task.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => openEditModal(task)}
                          className={`p-1.5 rounded-lg border border-slate-150 shadow-3xs hover:shadow-2xs transition cursor-grab active:cursor-grabbing text-[11px] font-bold list-none flex flex-col gap-1 ${priorityStyle}`}
                          title={`Kéo thả để dời ngày hạn chót. Click để xem chi tiết.`}
                          id={`calendar_task_card_${task.id}`}
                        >
                          <div className="line-clamp-2 leading-tight">
                            {task.title}
                          </div>
                          <div className="flex items-center justify-between gap-1.5 select-none text-[9px] text-slate-500 mt-0.5 font-semibold">
                            <span className="px-1 py-0.2 bg-white/80 rounded border border-slate-200 text-[8px] font-bold">
                              {task.progress}%
                            </span>
                            {assignee && (
                              <img 
                                src={assignee.avatar} 
                                alt={assignee.name} 
                                className="w-4.5 h-4.5 rounded-full object-cover border border-white shrink-0"
                                title={`Giao cho: ${assignee.name}`}
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Highlight double-click hint when cursor hover cell */}
                  <div className="opacity-0 group-hover:opacity-100 transition duration-150 absolute bottom-1 right-1 text-[8px] text-slate-400 pointer-events-none select-none font-semibold">
                    Đúp click +
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 p-3 text-[11px] text-slate-500 font-semibold flex flex-col md:flex-row md:items-center justify-between gap-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Ưu tiên Cao</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Trung bình</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Thấp</span>
            </div>
            <p className="italic text-slate-400 col-span-2 md:col-span-1">
              * Hướng dẫn: Nhấn đúp (double-click) vào ngày bất kỳ để giao việc nhanh vào ngày đó. Kéo thả để cập nhật Deadline. *
            </p>
          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT TASK */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg p-6 relative my-8">
            <button 
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
                resetForm();
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEditOpen ? 'Cập nhật Công việc Marketing' : 'Giao nhiệm vụ Marketing mới'}
                </h3>
                <p className="text-xs text-slate-500">Thiết lập mục tiêu, phân ban, người phụ trách và giai đoạn chiến dịch</p>
              </div>
            </div>

            {isRestrictedEdit && (
              <div className="mb-4.5 p-3.5 bg-amber-50 border border-amber-150 text-amber-900 rounded-xl flex gap-2.5 text-[11px] leading-relaxed">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Hạn chế quyền (Nhân viên):</span> Bạn chỉ có đặc quyền cập nhật <strong>Tiến độ (%)</strong> và <strong>Trạng thái</strong> làm việc của công việc được phân bổ. Tất cả các nội dung thiết lập khác đã bị khóa bởi trưởng bộ phận.
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Tên công việc / Đầu việc</label>
                <input 
                  type="text" 
                  required
                  disabled={isRestrictedEdit}
                  placeholder="Ví dụ: Thiết kế bộ sưu tập Visual Banner tháng 5"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Nội dung yêu cầu chi tiết</label>
                <textarea 
                  required
                  disabled={isRestrictedEdit}
                  rows={2}
                  placeholder="Nhập hướng dẫn chi tiết, định dạng ảnh, keyword SEO, ngân sách chạy..."
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Phòng ban chuyên trách</label>
                  <select 
                    value={division} 
                    disabled={isRestrictedEdit}
                    onChange={(e) => setDivision(e.target.value as MarketingDivision)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    {divisions.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">
                    Người phụ trách { !permissions.tasks_create && <span className="text-emerald-600 text-[10px] font-bold">(Kế hoạch cá nhân)</span> }
                  </label>
                  <select 
                    required
                    disabled={isRestrictedEdit || !permissions.tasks_create}
                    value={assigneeId} 
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn một thành viên...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Mức độ ưu tiên</label>
                  <select 
                    value={priority} 
                    disabled={isRestrictedEdit}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none text-slate-950 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    <option value="High">Cao 🔴</option>
                    <option value="Medium">Trung bình 🟡</option>
                    <option value="Low">Thấp 🟢</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Giai đoạn chiến dịch</label>
                  <select 
                    value={stage} 
                    disabled={isRestrictedEdit}
                    onChange={(e) => setStage(e.target.value as TaskStage)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none text-slate-950 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    <option value="Planning">1. Lập kế hoạch</option>
                    <option value="Production">2. Sản xuất content</option>
                    <option value="Execution">3. Triển khai vận hành</option>
                    <option value="Optimization">4. Tối ưu hoá/SEO</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Trạng Thái làm việc</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none text-slate-950 focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="Todo">1. Đã giao (Chờ)</option>
                    <option value="InProgress">2. Đang thực hiện</option>
                    <option value="Completed">3. Đã hoàn thành 🎉</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Hạn Chót (Deadline)</label>
                  <input 
                    type="date" 
                    required
                    disabled={isRestrictedEdit}
                    value={deadline} 
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-slate-700 font-semibold">
                    <label>Tiến Độ Hiện Tại</label>
                    <span className="font-bold text-indigo-600">{progress}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress} 
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-3"
                  />
                </div>
              </div>

              {/* Requirement 2 & Mock attachments management inside editor */}
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <label className="text-slate-700 font-bold block">Quản lý Tài liệu Đính kèm</label>
                
                {tempAttachments.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {tempAttachments.map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-white p-2 border border-slate-100 rounded-lg font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5 truncate">
                          <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{f.size}</span>
                          {!isRestrictedEdit ? (
                            <button type="button" onClick={() => handleRemoveAttachment(i)} className="text-red-500 hover:text-red-700">
                              X
                            </button>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isRestrictedEdit ? (
                  <div className="flex gap-2 animate-fade-in">
                    <input 
                      type="text"
                      placeholder="Phác_thảo_Visual_Chính.pdf"
                      value={fileInputName}
                      onChange={(e) => setFileInputName(e.target.value)}
                      className="flex-1 text-xs p-2 rounded-lg border border-slate-200 focus:outline-none bg-white text-slate-950 placeholder-slate-400 hover:border-slate-355 focus:border-indigo-500"
                    />
                    <input 
                      type="text"
                      placeholder="1.2 MB"
                      value={fileInputSize}
                      onChange={(e) => setFileInputSize(e.target.value)}
                      className="w-20 text-xs p-2 rounded-lg border border-slate-200 focus:outline-none bg-white text-slate-950 text-center"
                    />
                    <button 
                      type="button"
                      onClick={handleAddAttachment}
                      className="px-3.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg text-indigo-600 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      Đính kèm
                    </button>
                  </div>
                ) : (
                  <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 text-center text-[10px] italic flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    Không thể sửa đổi tài liệu đính kèm
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                    resetForm();
                  }}
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

      {/* CONFIRM DELETE TASK MODAL */}
      {isDeleteConfirmOpen && taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto" id="delete_task_confirm_modal">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setTaskToDelete(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              id="close_delete_confirm_modal_btn"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-3.5 mb-5 select-none">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Xác nhận xóa công việc</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Hành động này sẽ xóa vĩnh viễn công việc và toàn bộ tài liệu đính kèm liên quan. Bạn có chắc chắn muốn tiếp tục?
                </p>
              </div>
            </div>

            {/* Task Details Highlight */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl mb-6 text-xs text-slate-700 font-bold space-y-1.5 leading-normal">
              <div className="text-[10px] text-slate-400 block uppercase font-extrabold tracking-wider">Công việc cần xóa:</div>
              <div className="text-slate-900 font-extrabold leading-snug">{taskToDelete.title}</div>
              <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-200/60">
                <div>Phòng ban: <span className="text-indigo-600 font-bold">{taskToDelete.division}</span></div>
                <div>Hạn chót: <span className="text-slate-700 font-bold">{taskToDelete.deadline}</span></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setTaskToDelete(null);
                }}
                className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition duration-150 rounded-xl text-xs"
                id="cancel_delete_task_btn"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (taskToDelete) {
                    onDeleteTask(taskToDelete.id);
                  }
                  setIsDeleteConfirmOpen(false);
                  setTaskToDelete(null);
                }}
                className="flex-1 py-3 text-white font-bold bg-rose-600 hover:bg-rose-700 transition duration-150 rounded-xl text-xs shadow-sm"
                id="confirm_delete_task_btn"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
