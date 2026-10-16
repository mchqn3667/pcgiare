import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  deleteDoc 
} from 'firebase/firestore';

import { 
  ShoppingCart, 
  Search, 
  Settings, 
  MonitorPlay,
  Cpu, 
  CircuitBoard,
  Plus, 
  Edit, 
  Trash2, 
  X,
  Store,
  Zap,
  Upload,
  Link as LinkIcon,
  Eye,
  HardDrive,
  ShieldCheck,
  Box,
  Check,
  Minus,
  ArrowRight,
  Filter,
  CheckCircle2,
  Heart,
  RefreshCw,
  SlidersHorizontal,
  Scale,
  Star,
  Copy,
  Tag,
  Percent,
  Sparkles,
  AlertTriangle,
  Layers,
  Fan,
  Server,
  Award,
  Truck,
  ChevronDown,
  LayoutGrid,
  List,
  Database,
  Wifi
} from 'lucide-react';

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "demo", authDomain: "demo.firebaseapp.com", projectId: "demo" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'pcgiare-app';

// Danh mục linh kiện chuẩn PC Gaming (GearVN / Phong Vũ Style)
const CATEGORIES = [
  'Tất cả',
  'CPU',
  'VGA',
  'RAM',
  'Mainboard',
  'SSD',
  'Nguồn (PSU)',
  'Tản Nhiệt',
  'Vỏ Case'
];

// Danh sách các khe linh kiện cho công cụ Build PC
const BUILD_SLOTS = [
  { key: 'CPU', name: 'Vi xử lý (CPU)', icon: Cpu },
  { key: 'Mainboard', name: 'Bo mạch chủ (Mainboard)', icon: Server },
  { key: 'RAM', name: 'Bộ nhớ trong (RAM)', icon: Layers },
  { key: 'VGA', name: 'Card màn hình (VGA)', icon: CircuitBoard },
  { key: 'SSD', name: 'Ổ cứng (SSD/HDD)', icon: HardDrive },
  { key: 'Nguồn (PSU)', name: 'Nguồn máy tính (PSU)', icon: Zap },
  { key: 'Tản Nhiệt', name: 'Tản nhiệt CPU', icon: Fan },
  { key: 'Vỏ Case', name: 'Vỏ máy tính (Case)', icon: Box }
];

// Danh sách Mã giảm giá sẵn có
const PROMO_CODES = {
  'PCGIARE500K': { discount: 500000, minTotal: 5000000, label: 'Giảm 500.000đ cho đơn từ 5tr' },
  'GEAR1000K': { discount: 1000000, minTotal: 15000000, label: 'Giảm 1.000.000đ cho đơn từ 15tr' },
  'VIPGAMER': { discount: 2000000, minTotal: 30000000, label: 'Giảm 2.000.000đ cho dàn PC khủng' }
};

// Dữ liệu mẫu mở rộng với đầy đủ thông số kĩ thuật
const initialProducts = [
  {
    id: '1',
    name: "Intel Core i9 14900K (LGA1700 / DDR5 / 6.0GHz)",
    category: "CPU",
    price: 14500000,
    originalPrice: 16200000,
    stock: 12,
    rating: 4.9,
    reviewCount: 42,
    powerConsumption: 253,
    socket: "LGA1700",
    ramType: "DDR5",
    description: "24 nhân 32 luồng, xung nhịp tối đa 6.0GHz, Socket LGA1700 thế hệ mới, hỗ trợ DDR5 và PCIe 5.0.",
    imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80",
    isFlashSale: true,
    flashSaleSold: 8,
    flashSaleTotal: 10
  },
  {
    id: '2',
    name: "ASUS ROG Strix RTX 4090 OC Edition 24GB",
    category: "VGA",
    price: 53900000,
    originalPrice: 58000000,
    stock: 4,
    rating: 5.0,
    reviewCount: 19,
    powerConsumption: 450,
    description: "24GB GDDR6X, kiến trúc DLSS 3 Ada Lovelace, quạt Axial-tech làm mát đỉnh cao cho gaming 4K.",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80",
    isFlashSale: true,
    flashSaleSold: 3,
    flashSaleTotal: 5
  },
  {
    id: '3',
    name: "G.SKILL Trident Z5 RGB 32GB (2x16GB) DDR5 6000MHz",
    category: "RAM",
    price: 3450000,
    originalPrice: 3900000,
    stock: 25,
    rating: 4.8,
    reviewCount: 65,
    ramType: "DDR5",
    powerConsumption: 15,
    description: "Bộ nhớ RAM DDR5 tốc độ cao, tản nhiệt nhôm xước phay tích hợp đèn LED RGB sắc nét.",
    imageUrl: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80",
    isFlashSale: false
  },
  {
    id: '4',
    name: "ASUS ROG MAXIMUS Z790 HERO (LGA1700 / DDR5)",
    category: "Mainboard",
    price: 16800000,
    originalPrice: 18500000,
    stock: 7,
    rating: 4.9,
    reviewCount: 15,
    socket: "LGA1700",
    ramType: "DDR5",
    powerConsumption: 40,
    description: "Bo mạch chủ Intel Z790 LGA 1700, DDR5, PCIe 5.0, Wi-Fi 6E, hỗ trợ ép xung chuyên nghiệp.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    isFlashSale: false
  },
  {
    id: '5',
    name: "Samsung 990 PRO 2TB NVMe M.2 PCIe 4.0",
    category: "SSD",
    price: 4850000,
    originalPrice: 5400000,
    stock: 30,
    rating: 4.9,
    reviewCount: 88,
    powerConsumption: 10,
    description: "Tốc độ đọc lên tới 7450MB/s, ghi 6900MB/s. Tối ưu cho chiến game 3A và xử lý đồ họa nặng.",
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
    isFlashSale: true,
    flashSaleSold: 18,
    flashSaleTotal: 20
  },
  {
    id: '6',
    name: "Corsair RM1000x 1000W 80 Plus Gold Modular",
    category: "Nguồn (PSU)",
    price: 4500000,
    originalPrice: 5100000,
    stock: 15,
    rating: 4.9,
    reviewCount: 34,
    psuWattage: 1000,
    description: "Nguồn công suất thực 1000W, chứng nhận 80 Plus Gold, dây nguồn tháo rời toàn bộ.",
    imageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80",
    isFlashSale: false
  },
  {
    id: '7',
    name: "Tản Nhiệt Nước NZXT Kraken Elite 360 RGB Black",
    category: "Tản Nhiệt",
    price: 7890000,
    originalPrice: 8500000,
    stock: 8,
    rating: 4.8,
    reviewCount: 22,
    powerConsumption: 25,
    description: "Màn hình LCD 2.36 inch tùy chỉnh GIF/Specs, 3 quạt F120 RGB Core, hiệu năng làm mát tối thượng.",
    imageUrl: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80",
    isFlashSale: false
  },
  {
    id: '8',
    name: "Vỏ Case Lian Li O11 Dynamic EVO XL Black",
    category: "Vỏ Case",
    price: 6200000,
    originalPrice: 6800000,
    stock: 10,
    rating: 5.0,
    reviewCount: 14,
    description: "Kính cường lực kép panorama không cột chống, không gian rộng rãi hỗ trợ 3 tản nhiệt 420mm.",
    imageUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop&q=80",
    isFlashSale: false
  }
];

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

const SafeImage = React.memo(({ src, alt, category, className }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    const isCPU = category === 'CPU';
    const isVGA = category === 'VGA';
    const isRam = category === 'RAM';
    const isSSD = category === 'SSD';

    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-gray-800 text-gray-500 ${className}`}>
        {isCPU && <Cpu size={40} className="text-cyan-400 opacity-70 mb-2 animate-pulse" />}
        {isVGA && <CircuitBoard size={40} className="text-purple-400 opacity-70 mb-2 animate-pulse" />}
        {isRam && <Layers size={40} className="text-emerald-400 opacity-70 mb-2" />}
        {isSSD && <HardDrive size={40} className="text-amber-400 opacity-70 mb-2" />}
        {!isCPU && !isVGA && !isRam && !isSSD && <Box size={40} className="text-blue-400 opacity-70 mb-2" />}
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{category || 'Linh Kiện'}</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
});

export default function App() {
  // Navigation view: 'store' | 'pc-builder' | 'admin'
  const [view, setView] = useState('store');
  // --- BẢO MẬT ADMIN PANEL ---
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setView('admin');
    } else {
      const password = prompt("Nhập mật khẩu Quản trị viên:");
      if (password === '12345678') { // Đổi 12345678 thành mật khẩu riêng của bạn
        setIsAdminAuthenticated(true);
        setView('admin');
      } else {
        alert("Mật khẩu không chính xác!");
      }
    }
  };
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [pcBuild, setPcBuild] = useState({});

  // Search & Filter State
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');

  // Modals & UI Controls
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [toast, setToast] = useState(null);

  // Voucher state
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');

  // Form states
  const [imageInputMode, setImageInputMode] = useState('file');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'CPU',
    price: '',
    originalPrice: '',
    stock: '10',
    imageUrl: '',
    description: '',
    powerConsumption: '50'
  });

  const [checkoutData, setCheckoutData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'cod'
  });

  // Cloud Sync state
  const [user, setUser] = useState(null);
  const [isDbSynced, setIsDbSynced] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Lỗi xác thực Database:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const productsColRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    
    const unsubscribe = onSnapshot(
      productsColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedProducts = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          setProducts(loadedProducts);
        } else {
          // Seed database if empty
          initialProducts.forEach(async (p) => {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', String(p.id));
            await setDoc(docRef, p);
          });
        }
        setIsDbSynced(true);
      },
      (error) => {
        console.error("Lỗi đồng bộ Database:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchCat = selectedCategory === 'Tất cả' || product.category === selectedCategory;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchPrice = true;
      if (priceRange === 'under5m') matchPrice = product.price < 5000000;
      else if (priceRange === '5m-15m') matchPrice = product.price >= 5000000 && product.price <= 15000000;
      else if (priceRange === '15m-30m') matchPrice = product.price >= 15000000 && product.price <= 30000000;
      else if (priceRange === 'above30m') matchPrice = product.price > 30000000;

      return matchCat && matchSearch && matchPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`);
  }, [showToast]);

  const updateCartQuantity = useCallback((id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast("Đã xóa sản phẩm khỏi giỏ hàng", "error");
  }, [showToast]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedVoucher || !PROMO_CODES[appliedVoucher]) return 0;
    return PROMO_CODES[appliedVoucher].discount;
  }, [appliedVoucher]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount);
  }, [cartSubtotal, discountAmount]);

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        showToast("Đã bỏ khỏi danh sách yêu thích");
        return prev.filter(item => item.id !== product.id);
      } else {
        showToast("Đã lưu vào danh sách yêu thích");
        return [...prev, product];
      }
    });
  }, [showToast]);

  const toggleCompare = useCallback((product) => {
    setCompareList(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        if (prev.length >= 3) {
          showToast("Chỉ có thể so sánh tối đa 3 linh kiện cùng lúc!", "error");
          return prev;
        }
        showToast("Đã thêm vào bảng so sánh");
        return [...prev, product];
      }
    });
  }, [showToast]);

  const selectPcBuildItem = useCallback((slotKey, product) => {
    setPcBuild(prev => ({ ...prev, [slotKey]: product }));
    showToast(`Đã chọn ${product.name} cho ${slotKey}`);
  }, [showToast]);

  const removePcBuildItem = useCallback((slotKey) => {
    setPcBuild(prev => {
      const updated = { ...prev };
      delete updated[slotKey];
      return updated;
    });
  }, []);

  const pcBuildSummary = useMemo(() => {
    const selectedItems = Object.values(pcBuild);
    const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const totalPowerConsumption = selectedItems.reduce((sum, item) => sum + (item.powerConsumption || 0), 0);
    
    const cpu = pcBuild['CPU'];
    const mainboard = pcBuild['Mainboard'];
    const psu = pcBuild['Nguồn (PSU)'];

    const socketMismatch = cpu && mainboard && cpu.socket && mainboard.socket && cpu.socket !== mainboard.socket;
    const psuWattage = psu ? (psu.psuWattage || 650) : 0;
    const psuInsufficient = psuWattage > 0 && psuWattage < (totalPowerConsumption + 100);

    return { totalPrice, totalPowerConsumption, socketMismatch, psuWattage, psuInsufficient };
  }, [pcBuild]);

  const addEntirePcToCart = useCallback(() => {
    const items = Object.values(pcBuild);
    if (items.length === 0) {
      showToast("Chưa chọn linh kiện nào cho dàn PC!", "error");
      return;
    }
    items.forEach(item => addToCart(item));
    showToast("Đã thêm toàn bộ dàn PC vào giỏ hàng!");
  }, [pcBuild, addToCart, showToast]);

  const openAdminModal = useCallback((product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        category: product.category || 'CPU',
        price: String(product.price || ''),
        originalPrice: String(product.originalPrice || ''),
        stock: String(product.stock || '10'),
        imageUrl: product.imageUrl || '',
        description: product.description || '',
        powerConsumption: String(product.powerConsumption || '50')
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'CPU',
        price: '',
        originalPrice: '',
        stock: '10',
        imageUrl: '',
        description: '',
        powerConsumption: '50'
      });
    }
    setFormError('');
    setIsAdminModalOpen(true);
  }, []);

  const handleImageFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setFormError('Kích thước ảnh tối đa là 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
        showToast('Đã tải ảnh lên thành công!');
      };
      reader.readAsDataURL(file);
    }
  }, [showToast]);

  const handleAdminFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError('Giá bán phải lớn hơn 0');
      return;
    }

    try {
      if (editingProduct) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', String(editingProduct.id));
        const updatedData = {
          ...formData,
          price: Number(formData.price),
          originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price) * 1.1,
          stock: Number(formData.stock),
          powerConsumption: Number(formData.powerConsumption)
        };
        await setDoc(docRef, updatedData, { merge: true });
        showToast('Đã lưu thay đổi vào Cloud Database!');
      } else {
        const newId = String(Date.now());
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', newId);
        const newProduct = {
          id: newId,
          rating: 5.0,
          reviewCount: 1,
          ...formData,
          price: Number(formData.price),
          originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price) * 1.1,
          stock: Number(formData.stock),
          powerConsumption: Number(formData.powerConsumption)
        };
        await setDoc(docRef, newProduct);
        showToast('Đã thêm sản phẩm mới vào Cloud Database!');
      }
      setIsAdminModalOpen(false);
    } catch (err) {
      showToast('Lỗi lưu Database: ' + err.message, 'error');
    }
  }, [formData, editingProduct, showToast]);

  const confirmDeleteProduct = useCallback(async () => {
    if (deletingProductId) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', String(deletingProductId));
        await deleteDoc(docRef);
        showToast('Đã xóa vĩnh viễn sản phẩm khỏi Database', 'error');
      } catch (err) {
        showToast('Lỗi khi xóa khỏi Database!', 'error');
      }
      setDeletingProductId(null);
    }
  }, [deletingProductId, showToast]);

  const handleApplyVoucher = useCallback((e) => {
    e.preventDefault();
    const code = voucherInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      const v = PROMO_CODES[code];
      if (cartSubtotal < v.minTotal) {
        setVoucherError(`Mã này yêu cầu đơn hàng từ ${formatPrice(v.minTotal)}`);
        return;
      }
      setAppliedVoucher(code);
      setVoucherError('');
      showToast(`Áp dụng mã ${code} thành công!`);
    } else {
      setVoucherError('Mã giảm giá không hợp lệ!');
    }
  }, [voucherInput, cartSubtotal, showToast]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-900 border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-bounce">
          <CheckCircle2 size={20} className={toast.type === 'error' ? 'text-red-400' : 'text-cyan-400'} />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 shadow-2xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('store')}>
            <div className="bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-2.5 rounded-xl text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform">
              <MonitorPlay size={26} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                PC GIÁ RẺ
              </h1>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isDbSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {isDbSynced ? 'Database Connected' : 'Connecting DB...'}
              </span>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input 
              type="text"
              placeholder="Tìm kiếm CPU, VGA RTX 4090, RAM DDR5..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none shadow-inner transition-colors"
            />
            <Search size={18} className="absolute left-3.5 top-3 text-gray-500" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Navigation Links & Action Buttons */}
          <div className="flex items-center gap-3">
            
            <button 
              onClick={() => setView('store')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                view === 'store' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Store size={16} /> Cửa Hàng
            </button>

            <button 
              onClick={() => setView('pc-builder')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                view === 'pc-builder' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Cpu size={16} /> Dựng PC
            </button>

            <button 
              onClick={handleOpenAdmin}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                view === 'admin' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Settings size={16} /> Admin Panel
            </button>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
              
              <button 
                onClick={() => setIsCompareOpen(true)}
                className="relative p-2.5 bg-gray-950 border border-gray-800 hover:border-cyan-500/50 rounded-xl text-gray-300 hover:text-cyan-400 transition-colors"
                title="So sánh"
              >
                <Scale size={18} />
                {compareList.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {compareList.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl text-black font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                title="Giỏ hàng"
              >
                <ShoppingCart size={18} />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-900">
                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                  </span>
                )}
              </button>

            </div>

          </div>

        </div>
      </header>

      {/* Main Body Content */}
      <main className="container mx-auto px-4 py-8">

        {}
        {view === 'store' && (
          <div className="space-y-10">
            
            {/* Banner Flash Sale & Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Banner */}
              <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 via-gray-950 to-blue-950 border border-gray-800 p-8 md:p-10 shadow-2xl flex flex-col justify-between">
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-25 mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-transparent"></div>

                <div className="relative z-10 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-4 uppercase tracking-wider">
                    <Zap size={14} className="animate-bounce" /> Linh Kiện Gaming Chính Hãng 100%
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                    BỨT PHÁ HIỆU NĂNG <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                      CẤU HÌNH ĐỈNH CAO
                    </span>
                  </h2>
                  <p className="text-gray-400 text-xs md:text-sm mb-6 leading-relaxed">
                    Cung cấp các dòng CPU, VGA RTX 40 Series, RAM DDR5, SSD NVMe chính hãng giá rẻ nhất Việt Nam. Hỗ trợ tự built cấu hình PC chuẩn tương thích.
                  </p>
                </div>

                <div className="relative z-10 flex flex-wrap gap-4 text-xs font-semibold text-gray-300 border-t border-gray-800/80 pt-4">
                  <span className="flex items-center gap-1.5 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-800">
                    <ShieldCheck size={16} className="text-cyan-400" /> Bảo hành 36 tháng
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-800">
                    <Truck size={16} className="text-emerald-400" /> Giao hàng siêu tốc 2H
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-800">
                    <Award size={16} className="text-yellow-400" /> Đổi mới 30 ngày
                  </span>
                </div>
              </div>

              {/* Side Flash Sale Box */}
              <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-rose-950/40 border border-rose-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-lg">
                    <Zap size={22} className="animate-bounce" />
                    <span>FLASH SALE GIỜ VÀNG</span>
                  </div>
                  <span className="text-[10px] uppercase bg-rose-500 text-white font-black px-2 py-1 rounded">
                    SL Có Hạn
                  </span>
                </div>

                {/* Hot Flash Sale Item */}
                {products.find(p => p.isFlashSale) && (
                  <div className="py-4 space-y-3">
                    {(() => {
                      const flashItem = products.find(p => p.isFlashSale);
                      return (
                        <>
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-950 border border-gray-800">
                            <SafeImage src={flashItem.imageUrl} alt={flashItem.name} category={flashItem.category} className="w-full h-full object-cover" />
                            <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                              GIẢM {flashItem.originalPrice ? (100 - (flashItem.price / flashItem.originalPrice * 100)).toFixed(0) : 10}%
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{flashItem.name}</h4>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-rose-400">{formatPrice(flashItem.price)}</span>
                            <span className="text-xs text-gray-500 line-through">{formatPrice(flashItem.originalPrice)}</span>
                          </div>
                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-gray-400 font-bold">
                              <span>Đã bán {flashItem.flashSaleSold || 5}/{flashItem.flashSaleTotal || 10}</span>
                              <span className="text-rose-400">Gần hết</span>
                            </div>
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full" 
                                style={{ width: `${((flashItem.flashSaleSold || 5) / (flashItem.flashSaleTotal || 10)) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <button 
                            onClick={() => addToCart(flashItem)}
                            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                          >
                            MUA NGAY GIÁ SỐC
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
              
              {/* Category selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Price range & Sort */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-800">
                
                {/* Price Range Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <Filter size={14} className="text-cyan-400" /> Mức giá:
                  </span>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'under5m', label: 'Dưới 5 triệu' },
                    { id: '5m-15m', label: '5 - 15 triệu' },
                    { id: '15m-30m', label: '15 - 30 triệu' },
                    { id: 'above30m', label: 'Trên 30 triệu' }
                  ].map(priceOption => (
                    <button
                      key={priceOption.id}
                      onClick={() => setPriceRange(priceOption.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        priceRange === priceOption.id
                          ? 'bg-gray-800 text-cyan-400 border border-cyan-500/50'
                          : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                      }`}
                    >
                      {priceOption.label}
                    </button>
                  ))}
                </div>

                {/* Sort & Grid Mode */}
                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-950 border border-gray-800 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    <option value="featured">Nổi bật nhất</option>
                    <option value="price-asc">Giá: Thấp đến Cao</option>
                    <option value="price-desc">Giá: Cao đến Thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>

                  <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
                      title="Xem dạng Lưới"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
                      title="Xem dạng Danh sách"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Product Cards Listing */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-gray-800 space-y-3">
                <Box size={48} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">Không tìm thấy linh kiện phù hợp với tìm kiếm của bạn.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('Tất cả'); setPriceRange('all'); }} 
                  className="px-4 py-2 bg-gray-800 text-cyan-400 rounded-xl text-xs font-bold hover:bg-gray-700"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                  const isWishlisted = wishlist.some(w => w.id === product.id);
                  const isCompared = compareList.some(c => c.id === product.id);

                  return (
                    <div 
                      key={product.id} 
                      className="group bg-gray-900 border border-gray-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative"
                    >
                      <div>
                        {/* Image Preview Area */}
                        <div className="relative aspect-video w-full bg-gray-950 overflow-hidden">
                          <SafeImage 
                            src={product.imageUrl} 
                            alt={product.name} 
                            category={product.category}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <span className="absolute top-3 left-3 bg-gray-950/80 backdrop-blur-md border border-gray-800 text-cyan-400 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                            {product.category}
                          </span>

                          {/* Quick Actions overlay */}
                          <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button 
                              onClick={() => toggleWishlist(product)}
                              className={`p-2 rounded-lg backdrop-blur-md transition-all ${
                                isWishlisted ? 'bg-rose-500 text-white' : 'bg-gray-950/80 text-gray-300 hover:text-rose-400'
                              }`}
                              title="Yêu thích"
                            >
                              <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>

                            <button 
                              onClick={() => toggleCompare(product)}
                              className={`p-2 rounded-lg backdrop-blur-md transition-all ${
                                isCompared ? 'bg-cyan-500 text-black' : 'bg-gray-950/80 text-gray-300 hover:text-cyan-400'
                              }`}
                              title="So sánh sản phẩm"
                            >
                              <Scale size={15} />
                            </button>

                            <button 
                              onClick={() => setSelectedProductDetail(product)}
                              className="p-2 bg-gray-950/80 hover:bg-cyan-500 hover:text-black text-gray-300 rounded-lg backdrop-blur-md"
                              title="Xem nhanh"
                            >
                              <Eye size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                            <Star size={14} fill="currentColor" />
                            <span>{product.rating || 5.0}</span>
                            <span className="text-gray-500 font-normal">({product.reviewCount || 10} đánh giá)</span>
                          </div>

                          <h4 
                            onClick={() => setSelectedProductDetail(product)}
                            className="font-bold text-sm leading-snug line-clamp-2 text-gray-100 group-hover:text-cyan-400 transition-colors cursor-pointer min-h-[40px]" 
                            title={product.name}
                          >
                            {product.name}
                          </h4>

                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {product.description || "Linh kiện vi tính cao cấp dành cho dàn PC chuyên nghiệp."}
                          </p>
                        </div>
                      </div>

                      {/* Footer / Price & Add */}
                      <div className="p-5 pt-0 mt-2 flex items-center justify-between border-t border-gray-800/50">
                        <div>
                          <span className="text-[10px] text-gray-500 block font-semibold uppercase">Giá niêm yết</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-cyan-400">{formatPrice(product.price)}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[11px] text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                            )}
                          </div>
                        </div>

                        <button 
                          onClick={() => addToCart(product)}
                          className="bg-cyan-500 hover:bg-cyan-400 text-black p-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                          title="Thêm vào giỏ"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className="bg-gray-900 border border-gray-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-24 h-24 rounded-xl bg-gray-950 overflow-hidden shrink-0 border border-gray-800">
                        <SafeImage src={product.imageUrl} alt={product.name} category={product.category} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-cyan-400 bg-gray-950 px-2 py-0.5 rounded border border-gray-800 uppercase">
                          {product.category}
                        </span>
                        <h4 
                          onClick={() => setSelectedProductDetail(product)}
                          className="font-bold text-base text-gray-100 hover:text-cyan-400 cursor-pointer"
                        >
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-400 line-clamp-1 max-w-xl">{product.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 border-gray-800 pt-3 md:pt-0">
                      <div className="text-right">
                        <span className="text-lg font-black text-cyan-400 block">{formatPrice(product.price)}</span>
                        <span className="text-xs text-emerald-400 font-semibold">Còn hàng ({product.stock})</span>
                      </div>
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      >
                        <ShoppingCart size={16} /> Thêm Giỏ Hàng
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {}
        {view === 'pc-builder' && (
          <div className="space-y-8">
            {/* Header PC Builder */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-950 to-purple-950 border border-purple-500/30 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
                  Công Cụ Tự Dựng Cấu Hình PC
                </span>
                <h2 className="text-3xl font-black text-white">Xây Dựng Cấu Hình Máy Tính</h2>
                <p className="text-xs text-gray-400 max-w-xl">
                  Lựa chọn linh kiện thích hợp cho bộ máy của bạn. Hệ thống tự động tính tổng điện năng tiêu thụ và kiểm tra độ tương thích kĩ thuật.
                </p>
              </div>

              {/* Box Tổng Tiền & Nút Thêm Giỏ Hàng */}
              <div className="bg-gray-950 border border-gray-800 p-5 rounded-2xl min-w-[280px] text-center space-y-3">
                <span className="text-xs text-gray-400 font-bold block">Tổng Chi Phí Dàn PC:</span>
                <span className="text-2xl font-black text-cyan-400 block">{formatPrice(pcBuildSummary.totalPrice)}</span>
                
                <button
                  onClick={addEntirePcToCart}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                  <ShoppingCart size={16} /> Thêm Cả Bộ Vào Giỏ Hàng
                </button>
              </div>
            </div>

            {/* Cảnh Báo Tương Thích */}
            {(pcBuildSummary.socketMismatch || pcBuildSummary.psuInsufficient) && (
              <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-4 flex items-start gap-3 text-rose-300 text-xs">
                <AlertTriangle size={20} className="shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-bold text-sm block">Cảnh báo không tương thích linh kiện:</strong>
                  {pcBuildSummary.socketMismatch && (
                    <p>• Socket của CPU và Bo mạch chủ (Mainboard) không khớp nhau. Vui lòng chọn lại!</p>
                  )}
                  {pcBuildSummary.psuInsufficient && (
                    <p>• Công suất nguồn PSU ({pcBuildSummary.psuWattage}W) không đủ cho tổng điện năng linh kiện ({pcBuildSummary.totalPowerConsumption}W + 100W dự phòng). Nên nâng cấp PSU!</p>
                  )}
                </div>
              </div>
            )}

            {/* Thông số nguồn điện tổng */}
            <div className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-800 text-xs">
              <span className="text-gray-400 font-semibold">Ước tính tiêu thụ điện (TDP): <strong className="text-amber-400">{pcBuildSummary.totalPowerConsumption} Watts</strong></span>
              <span className="text-gray-400 font-semibold">Công suất PSU chọn: <strong className="text-cyan-400">{pcBuildSummary.psuWattage} Watts</strong></span>
            </div>

            {/* Slot Linh Kiện List */}
            <div className="space-y-4">
              {BUILD_SLOTS.map(slot => {
                const SlotIcon = slot.icon;
                const selectedItem = pcBuild[slot.key];

                return (
                  <div key={slot.key} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Header Slot */}
                    <div className="flex items-center gap-3 w-full md:w-1/3">
                      <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl text-cyan-400">
                        <SlotIcon size={22} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block">{slot.name}</span>
                        <span className="text-sm font-bold text-white">
                          {selectedItem ? selectedItem.name : "Chưa chọn linh kiện"}
                        </span>
                      </div>
                    </div>

                    {/* Selected Item Specs or Price */}
                    <div className="w-full md:w-1/3 text-left md:text-center">
                      {selectedItem ? (
                        <span className="text-base font-black text-cyan-400">{formatPrice(selectedItem.price)}</span>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Vui lòng chọn linh kiện bên phải</span>
                      )}
                    </div>

                    {/* Button Select or Remove */}
                    <div className="w-full md:w-auto flex justify-end gap-2">
                      {selectedItem ? (
                        <button
                          onClick={() => removePcBuildItem(slot.key)}
                          className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold border border-rose-500/30 flex items-center gap-1"
                        >
                          <X size={14} /> Xóa chọn
                        </button>
                      ) : (
                        <select
                          onChange={(e) => {
                            const prodId = String(e.target.value);
                            const found = products.find(p => String(p.id) === prodId);
                            if (found) selectPcBuildItem(slot.key, found);
                          }}
                          defaultValue=""
                          className="bg-gray-950 border border-gray-800 text-gray-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-semibold max-w-[220px]"
                        >
                          <option value="" disabled>+ Chọn {slot.name}</option>
                          {products.filter(p => p.category === slot.key).map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} - {formatPrice(p.price)}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {}
        {view === 'admin' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Settings className="text-cyan-400" /> Quản Lý Kho Linh Kiện (pcgiare.com)
                </h2>
                <p className="text-xs text-gray-400 mt-1">Tùy chỉnh thông tin, cập nhật hình ảnh, giá bán và số lượng tồn kho.</p>
              </div>

              <button 
                onClick={() => openAdminModal()}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-5 py-3 rounded-xl flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
              >
                <Plus size={18} /> Thêm Linh Kiện Mới
              </button>
            </div>

            {/* Bảng Sản Phẩm Admin */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="p-4">Hình ảnh</th>
                      <th className="p-4">Tên sản phẩm</th>
                      <th className="p-4">Danh mục</th>
                      <th className="p-4">Đơn giá</th>
                      <th className="p-4">Tồn kho</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-sm">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-500">Chưa có sản phẩm nào trong kho.</td>
                      </tr>
                    ) : (
                      products.map(product => (
                        <tr key={product.id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="p-4">
                            <div className="w-14 h-14 rounded-lg bg-gray-950 overflow-hidden border border-gray-800">
                              <SafeImage 
                                src={product.imageUrl} 
                                alt={product.name} 
                                category={product.category}
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-gray-200 max-w-xs">
                            {product.name}
                            <p className="text-xs text-gray-500 font-normal line-clamp-1">{product.description}</p>
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-md bg-gray-800 text-cyan-400 text-xs font-bold border border-gray-700">
                              {product.category}
                            </span>
                          </td>
                          <td className="p-4 text-cyan-400 font-bold">{formatPrice(product.price)}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              product.stock > 5 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}>
                              {product.stock} cái
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openAdminModal(product)}
                                className="p-2 bg-gray-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-gray-300 rounded-lg border border-gray-700 transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => setDeletingProductId(product.id)}
                                className="p-2 bg-gray-800 hover:bg-rose-500/20 hover:text-rose-400 text-gray-300 rounded-lg border border-gray-700 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {}

      {/* 1. Modal So Sánh Sản Phẩm */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-4xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Scale className="text-cyan-400" /> Bảng So Sánh Linh Kiện ({compareList.length}/3)
              </h3>
              <button onClick={() => setIsCompareOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {compareList.map(item => (
                <div key={item.id} className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-3 relative">
                  <button 
                    onClick={() => toggleCompare(item)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-rose-400 p-1"
                  >
                    <X size={16} />
                  </button>

                  <div className="aspect-video rounded-xl bg-gray-900 overflow-hidden">
                    <SafeImage src={item.imageUrl} alt={item.name} category={item.category} className="w-full h-full object-cover" />
                  </div>

                  <h4 className="font-bold text-sm text-white line-clamp-2">{item.name}</h4>
                  <div className="text-lg font-black text-cyan-400">{formatPrice(item.price)}</div>

                  <div className="space-y-1.5 text-xs text-gray-400 border-t border-gray-800 pt-3">
                    <div><strong>Danh mục:</strong> {item.category}</div>
                    <div><strong>Công suất:</strong> {item.powerConsumption || 'N/A'}W</div>
                    <div><strong>Đánh giá:</strong> {item.rating || 5.0}★</div>
                    <div><strong>Tồn kho:</strong> {item.stock} cái</div>
                  </div>

                  <button 
                    onClick={() => { addToCart(item); setIsCompareOpen(false); }}
                    className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs mt-2"
                  >
                    Chọn mua
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Thêm / Sửa Sản Phẩm (Admin) */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-950/50">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {editingProduct ? <Edit size={20} className="text-cyan-400" /> : <Plus size={20} className="text-cyan-400" />}
                {editingProduct ? 'Chỉnh Sửa Linh Kiện' : 'Thêm Linh Kiện Mới'}
              </h3>
              <button onClick={() => setIsAdminModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAdminFormSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Tên sản phẩm / Linh kiện *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Vd: VGA ASUS ROG Strix RTX 4080 Super"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Danh mục *</label>
                  <select
                    value={formData.category || 'CPU'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {CATEGORIES.filter(c => c !== 'Tất cả').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Giá bán (VNĐ) *</label>
                  <input 
                    type="number" 
                    required
                    min="1000"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Vd: 15000000"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Số lượng kho</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Tùy chỉnh hình ảnh */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Hình ảnh sản phẩm</label>
                  <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('file')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        imageInputMode === 'file' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Tải File Ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        imageInputMode === 'url' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Đường Dẫn URL
                    </button>
                  </div>
                </div>

                {imageInputMode === 'file' ? (
                  <div className="border-2 border-dashed border-gray-800 hover:border-cyan-500/50 rounded-2xl p-6 text-center bg-gray-950 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileChange}
                      className="hidden" 
                      id="product-image-file" 
                    />
                    <label htmlFor="product-image-file" className="cursor-pointer flex flex-col items-center justify-center">
                      <Upload size={32} className="text-cyan-400 mb-2" />
                      <span className="text-sm font-semibold text-gray-200">Bấm để chọn file ảnh từ máy tính</span>
                      <span className="text-xs text-gray-500 mt-1">Hỗ trợ JPG, PNG, WEBP (Tối đa 3MB)</span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <input 
                      type="url" 
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/hinh-anh-vga.jpg"
                      className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white pl-10 focus:outline-none focus:border-cyan-500"
                    />
                    <LinkIcon size={18} className="absolute left-3 top-3.5 text-gray-500" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Thông số / Mô tả linh kiện</label>
                <textarea 
                  rows="3"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập thông số kỹ thuật, bảo hành, công nghệ nổi bật..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAdminModalOpen(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl text-sm"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold py-3 rounded-xl text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  {editingProduct ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Xem Chi Tiết Linh Kiện */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedProductDetail(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-950/80 hover:bg-gray-800 text-gray-400 hover:text-white rounded-full backdrop-blur-md"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-gray-950 aspect-square md:aspect-auto relative overflow-hidden">
                <SafeImage 
                  src={selectedProductDetail.imageUrl} 
                  alt={selectedProductDetail.name} 
                  category={selectedProductDetail.category}
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="p-6 md:p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold rounded-lg uppercase">
                    {selectedProductDetail.category}
                  </span>
                  <h3 className="text-2xl font-bold text-white leading-tight">{selectedProductDetail.name}</h3>
                  <div className="text-2xl font-black text-cyan-400">{formatPrice(selectedProductDetail.price)}</div>
                  
                  <div className="space-y-2 border-t border-gray-800 pt-4">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Thông số kỹ thuật:</span>
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedProductDetail.description || 'Chưa có thông số chi tiết.'}</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-gray-800 pt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                    <span>Tình trạng:</span>
                    <span className="text-emerald-400 font-bold">Còn hàng ({selectedProductDetail.stock} sản phẩm)</span>
                  </div>

                  <button 
                    onClick={() => {
                      addToCart(selectedProductDetail);
                      setSelectedProductDetail(null);
                    }}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    <ShoppingCart size={18} /> Thêm Vào Giỏ Hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Giỏ Hàng Slider Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col">
              
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart className="text-cyan-400" /> Giỏ Hàng Của Bạn ({cart.length})
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* List item trong giỏ */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <ShoppingCart size={48} className="mx-auto text-gray-700" />
                    <p className="text-gray-500 text-sm">Giỏ hàng hiện đang trống.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-950 rounded-2xl border border-gray-800">
                      <div className="w-16 h-16 rounded-xl bg-gray-900 overflow-hidden shrink-0">
                        <SafeImage 
                          src={item.imageUrl} 
                          alt={item.name} 
                          category={item.category}
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold truncate text-gray-200">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-rose-400 p-1">
                            <X size={14} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-black text-cyan-400">{formatPrice(item.price)}</span>
                          
                          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-2 py-0.5">
                            <button onClick={() => updateCartQuantity(item.id, -1)} className="text-gray-400 hover:text-white">
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold text-gray-200">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.id, 1)} className="text-gray-400 hover:text-white">
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Form mã giảm giá & Thanh toán */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-800 space-y-4 bg-gray-950">
                  
                  {/* Ô nhập Mã giảm giá */}
                  <form onSubmit={handleApplyVoucher} className="space-y-1">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Mã giảm giá (ví dụ: PCGIARE500K)" 
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 uppercase"
                      />
                      <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-cyan-400 px-3 py-2 rounded-xl text-xs font-bold border border-gray-700">
                        Áp Dụng
                      </button>
                    </div>
                    {voucherError && <span className="text-[11px] text-rose-400 block">{voucherError}</span>}
                    {appliedVoucher && <span className="text-[11px] text-emerald-400 font-semibold block">✓ Đã dùng mã: {appliedVoucher}</span>}
                  </form>

                  <div className="space-y-1 text-xs text-gray-400 border-t border-gray-800/60 pt-3">
                    <div className="flex justify-between">
                      <span>Tạm tính:</span>
                      <span className="text-white font-bold">{formatPrice(cartSubtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Giảm giá:</span>
                        <span className="font-bold">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-800 text-white font-bold">
                      <span>Tổng tiền thanh toán:</span>
                      <span className="text-xl font-black text-cyan-400">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                  >
                    Tiến Hành Đặt Hàng <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Đặt Hàng */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-white">Xác Nhận Đặt Hàng</h3>
              <p className="text-xs text-gray-400">Giao hàng nhanh 2H tại TP.HCM & Hà Nội</p>
            </div>

            <div className="bg-gray-950 p-4 rounded-xl space-y-2 border border-gray-800 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Tổng tiền hàng:</span>
                <span className="font-bold text-cyan-400">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const ordersColRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
                await addDoc(ordersColRef, {
                  customer: checkoutData,
                  items: cart,
                  totalAmount: cartTotal,
                  createdAt: new Date().toISOString(),
                  status: 'pending'
                });

                setCart([]);
                setIsCheckoutOpen(false);
                setCheckoutData({ fullName: '', phone: '', address: '', paymentMethod: 'cod' });
                showToast("Đặt hàng thành công! Đơn hàng đã được lưu vào Cloud Database.");
              } catch (err) {
                showToast("Lỗi khi lưu đơn hàng!", "error");
              }
            }} className="space-y-3">
              <input 
                type="text" 
                required 
                value={checkoutData.fullName || ''}
                onChange={(e) => setCheckoutData({ ...checkoutData, fullName: e.target.value })}
                placeholder="Họ và tên người nhận" 
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 text-white"
              />
              <input 
                type="tel" 
                required 
                value={checkoutData.phone || ''}
                onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                placeholder="Số điện thoại nhận hàng" 
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 text-white"
              />
              <input 
                type="text" 
                required 
                value={checkoutData.address || ''}
                onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                placeholder="Địa chỉ giao hàng chi tiết" 
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 text-white"
              />

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 font-bold py-3 rounded-xl text-sm"
                >
                  Đóng
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  Hoàn Tất Đặt Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Xóa Sản Phẩm */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 text-center space-y-4">
            <Trash2 size={40} className="mx-auto text-rose-500" />
            <h3 className="text-lg font-bold text-white">Xác nhận xóa sản phẩm?</h3>
            <p className="text-xs text-gray-400">Thao tác này sẽ xóa vĩnh viễn linh kiện khỏi danh mục bán hàng.</p>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setDeletingProductId(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl text-sm"
              >
                Hủy
              </button>
              <button 
                onClick={confirmDeleteProduct}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-sm"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    {/* --- THANH LIÊN HỆ MẠNG XÃ HỘI (GÓC DƯỚI BÊN TRÁI) --- */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
        {/* Nút Zalo */}
        <a href="https://zalo.me/0999999999" target="_blank" rel="noreferrer" 
           className="flex items-center gap-2 bg-[#0068ff] hover:bg-blue-600 text-white px-4 py-3 rounded-full shadow-[0_0_15px_rgba(0,104,255,0.4)] transition-transform hover:scale-110 font-bold text-sm">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" className="w-6 h-6 bg-white rounded-full" />
          Chat Zalo
        </a>

        {/* Nút Facebook Messenger */}
        <a href="https://m.me/ten_page_cua_ban" target="_blank" rel="noreferrer"
           className="flex items-center gap-2 bg-[#0866ff] hover:bg-blue-600 text-white px-4 py-3 rounded-full shadow-[0_0_15px_rgba(8,102,255,0.4)] transition-transform hover:scale-110 font-bold text-sm">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" className="w-6 h-6 bg-white rounded-full" />
          Facebook
        </a>

        {/* Nút TikTok */}
        <a href="https://tiktok.com/@ten_kenh_cua_ban" target="_blank" rel="noreferrer"
           className="flex items-center gap-2 bg-black border border-gray-700 hover:bg-gray-800 text-white px-4 py-3 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform hover:scale-110 font-bold text-sm">
          {/* Dùng icon svg trắng của Tiktok */}
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
          TikTok
        </a>
      </div>
    </div>
  );
}