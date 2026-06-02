import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  DollarSign, 
  Trash2, 
  Filter, 
  Check, 
  Paperclip, 
  AlertCircle,
  TrendingDown,
  X,
  CreditCard,
  FileCheck2,
  Receipt,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { Invoice, Member, RolePermissions } from '../types';

interface BillingTrackerProps {
  invoices: Invoice[];
  onAddInvoice: (invoice: Omit<Invoice, 'id' | 'totalAmount'>) => void;
  onUpdateInvoiceStatus: (id: string, status: 'Pending' | 'Approved' | 'Paid') => void;
  onDeleteInvoice: (id: string) => void;
  currentUser: Member;
  permissions: RolePermissions;
}

export default function BillingTracker({ 
  invoices, 
  onAddInvoice, 
  onUpdateInvoiceStatus, 
  onDeleteInvoice,
  currentUser,
  permissions: passedPermissions
}: BillingTrackerProps) {
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Form states
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Invoice['category']>('Ads Budget');
  const [preTaxAmount, setPreTaxAmount] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(10);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');

  if (!permissions.billing_view) {
    return (
      <div className="bg-white rounded-2xl border border-slate-105 p-12 text-center max-w-lg mx-auto shadow-sm my-12" id="billing_restricted">
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-6">
          <Lock className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Quyền Truy Cập Bị Hạn Chế</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Vai trò hiện tại của bạn là <strong>{currentUser.systemRole}</strong>. Tài khoản này không được cấu hình quyền <code>billing_view</code> để truy cập và theo dõi sổ hóa đơn thuế VAT phòng ban.
        </p>
        <div className="mt-8 p-3.5 rounded-xl bg-indigo-50 border border-indigo-10/10 text-xs text-indigo-700 font-semibold">
          Vui lòng liên hệ Trưởng phòng ban (Admin) để thăng chức tài khoản của bạn hoặc gửi yêu cầu phê duyệt cấp quyền hóa đơn bổ sung.
        </div>
      </div>
    );
  }

  const stats = useMemo(() => {
    const totalCount = invoices.length;
    const paidCount = invoices.filter(i => i.status === 'Paid').length;
    const pendingCount = invoices.filter(i => i.status === 'Pending').length;
    
    const preTaxSum = invoices.reduce((sum, i) => sum + i.preTaxAmount, 0);
    const totalSum = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const vatSum = totalSum - preTaxSum;

    return {
      totalCount,
      paidCount,
      pendingCount,
      preTaxSum,
      vatSum,
      totalSum
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (filterCategory === 'All') return invoices;
    return invoices.filter(i => i.category === filterCategory);
  }, [invoices, filterCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.billing_create) {
      console.warn("Thao tác bị từ chối: Bạn không có quyền khai báo hóa đơn.");
      return;
    }
    if (!supplier || !description || !invoiceNumber || preTaxAmount <= 0) return;

    onAddInvoice({
      invoiceNumber,
      supplier,
      description,
      category,
      preTaxAmount: Number(preTaxAmount),
      vatPercent: Number(vatPercent),
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      hasAttachment,
      attachmentName: hasAttachment ? (attachmentName || 'HD_DinhKem_TuDong.pdf') : undefined
    });

    // Reset Form
    setSupplier('');
    setDescription('');
    setCategory('Ads Budget');
    setPreTaxAmount(0);
    setVatPercent(10);
    setInvoiceNumber('');
    setHasAttachment(false);
    setAttachmentName('');
    setIsAddOpen(false);
  };

  const currentComputedTotal = useMemo(() => {
    return preTaxAmount * (1 + vatPercent / 100);
  }, [preTaxAmount, vatPercent]);

  return (
    <div className="space-y-8" id="billing_view">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Gộp dự toán quyết toán</span>
          <p className="text-3xl font-black mt-3">
            {stats.totalSum.toLocaleString('vi-VN')} VNĐ
          </p>
          <div className="flex justify-between items-center text-xs text-slate-400 mt-4 border-t border-slate-800 pt-3">
            <span>Tiền trước thuế:</span>
            <span className="font-semibold text-white">{stats.preTaxSum.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Quỹ thuế VAT tích lũy</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-2">
                +{stats.vatSum.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 border-t border-slate-100 pt-3">
            Thuế suất 8% và 10% tùy thuộc hạ tầng thanh toán dịch vụ.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Yêu cầu thanh toán</span>
              <p className="text-2xl font-extrabold text-slate-800 mt-2">
                {stats.pendingCount} Chờ duyệt / {stats.paidCount} Đã quyết toán
              </p>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 border-t border-slate-100 pt-3">
            Số hóa đơn đã lưu trữ: {stats.totalCount} bản ghi
          </p>
        </div>
      </div>
      
      {/* Visual Role & Permissions Status Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="billing_rbac_status_panel">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-750 text-indigo-600 rounded-2xl border border-indigo-50 hidden sm:block">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Hệ thống phân quyền (RBAC)</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                currentUser.systemRole === 'Admin' 
                  ? 'bg-indigo-950 text-white shadow-xs' 
                  : currentUser.systemRole === 'Manager'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-150 text-slate-750'
              }`}>
                Vai trò: {currentUser.systemRole === 'Admin' ? 'Quản trị viên (Admin)' : currentUser.systemRole === 'Manager' ? 'Quản lý (Manager)' : 'Thành viên (Member)'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">Cấu hình chi tiết quyền hạn sổ chi phí</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các tính năng thanh toán, duyệt quyết toán và xóa hóa đơn được mở khóa trực tiếp dựa trên vai trò phân quyền thực tế.
            </p>
          </div>
        </div>

        {/* Individual Billing Actions Status Lights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:max-w-xl w-full">
          {[
            { label: '1. Xem hóa đơn', systemKey: 'billing_view', desc: 'Có thể xem danh sách' },
            { label: '2. Kê khai mới', systemKey: 'billing_create', desc: 'Thêm chứng từ VAT' },
            { label: '3. Phê duyệt trạng thái', systemKey: 'billing_status_update', desc: 'Duyệt & quyết toán' },
            { label: '4. Xóa hóa đơn', systemKey: 'billing_delete', desc: 'Gỡ bỏ bản ghi' }
          ].map((action) => {
            const isAllowed = permissions[action.systemKey as keyof RolePermissions];
            return (
              <div 
                key={action.systemKey}
                className={`p-2.5 rounded-xl border flex flex-col justify-between transition duration-150 ${
                  isAllowed 
                    ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950' 
                    : 'bg-slate-50/70 border-slate-100 text-slate-405 text-slate-400 opacity-80'
                }`}
                title={`Quyền ${action.label}: ${isAllowed ? 'Đang kích hoạt' : 'Hạn chế quyền'}`}
              >
                <div className="flex items-center justify-between gap-1.5 w-full">
                  <span className="text-[10px] font-extrabold uppercase tracking-tight truncate">{action.label}</span>
                  {isAllowed ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-250 animate-ping"></span>
                  ) : (
                    <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  )}
                </div>
                <div className="text-[10.5px] text-[10px] font-medium text-slate-500 mt-1 truncate">
                  {action.desc}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[9px] font-black uppercase tracking-wider ${isAllowed ? 'text-emerald-750 text-emerald-750' : 'text-slate-400'}`}>
                    {isAllowed ? 'Cho phép' : 'Chặn'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Billing Table List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Sổ Chi Phí & Kê Khai Hóa Đơn Thuế VAT
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hóa đơn phát sinh từ chạy Ads quảng cáo, PR báo chí, in ấn truyền thông, mua bản quyền ứng dụng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs font-medium">
              <span className="px-2.5 text-slate-400"><Filter className="w-3.5 h-3.5" /></span>
              {['All', 'Ads Budget', 'Production Fee', 'PR Service', 'Software Licensing', 'Other'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterCategory === cat 
                      ? 'bg-white text-indigo-600 shadow-xs ring-1 ring-slate-100 font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'All' ? 'Tất cả' : cat === 'Ads Budget' ? 'Quảng cáo' : cat === 'Production Fee' ? 'Sản xuất' : cat === 'PR Service' ? 'PR' : cat === 'Software Licensing' ? 'Phần mềm' : 'Khác'}
                </button>
              ))}
            </div>

            {permissions.billing_create ? (
              <button
                onClick={() => setIsAddOpen(true)}
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                Khai hóa đơn mới
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed opacity-70"
                title="Tài khoản của bạn không có quyền lập hóa đơn"
              >
                <Lock className="w-3.5 h-3.5" />
                Khai hóa đơn mới
              </button>
            )}
          </div>
        </div>

        {/* Custom invoices list table */}
        <div className="overflow-x-auto">
          {filteredInvoices.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-6">Mã & Ngày</th>
                  <th className="py-4 px-6">Nhà Cung Cấp / Hàng Hóa</th>
                  <th className="py-4 px-6">Phần Loại Chi Phí</th>
                  <th className="py-4 px-6 text-right">Chi Phí Trước Thuế (VND)</th>
                  <th className="py-4 px-6 text-center">Thuế VAT</th>
                  <th className="py-4 px-6 text-right">Tổng Thanh Toán (VND)</th>
                  <th className="py-4 px-6 text-center">Trạng Thái</th>
                  <th className="py-4 px-6 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                {filteredInvoices.map((inv) => {
                  let badgeColor = 'bg-slate-100 text-slate-700';
                  let badgeText = 'Chờ duyệt';
                  if (inv.status === 'Paid') {
                    badgeColor = 'bg-emerald-100 text-emerald-800';
                    badgeText = 'Đã thanh toán';
                  } else if (inv.status === 'Approved') {
                    badgeColor = 'bg-blue-100 text-blue-800';
                    badgeText = 'Đã duyệt';
                  }

                  let typeText = 'Chi phí khác';
                  switch(inv.category) {
                    case 'Ads Budget': typeText = 'Ngân sách Ads'; break;
                    case 'Production Fee': typeText = 'Chi phí sản xuất'; break;
                    case 'PR Service': typeText = 'Truyền thông & PR'; break;
                    case 'Software Licensing': typeText = 'Bản quyền công cụ'; break;
                  }

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 space-y-0.5">
                        <span className="font-mono font-bold text-slate-900 block">{inv.invoiceNumber}</span>
                        <span className="text-[10px] text-slate-400 block">{inv.date}</span>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <span className="text-slate-950 font-bold block truncate">{inv.supplier}</span>
                        <span className="text-xs text-slate-500 block truncate">{inv.description}</span>
                        {inv.hasAttachment && (
                          <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-200">
                            <Paperclip className="w-3 h-3 text-slate-400" />
                            {inv.attachmentName}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 text-[10px] bg-indigo-50 text-indigo-600 rounded-md font-semibold font-mono">
                          {typeText}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-700">
                        {inv.preTaxAmount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-amber-600">
                        +{inv.vatPercent}%
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-black text-slate-950">
                        {inv.totalAmount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>
                          {badgeText}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {inv.status !== 'Paid' && (
                            <button
                              disabled={!permissions.billing_status_update}
                              onClick={() => onUpdateInvoiceStatus(inv.id, inv.status === 'Pending' ? 'Approved' : 'Paid')}
                              title={!permissions.billing_status_update ? "Yêu cầu quyền cập nhật trạng thái hóa đơn" : (inv.status === 'Pending' ? "Duyệt hóa đơn" : "Xác nhận đã thanh toán")}
                              className={`p-1 px-2 rounded font-bold text-[10px] transition ${
                                permissions.billing_status_update 
                                  ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer' 
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                              }`}
                            >
                              {inv.status === 'Pending' ? 'Duyệt' : 'Quyết toán'}
                            </button>
                          )}
                          <button
                            disabled={!permissions.billing_delete}
                            onClick={() => onDeleteInvoice(inv.id)}
                            className={`p-1.5 rounded transition ${
                              permissions.billing_delete
                                ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                                : 'text-slate-300 cursor-not-allowed opacity-40'
                            }`}
                            title={permissions.billing_delete ? "Xóa hóa đơn" : "Yêu cầu quyền xóa hóa đơn"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 italic">
              Không tìm thấy hóa đơn nào trong bộ lọc này.
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Invoice */}
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
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Khai Báo Kinh Phí / VAT</h3>
                <p className="text-xs text-slate-500">Kê khai hóa đơn chi phí đã phát sinh</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Số Hóa Đơn / Hợp Đồng</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: HOADON-2026-0005"
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Đơn vị cung cấp</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Công ty Truyền thông VCCorp"
                  value={supplier} 
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Phân nhóm chi phí</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value as Invoice['category'])}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950"
                  >
                    <option value="Ads Budget">Sách quảng cáo Ads (10% VAT)</option>
                    <option value="PR Service">Dịch vụ truyền thông/PR (10% VAT)</option>
                    <option value="Production Fee">Sản xuất ấn phẩm (8% VAT)</option>
                    <option value="Software Licensing">Bản quyền phần mềm (10% VAT)</option>
                    <option value="Other">Chi phí khác</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold block">Thuế suất VAT (%)</label>
                  <select 
                    value={vatPercent} 
                    onChange={(e) => setVatPercent(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950"
                  >
                    <option value={10}>10% (Quảng cáo, Công nghệ)</option>
                    <option value={8}>8% (Dịch vụ, Sự kiện, In ấn)</option>
                    <option value={5}>5% (Dịch vụ đặc thù)</option>
                    <option value={0}>0% (Không chịu thuế)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Mô tả chi tiết nội dung</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Viết 5 bài giới thiệu chuyên sâu đăng báo CafeF..."
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold block">Giá trị trước thuế (VND)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  placeholder="Nhập số tiền VNĐ. Ví dụ: 5000000"
                  value={preTaxAmount || ''} 
                  onChange={(e) => setPreTaxAmount(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 font-mono"
                />
              </div>

              {/* Dynamic tax summary box */}
              {preTaxAmount > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-650">
                    <span>Thành tiền trước thuế:</span>
                    <span className="font-bold text-slate-800 font-mono">{preTaxAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-slate-650">
                    <span>Cộng tiền thuế VAT ({vatPercent}%):</span>
                    <span className="font-bold text-amber-600 font-mono">{(preTaxAmount * (vatPercent / 100)).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="w-full h-px bg-indigo-100 my-1"></div>
                  <div className="flex justify-between text-indigo-900 font-bold">
                    <span>Tổng tiền thanh toán gộp thuế:</span>
                    <span className="font-black font-mono text-indigo-700">{currentComputedTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              )}

              {/* Mock attachment integration */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="hasAttachment" 
                    checked={hasAttachment}
                    onChange={(e) => setHasAttachment(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="hasAttachment" className="text-slate-700 font-semibold cursor-pointer">
                    Có đính kèm file hóa đơn điện tử (.pdf, .jpg)
                  </label>
                </div>

                {hasAttachment && (
                  <input 
                    type="text"
                    placeholder="Nhập tên tệp (ví dụ: HD_VCCorp_Ma552.pdf)"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none text-slate-950"
                  />
                )}
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
    </div>
  );
}
