import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ToggleLeft,
  Settings,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Member, SystemRole, RolePermissions } from '../types';

interface PermissionsManagerProps {
  members: Member[];
  permissions: Record<SystemRole, RolePermissions>;
  currentUser: Member;
  onUpdateMemberRole: (memberId: string, systemRole: SystemRole) => void;
  onUpdatePermissions: (role: SystemRole, updatedPerms: Partial<RolePermissions>) => void;
  onImpersonateUser: (member: Member) => void;
}

export default function PermissionsManager({
  members,
  permissions,
  currentUser,
  onUpdateMemberRole,
  onUpdatePermissions,
  onImpersonateUser
}: PermissionsManagerProps) {

  const canManage = currentUser.systemRole === 'Admin';

  const permissionLabels: Record<keyof RolePermissions, { title: string; desc: string }> = {
    tasks_create: { title: 'Tạo công việc mới', desc: 'Có quyền tạo và giao công việc mới cho phòng ban.' },
    tasks_edit_all: { title: 'Chỉnh sửa mọi công việc', desc: 'Sửa toàn bộ trường thông tin. (Nếu tắt, nhân viên chỉ có thể sửa trạng thái/tiến độ công việc được giao).' },
    tasks_delete: { title: 'Xóa công việc', desc: 'Xóa hoàn toàn các công việc đã tạo khỏi hệ thống.' },
    billing_view: { title: 'Xem hóa đơn & VAT', desc: 'Xem số lượng, chi tiết hóa đơn VAT và các chi phí phát sinh.' },
    billing_create: { title: 'Kê khai hóa đơn', desc: 'Tạo hóa đơn chi phí phát sinh mới.' },
    billing_status_update: { title: 'Cập nhật trạng thái hóa đơn', desc: 'Duyệt hoặc chuyển trạng thái hóa đơn sang Đã thanh toán.' },
    billing_delete: { title: 'Xóa hóa đơn lưu trữ', desc: 'Xóa bản ghi hóa đơn ra khỏi lịch sử kế toán phòng ban.' },
    team_add_member: { title: 'Quản trị nhân sự', desc: 'Thành lập, chỉnh sửa danh sách hoặc bổ sung thành viên mới vào phòng ban.' },
    roles_manage: { title: 'Quản lý phân quyền', desc: 'Thay đổi trực tiếp ma trận quyền hoặc thăng tiến vai trò của thành viên.' }
  };

  const handleToggle = (role: SystemRole, field: keyof RolePermissions) => {
    if (!canManage) return;
    onUpdatePermissions(role, {
      [field]: !permissions[role][field]
    });
  };

  const roleNames: Record<SystemRole, string> = {
    Admin: 'Quản trị viên (Admin)',
    Manager: 'Quản lý (Manager)',
    Member: 'Nhân viên (Member)'
  };

  return (
    <div className="space-y-8" id="permissions_view">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-950/40">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-350 text-xs font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bảng điều khiển bảo mật & Phân quyền ứng dụng (RBAC)
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Hệ Thống Phân Quyền Vai Trò</h1>
            <p className="text-slate-300 max-w-xl text-sm leading-relaxed">
              Quản lý phân rã quyền hạn theo ba vai trò: Admin, Manager, và Member. Cấu hình linh hoạt ma trận quyền truy cập dữ liệu task và thông tin hóa đơn tài chính VAT chi tiết.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs space-y-2 block self-start">
            <span className="text-indigo-300 font-mono block text-[10px] uppercase font-bold tracking-wider">Tài khoản giả lập hiện tại</span>
            <div className="flex items-center gap-2.5">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover border border-white/20" referrerPolicy="no-referrer" />
              <div>
                <span className="font-bold text-white block">{currentUser.name}</span>
                <span className="text-emerald-400 font-medium block text-[10px] uppercase font-mono tracking-widest">{roleNames[currentUser.systemRole]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impersonation Console */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Tính năng Giả lập Người dùng (Impersonation Mode)</h2>
            <p className="text-xs text-slate-500">Mô phỏng trải nghiệm người dùng bằng cách chọn một nhân viên dưới đây. Toàn bộ tính năng hiển thị, hóa đơn, nút bấm của hệ thống sẽ lập tức phản ánh chính xác phân quyền của người đó.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-3">
          {members.map(m => {
            const isCurrent = m.id === currentUser.id;
            return (
              <button
                key={m.id}
                onClick={() => onImpersonateUser(m)}
                className={`group flex flex-col items-center p-3 rounded-xl border transition-all text-center relative ${
                  isCurrent 
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' 
                    : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-xs text-slate-700'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-1.5 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                )}
                <img 
                  src={m.avatar} 
                  alt={m.name} 
                  className={`w-10 h-10 rounded-full object-cover border mb-2 group-hover:scale-105 transition ${
                    isCurrent ? 'border-indigo-300' : 'border-slate-205'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-bold block truncate w-full">{m.name.split(' ').slice(-2).join(' ')}</span>
                <span className={`text-[10px] font-mono mt-0.5 block ${
                  isCurrent ? 'text-indigo-200' : 'text-slate-500'
                }`}>
                  {m.systemRole}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Permission Matrix Toggles */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                Ma trận Quyền hạn Phòng ban
              </h2>
              <span className="text-[10px] bg-slate-100 font-mono font-bold px-2 py-0.5 rounded text-slate-600 uppercase">Live config</span>
            </div>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Ấn trực tiếp vào các ô tick để bật/tắt quyền hạn cho từng vai trò trong thời gian thực. 
              {!canManage && (
                <span className="text-rose-600 font-semibold block mt-1.5 p-2 bg-rose-50 border border-rose-100 rounded-lg">
                  🔒 Chỉ Người Quản Trị (Admin) mới có quyền chỉnh sửa ma trận. Bạn chỉ có thể xem ma trận này.
                </span>
              )}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                    <th className="py-2.5 px-3">Hành động hệ thống (Capability)</th>
                    <th className="py-2.5 px-3 text-center w-24">Admin</th>
                    <th className="py-2.5 px-3 text-center w-24">Manager</th>
                    <th className="py-2.5 px-3 text-center w-24">Member</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(Object.keys(permissionLabels) as Array<keyof RolePermissions>).map(field => (
                    <tr key={field} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 block">{permissionLabels[field].title}</span>
                        <span className="text-[10px] text-slate-450 block mt-0.5 leading-normal">{permissionLabels[field].desc}</span>
                      </td>
                      {(['Admin', 'Manager', 'Member'] as SystemRole[]).map(role => {
                        const hasPerm = permissions[role][field];
                        const isToggleDisabled = !canManage || role === 'Admin' && field === 'roles_manage'; // Can't disable Admin's self management to avoid lockout
                        return (
                          <td key={role} className="py-3 px-3 text-center">
                            <button
                              disabled={isToggleDisabled}
                              onClick={() => handleToggle(role, field)}
                              className={`p-1.5 rounded-lg transition-all mx-auto flex items-center justify-center ${
                                isToggleDisabled ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                              }`}
                            >
                              {hasPerm ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-slate-300" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span><strong>Cơ chế tự khóa tránh sự cố (Admin Safety):</strong> Hệ thống ngăn chặn việc tắt quyền quản trị tối cao của Admin chính để tránh trường hợp tự tước đi quyền cài đặt và làm chết hệ thống vận hành.</span>
          </div>
        </div>

        {/* Member list & System Role Assignment */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                Thay đổi vai trò nhân sự
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Cập nhật lại quyền làm việc trong nội bộ marketing department. Lưu sửa đổi trực tiếp vào hồ sơ.
            </p>

            <div className="space-y-3.5 overflow-y-auto max-h-[420px] pr-1">
              {members.map(member => (
                <div key={member.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200" referrerPolicy="no-referrer" />
                    <div className="overflow-hidden">
                      <span className="font-bold text-slate-800 text-xs block truncate">{member.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate leading-tight">{member.role}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <select
                      disabled={!canManage || member.id === 'm1'} // can't demote lead Admin to prevent locks
                      value={member.systemRole}
                      onChange={(e) => onUpdateMemberRole(member.id, e.target.value as SystemRole)}
                      className={`text-[11px] font-bold px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 outline-hidden focus:border-indigo-500 transition cursor-pointer disabled:cursor-not-allowed ${
                        !canManage ? 'opacity-80' : ''
                      }`}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-10s text-indigo-900 rounded-xl p-3.5 mt-6 text-[11px] leading-relaxed">
            <span className="font-bold">Hồ sơ đồng bộ:</span> Giám sát trưởng phòng ban mặc định có sẵn đặc quyền quản trị cấp độ cao nhất. Bạn có thể thăng chức các Leads lên Manager để san sẻ công việc phụ trách duyệt hóa đơn.
          </div>
        </div>

      </div>

    </div>
  );
}
