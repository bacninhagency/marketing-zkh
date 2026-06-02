import React, { useState, useMemo, useEffect } from 'react';
import { 
  Link2, 
  ExternalLink, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  FileText, 
  FileSpreadsheet, 
  Layout, 
  Globe, 
  FolderOpen, 
  X, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import { Member, MarketingDivision } from '../types';

export interface DepartmentLink {
  id: string;
  title: string;
  url: string;
  category: 'Document' | 'Spreadsheet' | 'Design' | 'Tool' | 'Other';
  division: MarketingDivision;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

interface InternalAdminLinksProps {
  divisions: string[];
  members: Member[];
  currentUser: Member;
}

export default function InternalAdminLinks({ 
  divisions, 
  members, 
  currentUser 
}: InternalAdminLinksProps) {
  
  // Load links from localStorage or set up default files
  const [links, setLinks] = useState<DepartmentLink[]>(() => {
    const saved = localStorage.getItem('mkt_department_links');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing link files", e);
      }
    }
    
    // Default initial mock data
    const initialLinks: DepartmentLink[] = [
      {
        id: 'lnk-1',
        title: 'Thư mục Google Drive - Tài nguyên thiết kế Tết 2027',
        url: 'https://drive.google.com/drive/folders/1brand-guideline-example',
        category: 'Document',
        division: 'Design',
        description: 'Chứa toàn bộ hình ảnh sản phẩm chất lượng cao, file nén (.zip) cho Key Visual chiến dịch Tết và banner quảng cáo.',
        updatedAt: '2026-05-28T10:30:00Z',
        updatedBy: 'Phạm Minh Đức'
      },
      {
        id: 'lnk-2',
        title: 'Figma - UI/UX Portal & App Mockups chính thức',
        url: 'https://www.figma.com/file/marketing-ui-ux-design-example',
        category: 'Design',
        division: 'Design',
        description: 'Bản vẽ Layout Mobile App & Landing Page cho chương trình khuyến mại lớn mùa hạ 2026.',
        updatedAt: '2026-05-29T14:20:00Z',
        updatedBy: 'Phạm Minh Đức'
      },
      {
        id: 'lnk-3',
        title: 'Google Sheet - Thiết lập Lịch đăng bài Fanpage tháng 6/2026',
        url: 'https://docs.google.com/spreadsheets/d/1content-planning-june-example',
        category: 'Spreadsheet',
        division: 'Content',
        description: 'Tài liệu tối quan trọng của phòng Content, cập nhật timeline lên bài, phân nhóm Content Pillar chi tiết hàng ngày.',
        updatedAt: '2026-05-30T09:12:00Z',
        updatedBy: 'Trần Thị Mai'
      },
      {
        id: 'lnk-4',
        title: 'Google Sheet - UTM Tracking & Tạo UTM Link chiến dịch',
        url: 'https://docs.google.com/spreadsheets/d/1utm-tracking-generator-example',
        category: 'Spreadsheet',
        division: 'Digital Ads',
        description: 'Bảng sinh link UTM tự động cho các đường dẫn chạy Ads để đồng bộ kết quả chuyển đổi lên Google Analytics.',
        updatedAt: '2026-05-31T16:45:00Z',
        updatedBy: 'Lê Hoàng Nam'
      },
      {
        id: 'lnk-5',
        title: 'Tài liệu PR & Script Họp Báo giới thiệu Sự kiện 2026',
        url: 'https://docs.google.com/document/d/1pr-press-release-script-example',
        category: 'Document',
        division: 'Event & PR',
        description: 'Kịch bản chi tiết cho MC, danh sách khách mời báo chí và hướng dẫn trả lời phỏng vấn truyền thông.',
        updatedAt: '2026-06-01T08:00:00Z',
        updatedBy: 'Đặng Thùy Chi'
      },
      {
        id: 'lnk-6',
        title: 'Công cụ Convert Ảnh sang định dạng WebP trực tuyến',
        url: 'https://tinypng.com/',
        category: 'Tool',
        division: 'Design',
        description: 'Trang nén ảnh dung lượng cực tốt giúp tối ưu tốc độ tải trang cho Landing Page marketing.',
        updatedAt: '2026-05-25T11:05:00Z',
        updatedBy: 'Hoàng Quốc Bảo'
      }
    ];

    localStorage.setItem('mkt_department_links', JSON.stringify(initialLinks));
    return initialLinks;
  });

  // Save changes to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('mkt_department_links', JSON.stringify(links));
  }, [links]);

  // UI state filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Copy state feedbacks (to track which link ID was copied)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form link state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState<'Document' | 'Spreadsheet' | 'Design' | 'Tool' | 'Other'>('Document');
  const [formDivision, setFormDivision] = useState<string>('');
  const [formDescription, setFormDescription] = useState('');

  // Set default division in form when form opens or division changes
  useEffect(() => {
    if (divisions.length > 0 && !formDivision) {
      setFormDivision(divisions[0]);
    }
  }, [divisions, formDivision]);

  // Process filters
  const filteredLinks = useMemo(() => {
    return links.filter(lnk => {
      const matchesSearch = lnk.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            lnk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lnk.url.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDivision = selectedDivision === 'All' || lnk.division === selectedDivision;
      const matchesCategory = selectedCategory === 'All' || lnk.category === selectedCategory;

      return matchesSearch && matchesDivision && matchesCategory;
    });
  }, [links, searchTerm, selectedDivision, selectedCategory]);

  const statsByCategory = useMemo(() => {
    return {
      All: links.length,
      Document: links.filter(l => l.category === 'Document').length,
      Spreadsheet: links.filter(l => l.category === 'Spreadsheet').length,
      Design: links.filter(l => l.category === 'Design').length,
      Tool: links.filter(l => l.category === 'Tool').length,
      Other: links.filter(l => l.category === 'Other').length,
    };
  }, [links]);

  // Action handlers
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error("Failed to copy link: ", err);
    });
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormUrl('');
    setFormCategory('Document');
    setFormDivision(currentUser.division || divisions[0] || 'Content');
    setFormDescription('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (lnk: DepartmentLink) => {
    setEditingId(lnk.id);
    setFormTitle(lnk.title);
    setFormUrl(lnk.url);
    setFormCategory(lnk.category);
    setFormDivision(lnk.division);
    setFormDescription(lnk.description);
    setIsFormOpen(true);
  };

  const handleDeleteLink = (id: string) => {
    setDeletingLinkId(id);
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) return;

    // Ensure valid URL scheme
    let formattedUrl = formUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (editingId) {
      // Edit
      setLinks(prev => prev.map(lnk => {
        if (lnk.id === editingId) {
          return {
            ...lnk,
            title: formTitle.trim(),
            url: formattedUrl,
            category: formCategory,
            division: formDivision,
            description: formDescription.trim(),
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.name
          };
        }
        return lnk;
      }));
    } else {
      // Add new
      const newLnk: DepartmentLink = {
        id: 'lnk-' + Date.now(),
        title: formTitle.trim(),
        url: formattedUrl,
        category: formCategory,
        division: formDivision,
        description: formDescription.trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.name
      };
      setLinks(prev => [newLnk, ...prev]);
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  // Helper function to return icon by category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Document':
        return <FileText className="w-4 h-4 text-sky-600" />;
      case 'Spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'Design':
        return <Layout className="w-4 h-4 text-violet-600" />;
      case 'Tool':
        return <Globe className="w-4 h-4 text-amber-600" />;
      default:
        return <FolderOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'Document': return 'Tài liệu / Văn bản';
      case 'Spreadsheet': return 'Bảng dữ liệu / Sheets';
      case 'Design': return 'Thiết kế / Figma';
      case 'Tool': return 'Công cụ trực tuyến';
      default: return 'Khác';
    }
  };

  const getCategoryColorClass = (category: string) => {
    switch (category) {
      case 'Document': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Spreadsheet': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Design': return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'Tool': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6" id="internal_admin_links_view">
      
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Quản Trị Nội Bộ & Tài Nguyên</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Hệ Thống Liên Kết Bộ Phận</h2>
          <p className="text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
            Nơi tập hợp, phân loại và chia sẻ các cổng thông tin, đường dẫn Google Drive, Figma, bảng KPIs, kịch bản PR phục vụ vận hành marketing phối hợp.
          </p>
        </div>

        <button 
          onClick={handleOpenAddForm}
          className="relative z-10 self-start md:self-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl transition shadow-lg shadow-emerald-950/20 flex items-center gap-2 cursor-pointer border border-emerald-400/20 active:translate-y-px hover:shadow-emerald-500/10"
          id="btn_add_internal_link"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          <span>Thêm liên kết mới</span>
        </button>
      </div>

      {/* Main Filter Panel Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs space-y-4">
        
        {/* Row 1: Search & Division Select */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm kiếm liên kết theo tên, mô tả hoặc đường dẫn URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-xl text-slate-950 placeholder-slate-400 transition"
              id="search_internal_links_input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-650 p-0.5 rounded-md hover:bg-slate-200 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-650 rounded-xl text-slate-800 font-bold cursor-pointer"
              id="filter_division_select"
            >
              <option value="All">Tất cả phòng ban ({divisions.length})</option>
              {divisions.map((div) => (
                <option key={div} value={div}>Phòng {div}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Row 2: Category Filter Tabs */}
        <div className="pt-2 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5" id="category_pills_container">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-indigo-600 text-white border-indigo-650 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200/80'
              }`}
            >
              Tất cả ({statsByCategory.All})
            </button>
            <button
              onClick={() => setSelectedCategory('Document')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                selectedCategory === 'Document'
                  ? 'bg-sky-600 text-white border-sky-650 shadow-2xs'
                  : 'bg-slate-50 text-sky-700 hover:bg-sky-50/50 border-slate-200/80 font-semibold'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tài liệu ({statsByCategory.Document})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('Spreadsheet')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                selectedCategory === 'Spreadsheet'
                  ? 'bg-emerald-600 text-white border-emerald-650 shadow-2xs'
                  : 'bg-slate-50 text-emerald-700 hover:bg-emerald-50/50 border-slate-200/80 font-semibold'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Bảng tính ({statsByCategory.Spreadsheet})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('Design')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                selectedCategory === 'Design'
                  ? 'bg-violet-600 text-white border-violet-650 shadow-2xs'
                  : 'bg-slate-50 text-violet-700 hover:bg-violet-50/50 border-slate-200/80 font-semibold'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Thiết kế ({statsByCategory.Design})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('Tool')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                selectedCategory === 'Tool'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                  : 'bg-slate-50 text-amber-700 hover:bg-amber-50/50 border-slate-200/80 font-semibold'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Công cụ ({statsByCategory.Tool})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('Other')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                selectedCategory === 'Other'
                  ? 'bg-slate-600 text-white border-slate-650 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/80 font-semibold'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Khác ({statsByCategory.Other})</span>
            </button>
          </div>

          <div className="text-[11px] font-mono font-medium text-slate-400 self-end sm:self-center">
            Hiển thị: <span className="font-bold text-slate-700">{filteredLinks.length}</span> liên kết phù hợp
          </div>
        </div>

      </div>

      {/* Main Grid representation of department files/links */}
      {filteredLinks.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-250 p-16 rounded-3xl text-center shadow-3xs flex flex-col items-center justify-center max-w-full">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4 text-slate-400">
            <Link2 className="w-8 h-8 opacity-65 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Không tìm thấy tài khoản liên kết nào</h3>
          <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
            Không có liên kết tài liệu nào khớp với từ khóa tìm kiếm hoặc bộ lọc được thiết kế. Vui lòng làm sạch thanh công cụ hoặc thêm liên kết mới.
          </p>
          {(searchTerm || selectedDivision !== 'All' || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDivision('All');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold rounded-xl transition cursor-pointer shadow-3xs"
            >
              Xóa toàn bộ các bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="department_links_bento_grid">
          {filteredLinks.map((lnk) => {
            const hasCopied = copiedId === lnk.id;
            return (
              <div 
                key={lnk.id}
                className="bg-white border border-slate-100/90 rounded-2xl shadow-3xs hover:shadow-md hover:border-indigo-100/60 p-5 flex flex-col justify-between transition-all duration-200 group relative overflow-hidden"
                id={`lnk_card_${lnk.id}`}
              >
                {/* Thin top strip for visual rhythm based on category */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] ${
                  lnk.category === 'Document' ? 'bg-sky-500' :
                  lnk.category === 'Spreadsheet' ? 'bg-emerald-500' :
                  lnk.category === 'Design' ? 'bg-violet-500' :
                  lnk.category === 'Tool' ? 'bg-amber-500' : 'bg-slate-500'
                }`}></div>

                {/* Card Top Block */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2.5">
                    
                    {/* Category pill & Division badging */}
                    <div className="flex flex-wrap items-center gap-1.5 select-none">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getCategoryColorClass(lnk.category)}`}>
                        {getCategoryIcon(lnk.category)}
                        <span>{getCategoryLabel(lnk.category)}</span>
                      </span>
                      
                      <span className="bg-indigo-50 border border-indigo-100/75 px-2 py-0.5 rounded-md text-[10px] font-extrabold text-indigo-700 block uppercase tracking-wider">
                        {lnk.division}
                      </span>
                    </div>

                    {/* Action buttons (Edit & Delete for collaborative portal) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditForm(lnk)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 rounded-xl transition duration-150 border border-slate-100 hover:border-indigo-100 cursor-pointer"
                        title="Chỉnh sửa chi tiết"
                        id={`edit_btn_link_${lnk.id}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(lnk.id)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 rounded-xl transition duration-150 border border-slate-100 hover:border-rose-100 cursor-pointer"
                        title="Xóa liên kết"
                        id={`delete_btn_link_${lnk.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Title & URL preview */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug group-hover:text-indigo-700 transition duration-150 break-words line-clamp-2" title={lnk.title}>
                      {lnk.title}
                    </h4>
                    
                    <a 
                      href={lnk.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-indigo-500 hover:text-indigo-700 hover:underline inline-flex items-center gap-1 mt-1 font-semibold truncate max-w-full block"
                    >
                      <span>{lnk.url}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                    </a>
                  </div>

                  {/* Description note */}
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold line-clamp-3 bg-slate-50 rounded-xl p-3 border border-slate-100/40">
                    {lnk.description || 'Không có ghi chú mô tả bổ sung cho đường dẫn tài liệu này.'}
                  </p>
                </div>

                {/* Card Bottom Block */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3 select-none">
                  <div className="overflow-hidden">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Cập nhật cuối</span>
                    <span className="text-[10.5px] font-bold text-slate-750 block truncate">
                      {lnk.updatedBy} <span className="font-medium text-slate-400">• {new Date(lnk.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </span>
                  </div>

                  {/* Operational Action triggers */}
                  <div className="flex gap-1.5 shrink-0">
                    
                    {/* Copy URL trigger */}
                    <button
                      onClick={() => handleCopyLink(lnk.url, lnk.id)}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        hasCopied 
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-2xs scale-95' 
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-650 hover:bg-slate-50 hover:text-slate-900 shadow-3xs'
                      }`}
                      title={hasCopied ? 'Đã sao chép!' : 'Sao chép đường dẫn'}
                    >
                      {hasCopied ? (
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {hasCopied && <span className="text-[9px] font-bold pr-0.5">OK</span>}
                    </button>

                    {/* Open link tab trigger */}
                    <a
                      href={lnk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-3xs hover:shadow-indigo-500/10 active:translate-y-px"
                      title="Mở liên kết mới"
                    >
                      <span>Mở</span>
                      <ExternalLink className="w-3 h-3 block m-0 shrink-0" />
                    </a>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over Form / Modal for Create and Edit Link files */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto" id="internal_link_modal_backdrop">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg p-6 relative flex flex-col" id="internal_link_form_modal">
            
            {/* Close trigger */}
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition inline-block cursor-pointer"
              id="btn_close_link_modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header branding */}
            <div className="flex items-center gap-2.5 mb-5 border-b border-zinc-100 pb-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {editingId ? 'Cập Nhật Liên Kết Nội Bộ' : 'Thêm Đường Dẫn Mới'}
                </h3>
                <p className="text-xs text-slate-500 font-medium font-sans">
                  {editingId ? 'Cập nhật tài liệu, thư mục lưu trữ của phòng ban.' : 'Cung cấp đường dẫn hữu ích để tối ưu liên lạc nội bộ phòng.'}
                </p>
              </div>
            </div>

            {/* Form Fields block */}
            <form onSubmit={handleSaveLink} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Tiêu Đề Liên Kết</label>
                <input 
                  type="text"
                  required
                  placeholder="Ví dụ: Google Drive - Lịch đăng PR báo điện tử..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 bg-white shadow-3xs"
                  id="link_form_title_input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Đường Dẫn URL (Link)</label>
                <input 
                  type="text"
                  required
                  placeholder="drive.google.com, docs.google.com, figma.com..."
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 font-mono bg-white shadow-3xs"
                  id="link_form_url_input"
                />
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
                  Hệ thống hỗ trợ tự động bổ sung giao thức bảo mật <strong>https://</strong> nếu thiếu.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Phân Loại Tài Nguyên</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800 font-bold cursor-pointer shadow-3xs"
                    id="link_form_category_select"
                  >
                    <option value="Document">Tài liệu / Văn bản</option>
                    <option value="Spreadsheet">Bảng tính / Google Sheet</option>
                    <option value="Design">Bản vẽ thiết kế / Figma</option>
                    <option value="Tool">Công vụ web / Tools</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Phòng Ban Sở Hữu</label>
                  <select
                    value={formDivision}
                    onChange={(e) => setFormDivision(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800 font-bold cursor-pointer shadow-3xs"
                    id="link_form_division_select"
                  >
                    {divisions.map((div) => (
                      <option key={div} value={div}>Phòng {div}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Ghi Chú Mô Tả Chi Tiết (Tùy chọn)</label>
                <textarea 
                  rows={3}
                  placeholder="Mô tả công dụng hoặc phạm vi sử dụng của tài nguyên này để các thành viên khác dễ dàng phối hợp..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-950 placeholder-slate-400 bg-white shadow-3xs leading-relaxed"
                  id="link_form_description_input"
                />
              </div>

              {/* Status footer warning */}
              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-[10.5px] text-indigo-700 leading-normal font-semibold">
                Liên kết sau khi lưu sẽ được cập nhật dưới danh nghĩa <strong>{currentUser.name} ({currentUser.role})</strong> và lưu trữ trực tiếp vào hệ thống vận hành nội bộ.
              </div>

              {/* Submit triggers */}
              <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-xs font-extrabold rounded-xl transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm active:translate-y-px cursor-pointer"
                  id="btn_submit_save_link"
                >
                  {editingId ? 'Cập nhật ngay' : 'Đăng tải ngay'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingLinkId && (() => {
        const targetLink = links.find(l => l.id === deletingLinkId);
        if (!targetLink) return null;

        const handleConfirmDelete = () => {
          setLinks(prev => prev.filter(lnk => lnk.id !== deletingLinkId));
          setDeletingLinkId(null);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto" id="delete_link_modal_backdrop">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md p-6 relative flex flex-col" id="delete_link_modal">
              {/* Close Button */}
              <button 
                onClick={() => setDeletingLinkId(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition whitespace-nowrap block cursor-pointer"
                id="close_delete_link_modal_btn"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2.5 mb-4 text-rose-600">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Xác Nhận Xóa Liên Kết</h3>
                  <p className="text-xs text-slate-500 font-medium">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-650 leading-relaxed font-semibold space-y-2 mb-5">
                <p>Bạn đang yêu cầu xóa vĩnh viễn liên kết tài nguyên sau:</p>
                <div className="bg-white p-3 rounded-lg border border-slate-150 font-bold text-slate-900 break-words">
                  {targetLink.title}
                </div>
                <p className="text-rose-600 text-[10px] uppercase font-bold tracking-wider">Lưu ý: Liên kết này sẽ bị xóa khỏi tất cả thành viên trong nhóm đang truy cập.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingLinkId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-150 text-slate-700 text-xs font-extrabold rounded-xl transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-750 text-white text-xs font-bold rounded-xl transition shadow-sm active:translate-y-px cursor-pointer"
                  id="confirm_delete_link_btn"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
