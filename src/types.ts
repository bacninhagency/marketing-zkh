export type Priority = 'High' | 'Medium' | 'Low'; // Cao, Trung bình, Thấp
export type TaskStatus = 'Todo' | 'InProgress' | 'Completed'; // Đã giao, Đang thực hiện, Đã hoàn thành
export type TaskStage = 'Planning' | 'Production' | 'Execution' | 'Optimization'; // Lập kế hoạch, Sản xuất, Triển khai, Tối ưu
export type MarketingDivision = string; // Phòng ban / phân ban nội bộ (Hỗ trợ thêm động)

export interface Attachment {
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  url?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  division: MarketingDivision;
  assigneeId: string;
  priority: Priority;
  status: TaskStatus;
  stage: TaskStage;
  progress: number; // 0 to 100
  deadline: string; // YYYY-MM-DD
  attachments: Attachment[];
  createdAt: string;
  completedAt?: string;
  createdBy?: string; // ID of the member who created this task
}

export type SystemRole = 'Admin' | 'Manager' | 'Member';

export interface RolePermissions {
  tasks_create: boolean;
  tasks_edit_all: boolean;
  tasks_delete: boolean;
  billing_view: boolean;
  billing_create: boolean;
  billing_status_update: boolean;
  billing_delete: boolean;
  team_add_member: boolean;
  roles_manage: boolean;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  systemRole: SystemRole;
  email: string;
  division: MarketingDivision;
  avatar: string;
  efficiencyScore: number; // 0 to 100, calculated or specified
  joinedDate: string;
  phone?: string;
  birthDate?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  description: string;
  category: 'Ads Budget' | 'Production Fee' | 'PR Service' | 'Software Licensing' | 'Other';
  preTaxAmount: number; // VNĐ
  vatPercent: number; // e.g., 8 or 10
  totalAmount: number; // calculated as preTaxAmount * (1 + vatPercent / 100)
  date: string; // YYYY-MM-DD
  status: 'Pending' | 'Approved' | 'Paid'; // Chờ duyệt, Đã duyệt, Đã thanh toán
  hasAttachment: boolean;
  attachmentName?: string;
}

export interface AppNotification {
  id: string;
  memberId: string; // ID of the member who receives the notification
  title: string;
  message: string;
  createdAt: string; // ISO string or simple time e.g., '2026-05-20'
  isRead: boolean;
  taskId?: string;
  senderName?: string;
}
