import React, { useState, useMemo, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Copy, 
  Check, 
  FileJson, 
  GitBranch, 
  Github, 
  Upload, 
  Play, 
  Sparkles, 
  Trash2, 
  Info,
  Layers,
  Users,
  Receipt,
  Link2
} from 'lucide-react';
import { Member, Task, Invoice, AppNotification } from '../types';
import { DepartmentLink } from './InternalAdminLinks';

interface DataStandardizerProps {
  members: Member[];
  tasks: Task[];
  invoices: Invoice[];
  divisions: string[];
  currentUser: Member;
  onUpdateMembers: (updated: Member[]) => void;
  onUpdateTasks: (updated: Task[]) => void;
  onUpdateInvoices: (updated: Invoice[]) => void;
  onUpdateDivisions: (updated: string[]) => void;
  triggerNotification: (msg: string) => void;
}

export default function DataStandardizer({
  members,
  tasks,
  invoices,
  divisions,
  currentUser,
  onUpdateMembers,
  onUpdateTasks,
  onUpdateInvoices,
  onUpdateDivisions,
  triggerNotification
}: DataStandardizerProps) {
  
  const [activeTab, setActiveTab] = useState<'status' | 'export' | 'import'>('status');
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Load additional links from Local Storage
  const departmentLinks = useMemo(() => {
    const saved = localStorage.getItem('mkt_department_links');
    if (saved) {
      try {
        return JSON.parse(saved) as DepartmentLink[];
      } catch (e) {
        console.error("Failed to parse department links in standardizer", e);
      }
    }
    return [];
  }, [members]); // Refresh if members update

  // Diagnose database anomalies
  const diagnostics = useMemo(() => {
    const issues: {
      id: string;
      category: 'Member' | 'Task' | 'Invoice' | 'Division' | 'General';
      severity: 'Low' | 'Medium' | 'High';
      description: string;
      canAutoFix: boolean;
      autoFixId: string;
    }[] = [];

    // 1. Task Diagnostics
    tasks.forEach(task => {
      // Orphaned assignment check
      const assigneeExists = members.some(m => m.id === task.assigneeId);
      if (!assigneeExists) {
        issues.push({
          id: `task-assignee-${task.id}`,
          category: 'Task',
          severity: 'High',
          description: `Công việc "${task.title}" đang gán cho nhân sự không tồn tại (ID: ${task.assigneeId}).`,
          canAutoFix: true,
          autoFixId: `assignee-${task.id}`
        });
      }

      // Division alignment check
      if (task.division && !divisions.includes(task.division)) {
        issues.push({
          id: `task-div-${task.id}`,
          category: 'Division',
          severity: 'Medium',
          description: `Công việc "${task.title}" thuộc bộ phận "${task.division}" hiện không nằm trong danh sách phân ban chung.`,
          canAutoFix: true,
          autoFixId: `division-missing-${task.division}`
        });
      }

      // Completed but progress is not 100%
      if (task.status === 'Completed' && task.progress !== 100) {
        issues.push({
          id: `task-progress-completed-${task.id}`,
          category: 'Task',
          severity: 'Low',
          description: `Công việc "${task.title}" đã hoàn thành nhưng tiến độ hiện ghi nhận ${task.progress}%.`,
          canAutoFix: true,
          autoFixId: `completed-progress-${task.id}`
        });
      }

      // InProgress/Todo but progress is 100%
      if (task.status !== 'Completed' && task.progress === 100) {
        issues.push({
          id: `task-progress-mismatch-${task.id}`,
          category: 'Task',
          severity: 'Low',
          description: `Công việc "${task.title}" chưa hoàn thành (Trạng thái: ${task.status}) nhưng tiến độ ghi nhận là 100%.`,
          canAutoFix: true,
          autoFixId: `incomplete-progress-${task.id}`
        });
      }

      // Progress range boundaries
      if (task.progress < 0 || task.progress > 100) {
        issues.push({
          id: `task-progress-range-${task.id}`,
          category: 'Task',
          severity: 'Medium',
          description: `Công việc "${task.title}" có giá trị tiến độ ngoài phạm vi (${task.progress}%).`,
          canAutoFix: true,
          autoFixId: `correct-range-${task.id}`
        });
      }
    });

    // 2. Invoice Diagnostics
    invoices.forEach(inv => {
      // Arithmetic check
      const expectedTotal = Math.round(inv.preTaxAmount * (1 + (inv.vatPercent || 10) / 100));
      if (Math.abs(expectedTotal - inv.totalAmount) > 10) {
        issues.push({
          id: `inv-calc-${inv.id}`,
          category: 'Invoice',
          severity: 'Low',
          description: `Hóa đơn "${inv.invoiceNumber}" có sai lệch số học: Trước thuế ${inv.preTaxAmount.toLocaleString('vi-VN')} VNĐ + VAT ${inv.vatPercent}% tương ứng ${expectedTotal.toLocaleString('vi-VN')} VNĐ nhưng tổng lưu là ${inv.totalAmount.toLocaleString('vi-VN')} VNĐ.`,
          canAutoFix: true,
          autoFixId: `invoice-math-${inv.id}`
        });
      }
    });

    // 3. Member Diagnostics
    members.forEach(member => {
      // Division exists
      if (member.division && !divisions.includes(member.division)) {
        issues.push({
          id: `member-div-${member.id}`,
          category: 'Division',
          severity: 'Medium',
          description: `Thành viên "${member.name}" có bộ phận "${member.division}" không thuộc danh mục phòng ban của hệ thống.`,
          canAutoFix: true,
          autoFixId: `division-missing-${member.division}`
        });
      }
    });

    return issues;
  }, [members, tasks, invoices, divisions]);

  // Aggregate standard data package
  const standardizedData = useMemo(() => {
    return {
      version: "1.2.0-github-sync",
      synchronizedAt: new Date().toISOString(),
      synchronizedBy: currentUser.name,
      divisions,
      members: members.map(m => ({
        id: m.id,
        name: m.name.trim(),
        role: m.role.trim(),
        systemRole: m.systemRole,
        email: m.email.trim().toLowerCase(),
        password: m.password || "123",
        division: m.division || "",
        avatar: m.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        efficiencyScore: m.efficiencyScore || 80,
        joinedDate: m.joinedDate || new Date().toISOString().split('T')[0]
      })),
      tasks: tasks.map(t => {
        // Enforce basic constraints on map
        let finalProgress = Number(t.progress) || 0;
        if (t.status === 'Completed') finalProgress = 100;
        if (finalProgress > 100) finalProgress = 100;
        if (finalProgress < 0) finalProgress = 0;

        return {
          id: t.id,
          title: t.title.trim(),
          description: t.description.trim(),
          division: t.division || "",
          assigneeId: t.assigneeId,
          priority: t.priority,
          status: t.status,
          stage: t.stage,
          progress: finalProgress,
          deadline: t.deadline,
          attachments: t.attachments || [],
          createdAt: t.createdAt || new Date().toISOString().split('T')[0],
          completedAt: t.completedAt,
          createdBy: t.createdBy || 'm1'
        };
      }),
      invoices: invoices.map(i => {
        const expectedTotal = Math.round(i.preTaxAmount * (1 + (i.vatPercent || 10) / 100));
        return {
          id: i.id,
          invoiceNumber: i.invoiceNumber.trim(),
          supplier: i.supplier.trim(),
          description: i.description.trim(),
          category: i.category,
          preTaxAmount: i.preTaxAmount,
          vatPercent: i.vatPercent,
          totalAmount: expectedTotal, // auto-standardized math!
          date: i.date,
          status: i.status,
          hasAttachment: i.hasAttachment,
          attachmentName: i.attachmentName
        };
      }),
      departmentLinks
    };
  }, [members, tasks, invoices, divisions, departmentLinks, currentUser]);

  // JSON representations
  const standardizedJsonString = useMemo(() => {
    return JSON.stringify(standardizedData, null, 2);
  }, [standardizedData]);

  // Export File trigger
  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(standardizedJsonString);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mkt_portal_standard_sync_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerNotification("Đã tải xuống tệp sao lưu chuẩn hóa dữ liệu thành công!");
  };

  // Copy-to-Clipboard action
  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(standardizedJsonString).then(() => {
      setCopied(true);
      triggerNotification("Đã sao chép cấu trúc JSON chuẩn hóa vào bộ nhớ đệm!");
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error("Trình duyệt không cho phép sao chép tự động: ", err);
    });
  };

  // Single entity repair action
  const handleAutoFixSingle = (autoFixId: string) => {
    if (autoFixId.startsWith('assignee-')) {
      const taskId = autoFixId.replace('assignee-', '');
      const adminId = members[0]?.id || 'm1';
      const updated = tasks.map(t => t.id === taskId ? { ...t, assigneeId: adminId } : t);
      onUpdateTasks(updated);
      triggerNotification("Đã gán lại công việc mồ côi cho Trưởng phòng Admin.");
    } else if (autoFixId.startsWith('division-missing-')) {
      const missingDivision = autoFixId.replace('division-missing-', '');
      if (missingDivision && !divisions.includes(missingDivision)) {
        onUpdateDivisions([...divisions, missingDivision]);
        triggerNotification(`Đã tự động bổ sung phân ban "${missingDivision}" vào hệ thống.`);
      }
    } else if (autoFixId.startsWith('completed-progress-')) {
      const taskId = autoFixId.replace('completed-progress-', '');
      const updated = tasks.map(t => t.id === taskId ? { ...t, progress: 100 } : t);
      onUpdateTasks(updated);
      triggerNotification("Đã chuẩn hóa tiến độ về 100% cho công việc hoàn thành.");
    } else if (autoFixId.startsWith('incomplete-progress-')) {
      const taskId = autoFixId.replace('incomplete-progress-', '');
      const updated = tasks.map(t => t.id === taskId ? { ...t, progress: 90 } : t);
      onUpdateTasks(updated);
      triggerNotification("Đã chuẩn hóa tiến độ chưa hoàn thành về mức 90%.");
    } else if (autoFixId.startsWith('correct-range-')) {
      const taskId = autoFixId.replace('correct-range-', '');
      const updated = tasks.map(t => {
        if (t.id === taskId) {
          const val = t.progress > 100 ? 100 : (t.progress < 0 ? 0 : t.progress);
          return { ...t, progress: val };
        }
        return t;
      });
      onUpdateTasks(updated);
      triggerNotification("Đã sửa phạm vi tiến độ hợp lệ (0% - 100%).");
    } else if (autoFixId.startsWith('invoice-math-')) {
      const invId = autoFixId.replace('invoice-math-', '');
      const updated = invoices.map(i => {
        if (i.id === invId) {
          const correctVal = Math.round(i.preTaxAmount * (1 + (i.vatPercent || 10) / 100));
          return { ...i, totalAmount: correctVal };
        }
        return i;
      });
      onUpdateInvoices(updated);
      triggerNotification("Đã tính toán lại giá trị thanh toán thực tế của hóa đơn.");
    }
  };

  // Perform full database sweep and automatic fix of all repairables
  const handleAutoFixAll = () => {
    let fixedTasksCount = 0;
    let fixedInvoicesCount = 0;
    let addedDivisions: string[] = [...divisions];

    const updatedTasks = tasks.map(t => {
      let isMutated = false;
      let freshTask = { ...t };

      // Fix assignee
      const assigneeExists = members.some(m => m.id === t.assigneeId);
      if (!assigneeExists) {
        freshTask.assigneeId = members[0]?.id || 'm1';
        isMutated = true;
      }

      // Add missing divisions to registry
      if (t.division && !addedDivisions.includes(t.division)) {
        addedDivisions.push(t.division);
      }

      // Fix completed status
      if (t.status === 'Completed' && t.progress !== 100) {
        freshTask.progress = 100;
        isMutated = true;
      }

      // Fix incomplete status
      if (t.status !== 'Completed' && t.progress === 100) {
        freshTask.progress = 95;
        isMutated = true;
      }

      // Fix progress boundaries
      if (t.progress < 0) {
        freshTask.progress = 0;
        isMutated = true;
      } else if (t.progress > 100) {
        freshTask.progress = 100;
        isMutated = true;
      }

      if (isMutated) fixedTasksCount++;
      return freshTask;
    });

    const updatedInvoices = invoices.map(i => {
      const correctTotal = Math.round(i.preTaxAmount * (1 + (i.vatPercent || 10) / 100));
      if (correctTotal !== i.totalAmount) {
        fixedInvoicesCount++;
        return { ...i, totalAmount: correctTotal };
      }
      return i;
    });

    // Check members for missing divisions
    members.forEach(m => {
      if (m.division && !addedDivisions.includes(m.division)) {
        addedDivisions.push(m.division);
      }
    });

    if (addedDivisions.length > divisions.length) {
      onUpdateDivisions(addedDivisions);
    }
    onUpdateTasks(updatedTasks);
    onUpdateInvoices(updatedInvoices);

    triggerNotification(`Đồng bộ thành công! Đã sửa ${fixedTasksCount} công việc, ${fixedInvoicesCount} hóa đơn chi phí.`);
  };

  // Handle manual JSON importing to override systems
  const handleImportJson = (e: React.FormEvent) => {
    e.preventDefault();
    setImportFeedback(null);
    if (!jsonInput.trim()) return;

    try {
      const parsed = JSON.parse(jsonInput.trim());
      
      // Validate schema minimally
      if (!parsed.members || !Array.isArray(parsed.members)) {
        throw new Error("Dữ liệu nhập vào thiếu danh sách 'members' hợp lệ.");
      }
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error("Dữ liệu nhập vào thiếu danh sách 'tasks' hợp lệ.");
      }
      if (!parsed.invoices || !Array.isArray(parsed.invoices)) {
        throw new Error("Dữ liệu nhập vào thiếu danh sách 'invoices' hợp lệ.");
      }
      if (!parsed.divisions || !Array.isArray(parsed.divisions)) {
        throw new Error("Dữ liệu nhập vào thiếu danh sách phân ban 'divisions' hợp lệ.");
      }

      // Format and ingest
      onUpdateMembers(parsed.members);
      onUpdateTasks(parsed.tasks);
      onUpdateInvoices(parsed.invoices);
      onUpdateDivisions(parsed.divisions);

      // Save additional items if present
      if (parsed.departmentLinks && Array.isArray(parsed.departmentLinks)) {
        localStorage.setItem('mkt_department_links', JSON.stringify(parsed.departmentLinks));
      }

      // Force save notifications if any
      if (parsed.notifications && Array.isArray(parsed.notifications)) {
        localStorage.setItem('mkt_notifications', JSON.stringify(parsed.notifications));
      }

      // Alert & Reset
      setImportFeedback({
        success: true,
        message: `Đồng bộ thành công! Đã khôi phục và chuẩn hóa hoàn tất: ${parsed.members.length} thành viên, ${parsed.tasks.length} công việc và ${parsed.invoices.length} hóa đơn ngân sách.`
      });
      triggerNotification("Nhập cấu trúc sao lưu dữ liệu thành công!");
      setJsonInput('');
    } catch (err: any) {
      const errMsg = err && err.message ? err.message : "Cú pháp JSON không hợp lệ. Vui lòng kiểm tra dấu đóng ngoặc hoặc định dạng chính.";
      setImportFeedback({
        success: false,
        message: `Thất bại: ${errMsg}`
      });
    }
  };

  return (
    <div className="space-y-6" id="github_data_sync_panel">
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-indigo-200">
            <GitBranch className="w-3.5 h-3.5 text-indigo-300" />
            <span>GitHub Manual Data Publishing Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Chuẩn Hóa & Xuất Bản GitHub Thủ Công</h2>
          <p className="text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
            Chức năng dọn dẹp hệ thống dữ liệu, dọn rác, loại bỏ các chỉ số mồ côi và xuất hoặc nhập cấu trúc JSON đã được định hình chuẩn chỉ để dán vào file <strong>mockData.ts</strong> hoặc xuất bản kho dữ liệu lên GitHub của bạn một cách thủ công.
          </p>
        </div>

        <button 
          onClick={handleAutoFixAll}
          disabled={diagnostics.length === 0}
          className={`relative z-10 self-start md:self-auto font-extrabold text-xs px-5 py-3 rounded-2xl transition shadow-lg flex items-center gap-2 border cursor-pointer border-indigo-400/20 active:translate-y-px ${
            diagnostics.length > 0 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-950/20' 
              : 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed opacity-60 shadow-none'
          }`}
          id="btn_auto_standardize_all"
        >
          <RefreshCw className={`w-4 h-4 ${diagnostics.length > 0 ? 'animate-spin' : ''}`} />
          <span>Sửa lỗi & Chuẩn hóa hàng loạt ({diagnostics.length})</span>
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-3xs flex gap-1 select-none">
        <button
          onClick={() => setActiveTab('status')}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'status'
              ? 'bg-indigo-600 text-white shadow-indigo-500/10'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Trạng thái & Chuẩn đoán {diagnostics.length > 0 && <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-indigo-200 text-indigo-900 rounded-full font-black">{diagnostics.length}</span>}</span>
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'export'
              ? 'bg-indigo-600 text-white shadow-indigo-500/10'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileJson className="w-4 h-4" />
          <span>Xác thực & Xuất Bản GitHub (JSON)</span>
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'import'
              ? 'bg-indigo-600 text-white shadow-indigo-500/10'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Nhập dữ liệu / Khôi phục</span>
        </button>
      </div>

      {/* Dynamic Tab Body */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          
          {/* Diagnostic results column */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Tính vẹn toàn của dữ liệu</h3>
                <p className="text-xs text-slate-500">Kết quả rà soát từ các phiên lưu trữ Local Storage hiện tại</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                diagnostics.length === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {diagnostics.length === 0 ? '✓ Đạt chuẩn 100%' : `Phát hiện ${diagnostics.length} cảnh báo`}
              </span>
            </div>

            {diagnostics.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">Cấu trúc dữ liệu đạt mức tối ưu nhất!</h4>
                  <p className="text-xs text-slate-500 max-w-md">
                    Không tồn tại phần tử rác, sai biệt giá trị kế hoạch hay sai số thanh toán. Mọi dữ liệu đã sẵn sàng đóng gói và đẩy lên kho GitHub của phòng Marketing.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {diagnostics.map((issue) => (
                  <div 
                    key={issue.id}
                    className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-start justify-between gap-4 transition duration-150 hover:bg-slate-100/60"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        issue.severity === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        issue.severity === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Loại: {issue.category === 'Task' ? 'Việc làm / Kế hoạch' :
                                   issue.category === 'Invoice' ? 'Duyệt phí / VAT' :
                                   issue.category === 'Division' ? 'Phòng ban vận hành' : 'Tổng bộ'}
                          </span>
                          <span className={`text-[9px] font-extrabold px-1.5 rounded uppercase ${
                            issue.severity === 'High' ? 'bg-rose-100 text-rose-800' :
                            issue.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            Mức {issue.severity === 'High' ? 'Cao' : issue.severity === 'Medium' ? 'Vừa' : 'Thấp'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed text-left">
                          {issue.description}
                        </p>
                      </div>
                    </div>

                    {issue.canAutoFix && (
                      <button
                        onClick={() => handleAutoFixSingle(issue.autoFixId)}
                        className="px-2.5 py-1.5 border border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 text-[10px] font-black rounded-lg transition shrink-0 cursor-pointer shadow-3xs hover:border-indigo-300"
                      >
                        Sửa nhanh
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Database stats column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Database Volumes summary info card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-50">Quy mô tài nguyên hệ thống</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-700">Tổng nhân sự</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{members.length} tài khoản</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-700">Công việc & Kế hoạch</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{tasks.length} hạng mục</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-700">Tổng chi phí thanh toán</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{invoices.length} hóa đơn</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Link2 className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-slate-700">Liên kết tài nguyên</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{departmentLinks.length} cổng chính</span>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/40 border border-indigo-100/55 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-900 text-xs font-extrabold">
                  <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Cần biết trước khi đồng bộ?</span>
                </div>
                <p className="text-[10px] text-slate-650 leading-relaxed font-semibold">
                  Môi trường thử nghiệm AI Studio lưu trữ thay đổi cục bộ qua Local Storage trên trình duyệt của bạn. Chuẩn hóa dữ liệu giúp đảm bảo khi thay đổi hoặc tải mã nguồn lên Github, người dùng tiếp theo sẽ nhận được bộ cơ sở dữ liệu mẫu chuẩn sọc, không lỗi.
                </p>
              </div>
            </div>

            {/* Git configuration guide panel */}
            <div className="p-5 bg-indigo-950 text-white rounded-2xl border border-indigo-900 space-y-3.5">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-indigo-300" />
                <h4 className="text-xs sm:text-sm font-black">Khuyến nghị đồng bộ Git</h4>
              </div>

              <ol className="text-[11px] text-indigo-200/90 leading-relaxed font-bold list-decimal pl-4.5 space-y-1.5">
                <li>Vào tab <strong>"Xác thực & Xuất Bản"</strong> ngay bên trên.</li>
                <li>Hệ thống tự chuẩn hóa tất cả định dạng dữ liệu & cấu trúc quan hệ.</li>
                <li>Nhấn nút <strong>"Sao chép cấu trúc JSON"</strong>.</li>
                <li>Thay thế nội dung file <code>src/data/mockData.ts</code> của bạn để lưu vĩnh viễn cơ sở dữ liệu mới.</li>
                <li>Commit, Push lên Github dự án của bạn!</li>
              </ol>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">Chi tiết cấu trúc JSON đã Chuẩn hóa</h3>
              <p className="text-xs text-slate-500">Mã nguồn sẵn sàng để dán vào mockData.ts hoặc lưu trữ dự phòng (.json)</p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleCopyClipboard}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép JSON'}</span>
              </button>

              <button
                onClick={handleDownloadBackup}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tệp (.json)</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute top-2 right-3 text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded shadow-sm">
                JSON DB FORMAT
              </div>
              <textarea
                readOnly
                rows={12}
                value={standardizedJsonString}
                className="w-full font-mono text-[10px] p-4.5 bg-indigo-950 text-indigo-100 rounded-2xl border border-indigo-900 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Developer Github Push Quick snippet */}
            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                <Github className="w-4 h-4 text-slate-700" />
                <span>Tiện ích dòng lệnh Git Commit mẫu cho Marketing Lead</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Bạn có thể copy đoạn lệnh sau để thực thi đẩy mã nguồn kèm dữ liệu chuẩn hóa lên Github nhanh chóng sau khi thay thế nội dung file <code>src/data/mockData.ts</code>:
              </p>
              <div className="p-3 bg-zinc-950 text-slate-200 rounded-xl font-mono text-[10.5px] relative leading-relaxed">
                <code className="block select-all">
                  git checkout -b chore/standardize-database-sync<br />
                  git add src/data/mockData.ts<br />
                  git commit -m "chore(sync): standardize mkt database nodes and align roles v1.2"<br />
                  git push origin chore/standardize-database-sync
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-5 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-black text-slate-900">Tính năng đồng bộ ngược / Khôi phục sao lưu</h3>
            <p className="text-xs text-slate-500">Dán tệp JSON cơ sở dữ liệu đã chuẩn hóa của bạn tại đây để ghi đè toàn bộ hệ thống ngay lập tức.</p>
          </div>

          <form onSubmit={handleImportJson} className="space-y-4">
            <textarea
              required
              rows={8}
              placeholder='Nhập chuỗi JSON dữ liệu đầy đủ hoặc tệp backup cấu trúc: 
{
  "divisions": [...],
  "members": [...],
  "tasks": [...],
  "invoices": [...]
}'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full font-mono text-[10.5px] p-4 bg-slate-50 border border-slate-250 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 rounded-2xl placeholder-slate-400 leading-relaxed shadow-3xs"
            />

            {importFeedback && (
              <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs font-semibold leading-relaxed ${
                importFeedback.success 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-150' 
                  : 'bg-rose-50 text-rose-800 border-rose-150'
              }`}>
                {importFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{importFeedback.message}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setJsonInput('');
                  setImportFeedback(null);
                }}
                className="px-4 py-2.5 hover:bg-slate-100 transition text-slate-705 text-xs font-bold rounded-xl cursor-pointer"
              >
                Xóa văn bản
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm active:translate-y-px flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Nhập & Đồng bộ ngay</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
