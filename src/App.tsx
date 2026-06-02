/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  Users, 
  FileText, 
  Sparkles, 
  Bell, 
  CalendarDays, 
  HelpCircle,
  TrendingUp,
  Mail,
  Receipt,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Link2
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Imports types and components
import { Task, Member, Invoice, SystemRole, RolePermissions, AppNotification } from './types';
import { INITIAL_MEMBERS, INITIAL_TASKS, INITIAL_INVOICES } from './data/mockData';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
// Removed BillingTracker import
import TeamPerformance from './components/TeamPerformance';
import PermissionsManager from './components/PermissionsManager';
import InternalAdminLinks from './components/InternalAdminLinks';

const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, RolePermissions> = {
  Admin: {
    tasks_create: true,
    tasks_edit_all: true,
    tasks_delete: true,
    billing_view: true,
    billing_create: true,
    billing_status_update: true,
    billing_delete: true,
    team_add_member: true,
    roles_manage: true
  },
  Manager: {
    tasks_create: true,
    tasks_edit_all: true,
    tasks_delete: false,
    billing_view: true,
    billing_create: true,
    billing_status_update: true,
    billing_delete: false,
    team_add_member: true,
    roles_manage: false
  },
  Member: {
    tasks_create: false,
    tasks_edit_all: false,
    tasks_delete: false,
    billing_view: false,
    billing_create: false,
    billing_status_update: false,
    billing_delete: false,
    team_add_member: false,
    roles_manage: false
  }
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    memberId: 'm1', // Nguyễn Văn Hải (Admin)
    title: '📢 Chào mừng bạn đến với MKT Portal',
    message: 'Hệ thống Quản lý Vận hành Marketing đã sẵn sàng phục vụ. Bạn đang hoạt động với vai trò Admin kiểm soát vị trí rộng rãi.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
    isRead: false
  },
  {
    id: 'notif-2',
    memberId: 'm2', // Trần Thị Mai (Manager)
    title: '📬 Công việc mới trong phòng ban',
    message: 'Nguyễn Văn Hải đã giao công việc "Viết bộ bài đăng 10 bài Facebook mở màn" cho bạn thuộc phòng Content.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    isRead: true
  },
  {
    id: 'notif-3',
    memberId: 'm3', // Phạm Minh Đức (Member)
    title: '📬 Bạn được giao công việc mới',
    message: 'Trần Thị Mai đã giao công việc "Thi công ấn phẩm Banner Carousel tuyển dụng" cho bạn. Phòng ban: Design.',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1h ago
    isRead: false
  }
];

export default function App() {
  const [appTime, setAppTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setAppTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // RBAC System States
  const [currentUser, setCurrentUser] = useState<Member>(() => {
    const cached = localStorage.getItem('mkt_current_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.systemRole) return parsed;
      } catch (e) {
        console.error("Error parsing cached user:", e);
      }
    }
    return INITIAL_MEMBERS.find(m => m.systemRole === 'Admin') || INITIAL_MEMBERS[0];
  });

  const [rolePermissions, setRolePermissions] = useState<Record<SystemRole, RolePermissions>>(() => {
    const cached = localStorage.getItem('mkt_role_permissions');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Deep merge with DEFAULT_ROLE_PERMISSIONS to ensure all fields/new keys exist
        const merged = { ...DEFAULT_ROLE_PERMISSIONS };
        (Object.keys(DEFAULT_ROLE_PERMISSIONS) as SystemRole[]).forEach(role => {
          merged[role] = {
            ...DEFAULT_ROLE_PERMISSIONS[role],
            ...(parsed[role] || {})
          };
        });
        return merged;
      } catch (e) {
        console.error("Error parsing cached permissions:", e);
      }
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  const activePermissions = (currentUser && currentUser.systemRole && rolePermissions[currentUser.systemRole])
    ? rolePermissions[currentUser.systemRole]
    : (DEFAULT_ROLE_PERMISSIONS[currentUser?.systemRole] || DEFAULT_ROLE_PERMISSIONS.Member);

  const [divisions, setDivisions] = useState<string[]>(() => {
    const cached = localStorage.getItem('mkt_divisions');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Error parsing divisions:", e);
      }
    }
    return ['Content', 'Design', 'Digital Ads', 'Event & PR'];
  });

  const saveDivisions = (newDivs: string[]) => {
    setDivisions(newDivs);
    localStorage.setItem('mkt_divisions', JSON.stringify(newDivs));
  };

  const handleAddDivision = (newDiv: string) => {
    if (!newDiv || newDiv.trim() === '') return;
    const trimmed = newDiv.trim();
    if (divisions.map(d => d.toLowerCase()).includes(trimmed.toLowerCase())) {
      triggerNotification(`Phân ban "${trimmed}" đã tồn tại!`);
      return;
    }
    const updated = [...divisions, trimmed];
    saveDivisions(updated);
    triggerNotification(`Đã tạo phân ban thành công: "${trimmed}"`);
  };

  // Initialize data from localStorage with reliable fallback to populated mockData
  useEffect(() => {
    const cachedMembers = localStorage.getItem('mkt_members');
    const cachedTasks = localStorage.getItem('mkt_tasks');
    const cachedInvoices = localStorage.getItem('mkt_invoices');

    if (cachedMembers) {
      setMembers(JSON.parse(cachedMembers));
    } else {
      setMembers(INITIAL_MEMBERS);
      localStorage.setItem('mkt_members', JSON.stringify(INITIAL_MEMBERS));
    }

    if (cachedTasks) {
      setTasks(JSON.parse(cachedTasks));
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem('mkt_tasks', JSON.stringify(INITIAL_TASKS));
    }

    if (cachedInvoices) {
      setInvoices(JSON.parse(cachedInvoices));
    } else {
      setInvoices(INITIAL_INVOICES);
      localStorage.setItem('mkt_invoices', JSON.stringify(INITIAL_INVOICES));
    }

    const cachedNotifications = localStorage.getItem('mkt_notifications');
    if (cachedNotifications) {
      setNotifications(JSON.parse(cachedNotifications));
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
      localStorage.setItem('mkt_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  }, []);

  // Save changes to localStorage on any state modification
  const saveNotifications = (newNotifs: AppNotification[]) => {
    setNotifications(newNotifs);
    localStorage.setItem('mkt_notifications', JSON.stringify(newNotifs));
  };

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('mkt_tasks', JSON.stringify(newTasks));
  };

  const saveMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
    localStorage.setItem('mkt_members', JSON.stringify(newMembers));
  };

  const saveInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    localStorage.setItem('mkt_invoices', JSON.stringify(newInvoices));
  };

  // Notification utility
  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // --- Task Operations ---
  const handleAddTask = (newTaskFields: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskFields,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newTask, ...tasks];
    saveTasks(updated);
    triggerNotification(`Đã giao công việc mới: "${newTask.title}"`);

    // Gửi thông báo về tài khoản của các thành viên trong phòng hoặc người được phân công trực tiếp
    const assigneeName = members.find(m => m.id === newTask.assigneeId)?.name || 'Thành viên mới';
    const newNotifications: AppNotification[] = [];

    members.forEach(m => {
      // Nhận thông báo nếu thuộc phòng ban (division) của công việc hoặc nhận trực tiếp công việc đó
      if (m.division === newTask.division || m.id === newTask.assigneeId) {
        const isDirectAssignee = m.id === newTask.assigneeId;
        const notifTitle = isDirectAssignee ? '📬 Bạn được giao công việc mới' : '📢 Phòng của bạn có công việc mới';
        const notifMsg = isDirectAssignee
          ? `Bạn đã được giao công việc "${newTask.title}" bởi ${currentUser.name}. Phòng ban: ${newTask.division}. Hạn chót: ${newTask.deadline}.`
          : `${currentUser.name} đã giao công việc "${newTask.title}" cho ${assigneeName} thuộc phòng ban ${newTask.division} của bạn. Hạn chót: ${newTask.deadline}.`;

        newNotifications.push({
          id: `notif-${Date.now()}-${m.id}`,
          memberId: m.id,
          title: notifTitle,
          message: notifMsg,
          createdAt: new Date().toISOString(),
          isRead: false,
          taskId: newTask.id,
          senderName: currentUser.name
        });
      }
    });

    if (newNotifications.length > 0) {
      saveNotifications([...newNotifications, ...notifications]);
    }
  };

  const handleUpdateTask = (id: string, updatedFields: Partial<Task>) => {
    const originalTask = tasks.find(t => t.id === id);
    const updated = tasks.map(t => t.id === id ? { ...t, ...updatedFields } : t);
    saveTasks(updated);
    triggerNotification('Đã cập nhật thay đổi trạng thái công việc');

    if (originalTask) {
      const assigneeId = updatedFields.assigneeId || originalTask.assigneeId;
      const division = updatedFields.division || originalTask.division;
      const title = updatedFields.title || originalTask.title;
      const deadline = updatedFields.deadline || originalTask.deadline;
      const assigneeName = members.find(m => m.id === assigneeId)?.name || 'Thành viên';
      
      const updateNotificationsStack: AppNotification[] = [];

      // TH1: Chuyển giao công việc (Re-assignee changed)
      if (updatedFields.assigneeId && updatedFields.assigneeId !== originalTask.assigneeId) {
        members.forEach(m => {
          if (m.id === assigneeId || m.id === originalTask.assigneeId || m.division === division) {
            const isTarget = m.id === assigneeId;
            const isOldAssignee = m.id === originalTask.assigneeId;
            
            let titleText = '🔄 Thay đổi người nhận việc trong phòng';
            let msgText = `${currentUser.name} đã bàn giao lại công việc "${title}" cho ${assigneeName}.`;
            
            if (isTarget) {
              titleText = '📬 Bạn được chuyển giao công việc mới';
              msgText = `Công việc "${title}" đã được bàn giao lại cho bạn từ ${currentUser.name}. Hạn chót: ${deadline}.`;
            } else if (isOldAssignee) {
              titleText = '📤 Công việc đã được chuyển giao';
              msgText = `Công việc "${title}" trước đây của bạn đã được ${currentUser.name} bàn giao lại cho ${assigneeName}.`;
            }

            updateNotificationsStack.push({
              id: `notif-${Date.now()}-${m.id}`,
              memberId: m.id,
              title: titleText,
              message: msgText,
              createdAt: new Date().toISOString(),
              isRead: false,
              taskId: id,
              senderName: currentUser.name
            });
          }
        });
      }
      // TH2: Cập nhật trạng thái công việc (Status updated)
      else if (updatedFields.status && updatedFields.status !== originalTask.status) {
        const viStatuses = { Todo: 'Đã giao', InProgress: 'Đang thực hiện', Completed: 'Đã hoàn thành' };
        const statusText = viStatuses[updatedFields.status] || updatedFields.status;

        members.forEach(m => {
          if (m.id === assigneeId || m.division === division) {
            const isDirectAssignee = m.id === assigneeId;
            updateNotificationsStack.push({
              id: `notif-${Date.now()}-${m.id}`,
              memberId: m.id,
              title: `📈 Cập nhật tiến độ: ${title}`,
              message: `${isDirectAssignee ? 'Bạn' : assigneeName} đã cập nhật trạng thái công việc "${title}" thành "${statusText}" (${updatedFields.progress || originalTask.progress}%).`,
              createdAt: new Date().toISOString(),
              isRead: false,
              taskId: id,
              senderName: currentUser.name
            });
          }
        });
      }

      if (updateNotificationsStack.length > 0) {
        setNotifications(prev => {
          const merged = [...updateNotificationsStack, ...prev];
          localStorage.setItem('mkt_notifications', JSON.stringify(merged));
          return merged;
        });
      }
    }
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
    if (taskToDelete) {
      triggerNotification(`Đã gỡ bỏ công việc: "${taskToDelete.title}"`);
    }
  };

  // --- Member Operations ---
  const handleAddMember = (newMemberFields: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...newMemberFields,
      id: `member-${Date.now()}`
    };
    const updated = [...members, newMember];
    saveMembers(updated);
    triggerNotification(`Bổ nhiệm nhân sự mới: ${newMember.name}`);
  };

  const handleUpdateMember = (id: string, updatedFields: Partial<Member>) => {
    const updated = members.map(m => m.id === id ? { ...m, ...updatedFields } : m);
    saveMembers(updated);

    // If edited user is currently active currentUser, sync its data immediately
    if (currentUser && currentUser.id === id) {
      const updatedUser = { ...currentUser, ...updatedFields };
      setCurrentUser(updatedUser);
      localStorage.setItem('mkt_current_user', JSON.stringify(updatedUser));
    }
    triggerNotification(`Đã cập nhật thông tin thành viên thành công!`);
  };

  const handleDeleteMember = (id: string) => {
    if (id === 'm1') {
      triggerNotification('Không thể xóa quản trị viên tối cao (Admin) để tránh lỗi hệ thống!');
      return;
    }
    if (currentUser.id === id) {
      triggerNotification('Không thể tự xóa tài khoản chính bạn đang sử dụng!');
      return;
    }

    const memberToDelete = members.find(m => m.id === id);
    if (!memberToDelete) return;

    const updatedMembers = members.filter(m => m.id !== id);
    saveMembers(updatedMembers);

    const updatedTasks = tasks.map(t => t.assigneeId === id ? { ...t, assigneeId: '' } : t);
    saveTasks(updatedTasks);

    triggerNotification(`Đã xóa thành viên "${memberToDelete.name}" khỏi phòng ban.`);
  };

  // --- Invoice Operations ---
  const handleAddInvoice = (newInvoiceFields: Omit<Invoice, 'id' | 'totalAmount'>) => {
    const calculatedTotal = newInvoiceFields.preTaxAmount * (1 + newInvoiceFields.vatPercent / 100);
    const newInvoice: Invoice = {
      ...newInvoiceFields,
      id: `invoice-${Date.now()}`,
      totalAmount: Math.round(calculatedTotal)
    };
    const updated = [newInvoice, ...invoices];
    saveInvoices(updated);
    triggerNotification(`Kê khai hóa đơn thành công [${newInvoice.invoiceNumber}]`);
  };

  const handleUpdateInvoiceStatus = (id: string, status: 'Pending' | 'Approved' | 'Paid') => {
    const updated = invoices.map(i => i.id === id ? { ...i, status } : i);
    saveInvoices(updated);
    triggerNotification('Trạng thái hóa đơn đã được cập nhật');
  };

  const handleDeleteInvoice = (id: string) => {
    const invoiceToDelete = invoices.find(i => i.id === id);
    const updated = invoices.filter(i => i.id !== id);
    saveInvoices(updated);
    if (invoiceToDelete) {
      triggerNotification(`Đã xóa hóa đơn lưu trữ [${invoiceToDelete.invoiceNumber}]`);
    }
  };

  // --- RBAC & Impersonation Operations ---
  const handleUpdateMemberRole = (memberId: string, systemRole: SystemRole) => {
    const updated = members.map(m => m.id === memberId ? { ...m, systemRole } : m);
    saveMembers(updated);
    
    // If the updated member is the currentUser, update currentUser as well!
    if (currentUser.id === memberId) {
      const updatedUser = { ...currentUser, systemRole };
      setCurrentUser(updatedUser);
      localStorage.setItem('mkt_current_user', JSON.stringify(updatedUser));
    }
    triggerNotification(`Đã chuyển chức vụ của thành viên thành: ${systemRole}`);
  };

  const handleUpdatePermissions = (role: SystemRole, updatedPerms: Partial<RolePermissions>) => {
    const updated = {
      ...rolePermissions,
      [role]: { ...rolePermissions[role], ...updatedPerms }
    };
    setRolePermissions(updated);
    localStorage.setItem('mkt_role_permissions', JSON.stringify(updated));
    triggerNotification(`Đã cập nhật chi tiết bảng quyền nhóm: ${role}`);
  };

  const handleImpersonateUser = (member: Member) => {
    setCurrentUser(member);
    localStorage.setItem('mkt_current_user', JSON.stringify(member));
    triggerNotification(`Đang nhập vai dùng thử: ${member.name} (${member.systemRole})`);
    setIsNotifDropdownOpen(false); // Close dropdown on user switch
  };

  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map(n => 
      n.memberId === currentUser.id ? { ...n, isRead: true } : n
    );
    saveNotifications(updated);
    triggerNotification('Đã đánh dấu tất cả thông báo là đã đọc');
  };

  const handleMarkNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    saveNotifications(updated);
  };

  const handleClearAllNotifications = () => {
    const updated = notifications.filter(n => n.memberId !== currentUser.id);
    saveNotifications(updated);
    triggerNotification('Đã xóa toàn bộ lịch sử thông báo');
  };

  const currentUserNotifications = notifications.filter(n => n.memberId === currentUser.id);
  const unreadCount = currentUserNotifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans" id="marketing_app_container">
      
      {/* Dynamic Floating Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-55 bg-indigo-950 text-white px-5 py-3 rounded-2xl border border-indigo-800 shadow-2xl text-xs font-semibold flex items-center gap-2.5 max-w-sm sm:max-w-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Top Executive Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo / Title brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-155">
                <BarChart3 className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-indigo-400 font-black text-[9px] uppercase tracking-widest block font-mono">Phòng vận hành</span>
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">MKT Portal</h1>
              </div>
            </div>

            {/* Middle Nav Links */}
            <nav className="hidden md:flex space-x-1 text-xs font-semibold text-slate-600">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                  activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Bảng điều khiển
              </button>
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                  activeTab === 'tasks' ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Layers className="w-4 h-4" /> Danh sách công việc
              </button>

              <button 
                onClick={() => setActiveTab('members')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                  activeTab === 'members' ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Users className="w-4 h-4" /> Hiệu suất thành viên
              </button>
              <button 
                onClick={() => setActiveTab('permissions')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                  activeTab === 'permissions' ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Phân quyền & Vai trò
              </button>
              <button 
                onClick={() => setActiveTab('links')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                  activeTab === 'links' ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'hover:bg-slate-50 text-slate-600'
                }`}
                id="tab_btn_links"
              >
                <Link2 className="w-4 h-4" /> Liên kết bộ phận
              </button>
            </nav>

            {/* Right Quick Header User Controls */}
            <div className="flex items-center gap-3">
              
              {/* Real-time System Time Stamp */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-650">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                <span>Hệ thống: <strong>{appTime.toLocaleString('vi-VN')}</strong></span>
              </div>

              {/* Notification bubble with interactive dropdown */}
              <div className="relative pointer-events-auto" id="notification_dropdown_wrapper">
                <button
                  onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                  className="p-2.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-100 transition cursor-pointer relative text-slate-600 shrink-0 block focus:outline-none"
                  aria-label="Notification Center"
                  id="notif_bell_button"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-[8px] px-1 animate-pulse select-none" id="notif_badge_count">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 py-1 overflow-hidden"
                      id="notif_dropdown_menu"
                    >
                      {/* Dropdown Header */}
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between select-none">
                        <div>
                          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Thông báo tài khoản</h3>
                          <p className="text-[10px] text-indigo-650 font-bold block pt-0.5" id="current_user_nav_notif_sub">
                            {currentUser.name} • {currentUser.division}
                          </p>
                        </div>
                        {currentUserNotifications.length > 0 && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAllNotificationsAsRead();
                              }}
                              className="text-[9px] font-extrabold text-indigo-600 hover:text-indigo-850 bg-white hover:bg-indigo-50 border border-slate-200/80 px-2 py-1 rounded-lg transition cursor-pointer"
                              title="Đọc tất cả"
                            >
                              Đọc hết
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearAllNotifications();
                              }}
                              className="text-[9px] font-extrabold text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200/80 px-2 py-1 rounded-lg transition cursor-pointer"
                              title="Xóa tất cả"
                            >
                              Dọn sạch
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Dropdown List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100" id="notif_dropdown_items">
                        {currentUserNotifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 select-none flex flex-col items-center justify-center gap-1.5 min-h-36">
                            <Bell className="w-8 h-8 text-slate-250 animate-bounce" />
                            <p className="text-xs font-bold text-slate-700">Tài khoản chưa có thông báo nào</p>
                            <p className="text-[10px] text-slate-400 leading-normal max-w-56">Mọi chỉ thị giao việc mới hoặc cập nhật công việc trong phòng [{currentUser.division}] sẽ cập nhật tức thì tại đây!</p>
                          </div>
                        ) : (
                          currentUserNotifications.map((notif) => {
                            const isUnread = !notif.isRead;
                            return (
                              <div
                                key={notif.id}
                                onClick={() => handleMarkNotificationAsRead(notif.id)}
                                className={`p-3.5 hover:bg-slate-50/80 transition duration-150 cursor-pointer text-left relative flex items-start gap-2.5 ${
                                  isUnread ? 'bg-indigo-50/20' : ''
                                }`}
                                id={`notif_item_${notif.id}`}
                              >
                                {isUnread && (
                                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5 shrink-0 block" />
                                )}
                                <div className="space-y-1 w-full overflow-hidden">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="text-[11px] font-black text-slate-850 leading-tight block truncate pr-1">
                                      {notif.title}
                                    </span>
                                    <span className="text-[9px] text-slate-400 shrink-0 font-bold block">
                                      {(() => {
                                        try {
                                          const d = new Date(notif.createdAt);
                                          if (isNaN(d.getTime())) return 'Gần đây';
                                          return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                        } catch {
                                          return 'Vừa xong';
                                        }
                                      })()}
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-550 leading-normal font-semibold break-words">
                                    {notif.message}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 pt-0.5 font-bold">
                                    <span className="px-1 py-0.2 bg-slate-100 rounded border border-slate-200 text-[8px] uppercase tracking-wider font-extrabold text-[8px]">
                                      Hệ thống
                                    </span>
                                    {notif.senderName && (
                                      <span>bởi {notif.senderName}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Dropdown Footer */}
                      <div className="px-3 py-2 bg-slate-50 text-center text-[10px] text-slate-400 select-none font-bold border-t border-slate-150">
                        {unreadCount > 0 
                          ? `Có ${unreadCount} thông báo chưa đọc trong tài khoản của bạn`
                          : 'Bạn đã đọc toàn bộ thông báo!'
                        }
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Logged in dynamic user avatar preview (RBAC selection sync) */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-indigo-200 shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden lg:block text-left">
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase font-mono tracking-wider block ${
                    currentUser.systemRole === 'Admin' ? 'bg-indigo-950 text-white' : currentUser.systemRole === 'Manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-105 text-slate-600 bg-slate-100'
                  }`}>
                    {currentUser.systemRole}
                  </span>
                  <span className="text-xs font-bold text-slate-705 block max-w-28 truncate" title={currentUser.name}>
                    {currentUser.name}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Secondary Mobile navigation helper - always accessible */}
      <div className="md:hidden sticky top-16 z-30 bg-white border-b border-indigo-50 p-2 overflow-x-auto whitespace-nowrap scrolling-touch scrollbar-hide text-[11px] font-semibold flex gap-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 bg-slate-50'
          }`}
        >
          📊 Tổng quan
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'tasks' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 bg-slate-50'
          }`}
        >
          📋 Công việc ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'members' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 bg-slate-50'
          }`}
        >
          👥 Vị trí & Nhân sự ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'permissions' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 bg-slate-50'
          }`}
        >
          🛡️ Phân quyền
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`px-3.5 py-2 rounded-xl transition-all ${
            activeTab === 'links' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 bg-slate-50'
          }`}
          id="mobile_tab_btn_links"
        >
          🔗 Liên kết
        </button>
      </div>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Animated Slide In switching view controller */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                tasks={tasks} 
                members={members} 
                invoices={invoices} 
                currentUser={currentUser}
                permissions={activePermissions}
                divisions={divisions}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeTab === 'tasks' && (
              <TaskManager 
                tasks={tasks} 
                members={members} 
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                currentUser={currentUser}
                permissions={activePermissions}
                divisions={divisions}
              />
            )}



            {activeTab === 'members' && (
              <TeamPerformance 
                members={members}
                tasks={tasks}
                onAddMember={handleAddMember}
                currentUser={currentUser}
                permissions={activePermissions}
                onUpdateMemberRole={handleUpdateMemberRole}
                divisions={divisions}
                onAddDivision={handleAddDivision}
                onUpdateMember={handleUpdateMember}
                onDeleteMember={handleDeleteMember}
              />
            )}

            {activeTab === 'permissions' && (
              <PermissionsManager 
                members={members}
                currentUser={currentUser}
                permissions={rolePermissions}
                onUpdateMemberRole={handleUpdateMemberRole}
                onUpdatePermissions={handleUpdatePermissions}
                onImpersonateUser={handleImpersonateUser}
              />
            )}

            {activeTab === 'links' && (
              <InternalAdminLinks 
                divisions={divisions}
                members={members}
                currentUser={currentUser}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* High craft beautiful minimal footer */}
      <footer className="bg-white border-t border-slate-150 py-12 mt-20 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <p className="font-bold text-slate-700 flex items-center gap-1 justify-center sm:justify-start">
              <span>Hệ thống Quản lý Vận hành Marketing</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            </p>
            <p>Hệ thống hỗ trợ duyệt VAT, phân tách KPIs tự động và quản trị tiến độ chiến dịch an toàn.</p>
          </div>
          <div className="text-slate-400">
            © 2026 MKT Portal • Thiết kế chuẩn tối ưu dữ liệu phẳng
          </div>
        </div>
      </footer>

    </div>
  );
}
