import { Member, Task, Invoice } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Nguyễn Văn Hải',
    role: 'Trưởng phòng Marketing',
    systemRole: 'Admin',
    email: 'hai.nguyen@marketing.co',
    password: '123',
    division: 'Digital Ads',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    efficiencyScore: 92,
    joinedDate: '2024-01-15'
  },
  {
    id: 'm2',
    name: 'Trần Thị Mai',
    role: 'Content Lead & Copywriter',
    systemRole: 'Manager',
    email: 'mai.tran@marketing.co',
    password: '123',
    division: 'Content',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    efficiencyScore: 88,
    joinedDate: '2024-03-10'
  },
  {
    id: 'm3',
    name: 'Phạm Minh Đức',
    role: 'Senior Graphic Designer',
    systemRole: 'Member',
    email: 'duc.pham@marketing.co',
    password: '123',
    division: 'Design',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    efficiencyScore: 85,
    joinedDate: '2024-02-20'
  },
  {
    id: 'm4',
    name: 'Lê Hoàng Nam',
    role: 'Digital Marketing Specialist',
    systemRole: 'Member',
    email: 'nam.le@marketing.co',
    password: '123',
    division: 'Digital Ads',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    efficiencyScore: 94,
    joinedDate: '2024-05-01'
  },
  {
    id: 'm5',
    name: 'Đặng Thùy Chi',
    role: 'Event & PR Coordinator',
    systemRole: 'Member',
    email: 'chi.dang@marketing.co',
    password: '123',
    division: 'Event & PR',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    efficiencyScore: 79,
    joinedDate: '2024-06-15'
  },
  {
    id: 'm6',
    name: 'Hoàng Quốc Bảo',
    role: 'Junior Content Creator',
    systemRole: 'Member',
    email: 'bao.hoang@marketing.co',
    password: '123',
    division: 'Content',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    efficiencyScore: 72,
    joinedDate: '2024-09-01'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Lập chiến lược chiến dịch Tết 2027',
    description: 'Thiết lập mục tiêu KPIs, ngân sách chi tiết và thông điệp truyền thông cốt lõi cho chiến dịch chào Xuân.',
    division: 'Digital Ads',
    assigneeId: 'm1',
    priority: 'High',
    status: 'Completed',
    stage: 'Planning',
    progress: 100,
    deadline: '2026-05-15',
    attachments: [
      { name: 'Kế_hoạch_Tết_2027_v2.pdf', size: '2.4 MB', type: 'pdf', uploadedAt: '2026-05-12' }
    ],
    createdAt: '2026-05-01',
    completedAt: '2026-05-14'
  },
  {
    id: 't2',
    title: 'Viết bộ bài đăng 10 bài Facebook mở màn',
    description: 'Tập trung hướng đi Content Pillar 1 & 2 giới thiệu sứ mệnh sản phẩm mới và tặng kèm mini-game.',
    division: 'Content',
    assigneeId: 'm2',
    priority: 'Medium',
    status: 'InProgress',
    stage: 'Production',
    progress: 60,
    deadline: '2026-05-24',
    attachments: [
      { name: 'Kịch_bản_Content_Facebook.docx', size: '520 KB', type: 'docx', uploadedAt: '2026-05-18' }
    ],
    createdAt: '2026-05-16'
  },
  {
    id: 't3',
    title: 'Thiết kế Visual Banner & Poster quảng cáo',
    description: 'Thiết kế ấn phẩm truyền thông kích thước 1200x1200px cho fanpage và 720x1280px cho Story/Tiktok.',
    division: 'Design',
    assigneeId: 'm3',
    priority: 'High',
    status: 'InProgress',
    stage: 'Production',
    progress: 40,
    deadline: '2026-05-22',
    attachments: [
      { name: 'Draft_Outline_Banner.jpg', size: '1.8 MB', type: 'jpg', uploadedAt: '2026-05-19' }
    ],
    createdAt: '2026-05-17'
  },
  {
    id: 't4',
    title: 'Báo cáo A/B Testing Google Ads tháng 5',
    description: 'So sánh hiệu suất giữa landing page tối ưu UI mới và landing page cũ nhằm kiểm chứng conversion rate.',
    division: 'Digital Ads',
    assigneeId: 'm4',
    priority: 'Medium',
    status: 'Todo',
    stage: 'Optimization',
    progress: 0,
    deadline: '2026-05-28',
    attachments: [],
    createdAt: '2026-05-18'
  },
  {
    id: 't5',
    title: 'Liên hệ Book báo 3 trang tin lớn',
    description: 'Chuẩn bị bài PR báo chí, thương thảo báo giá booking với Kênh 14, CafeF và VnExpress.',
    division: 'Event & PR',
    assigneeId: 'm5',
    priority: 'High',
    status: 'Todo',
    stage: 'Execution',
    progress: 10,
    deadline: '2026-05-19', // Quá hạn so với mốc hiện tại 2026-05-20
    attachments: [
      { name: 'Báo_giá_booking_PR_2026.xlsx', size: '1.2 MB', type: 'xlsx', uploadedAt: '2026-05-14' }
    ],
    createdAt: '2026-05-10'
  },
  {
    id: 't6',
    title: 'Sản xuất Video ngắn Reels/Tiktok phát đầu',
    description: 'Quay và chỉnh sửa video thời lượng 30 giây quảng bá ưu đãi giới hạn cho sinh viên.',
    division: 'Content',
    assigneeId: 'm6',
    priority: 'Low',
    status: 'InProgress',
    stage: 'Production',
    progress: 25,
    deadline: '2026-05-25',
    attachments: [],
    createdAt: '2026-05-15'
  },
  {
    id: 't7',
    title: 'Tối ưu hóa SEO On-page Website chính',
    description: 'Kiểm tra sitemap, tốc độ tải trang, viết lại toàn bộ thẻ Alt ảnh của trang sản phẩm.',
    division: 'Content',
    assigneeId: 'm2',
    priority: 'Low',
    status: 'Completed',
    stage: 'Optimization',
    progress: 100,
    deadline: '2026-05-10',
    attachments: [
      { name: 'Audit_SEO_Summary_Report.pdf', size: '890 KB', type: 'pdf', uploadedAt: '2026-05-09' }
    ],
    createdAt: '2026-05-02',
    completedAt: '2026-05-09'
  },
  {
    id: 't8',
    title: 'Tổ chức sự kiện offline ra mắt đại lý',
    description: 'Điều phối âm thanh ánh sáng, tiệc teabreak và giám sát check-in khách mời VIP.',
    division: 'Event & PR',
    assigneeId: 'm5',
    priority: 'High',
    status: 'InProgress',
    stage: 'Execution',
    progress: 75,
    deadline: '2026-05-18', // Quá hạn so với mốc hiện tại 2026-05-20
    attachments: [
      { name: 'Kich_ban_chuong_trinh_v1.pdf', size: '1.1 MB', type: 'pdf', uploadedAt: '2026-05-15' }
    ],
    createdAt: '2026-05-05'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'i1',
    invoiceNumber: 'HOADON-2026-0001',
    supplier: 'Công ty Cổ phần Tiếp thị Số Nova',
    description: 'Chi phí chạy quảng cáo Facebook Ads tuần 1 & 2 tháng 5/2026',
    category: 'Ads Budget',
    preTaxAmount: 45000000,
    vatPercent: 10,
    totalAmount: 49500000,
    date: '2026-05-10',
    status: 'Paid',
    hasAttachment: true,
    attachmentName: 'HD_VAT_Nova_49500K.pdf'
  },
  {
    id: 'i2',
    invoiceNumber: 'HOADON-2026-0002',
    supplier: 'Hội nhà thiết kế trẻ Sài Gòn',
    description: 'Thuê thiết kế Motion Graphic 3D cho Key Visual thương hiệu',
    category: 'Production Fee',
    preTaxAmount: 18000000,
    vatPercent: 8,
    totalAmount: 19440000,
    date: '2026-05-14',
    status: 'Approved',
    hasAttachment: true,
    attachmentName: 'HD_Dichvu_3D_KV.pdf'
  },
  {
    id: 'i3',
    invoiceNumber: 'HOADON-2026-0003',
    supplier: 'Báo Điện tử Việt Nam Net',
    description: 'Booking bài đăng PR chuyên mục Công nghệ và Đổi mới',
    category: 'PR Service',
    preTaxAmount: 25000000,
    vatPercent: 10,
    totalAmount: 27500000,
    date: '2026-05-18',
    status: 'Pending',
    hasAttachment: false
  },
  {
    id: 'i4',
    invoiceNumber: 'HOADON-2026-0004',
    supplier: 'Figma Inc.',
    description: 'Hóa đơn gia hạn bản quyền phần mềm Figma Organization (1 năm)',
    category: 'Software Licensing',
    preTaxAmount: 12000000,
    vatPercent: 10,
    totalAmount: 13200000,
    date: '2026-05-05',
    status: 'Paid',
    hasAttachment: true,
    attachmentName: 'Figma_Subscription_Invoice.pdf'
  }
];
git checkout -b chore/standardize-database-sync
git add src/data/mockData.ts
git commit -m "chore(sync): standardize mkt database nodes and align roles v1.2"
git push origin chore/standardize-database-sync
