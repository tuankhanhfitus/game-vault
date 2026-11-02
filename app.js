const firebaseConfig = {
  apiKey: "AIzaSyCE96cqlhrxIdRFLGFbcOnFpeH0wVob8TU",
  authDomain: "game-vault-cloud-e29eb.firebaseapp.com",
  projectId: "game-vault-cloud-e29eb",
  storageBucket: "game-vault-cloud-e29eb.firebasestorage.app",
  messagingSenderId: "838807435904",
  appId: "1:838807435904:web:42c8b91fc76bea46eb8465"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const MASTER_KEY_STORAGE = 'GV_SAVED_MASTER_PASS_V1';

let currentUser = null;
let masterKey = null;
let accounts = [];
let platformIcons = {};
let bankPinCode = null;
let isBankUnlocked = false;
let sortableInstance = null;

let isRegisterMode = false;
let currentCategoryFilter = 'ALL';

function getPlatformSharedIcon(gameName) {
  if (!gameName) return '';
  return platformIcons[gameName.trim().toLowerCase()] || '';
}

function getPlatformIcon(item) {
  const sharedImg = getPlatformSharedIcon(item.game);
  if (sharedImg) {
    return `<img src="${sharedImg}" class="w-8 h-8 rounded-xl object-cover border border-slate-700 shrink-0" onerror="this.style.display='none'">`;
  }

  const n = (item.game || '').toLowerCase().trim();
  
  if (n.includes('facebook') || n === 'fb') return `<div class="w-8 h-8 rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/40 flex items-center justify-center shrink-0"><svg class="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>`;
  if (n.includes('google') || n.includes('gmail')) return `<div class="w-8 h-8 rounded-xl bg-[#EA4335]/20 border border-[#EA4335]/40 flex items-center justify-center shrink-0"><svg class="w-4 h-4 fill-[#EA4335]" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg></div>`;
  if (n.includes('tiktok')) return `<div class="w-8 h-8 rounded-xl bg-[#EE1D52]/20 border border-[#EE1D52]/40 flex items-center justify-center shrink-0"><svg class="w-4 h-4 fill-[#EE1D52]" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></div>`;
  if (n.includes('telegram') || n === 'tele') return `<div class="w-8 h-8 rounded-xl bg-[#229ED9]/20 border border-[#229ED9]/40 flex items-center justify-center shrink-0"><svg class="w-4 h-4 fill-[#229ED9]" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.716-.962 4.084-1.362 5.75-.17.708-.431.945-.683.968-.55.05-1.005-.364-1.538-.713-.833-.546-1.304-.886-2.113-1.42-.934-.616-.328-.955.204-1.507.139-.144 2.55-2.336 2.597-2.535.006-.025.011-.118-.045-.168-.056-.05-.138-.033-.198-.02-.085.019-1.439.914-4.062 2.686-.384.263-.733.393-1.045.386-.344-.008-1.006-.195-1.498-.355-.604-.196-1.084-.3-1.042-.633.022-.174.266-.352.732-.535 2.868-1.249 4.782-2.073 5.74-2.472 2.73-.137 3.298 1.096 3.298 1.096z"/></svg></div>`;
  
  if (n.includes('steam')) return `<div class="w-8 h-8 rounded-xl bg-slate-700/50 border border-cyan-400/40 flex items-center justify-center shrink-0"><svg class="w-4 h-4 fill-cyan-400" viewBox="0 0 24 24"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.008l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.811c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.155-3.331-2.677L.277 15.08C1.72 20.312 6.46 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12z"/></svg></div>`;
  if (n.includes('riot') || n.includes('valorant') || n.includes('lol')) return `<div class="w-8 h-8 rounded-xl bg-[#D13639]/20 border border-[#D13639]/40 flex items-center justify-center shrink-0"><svg class="w-4 h-4 fill-[#D13639]" viewBox="0 0 24 24"><path d="M13.414 1.707l-9.043 4.22 3.037 11.836 3.04-.647-.947-3.69 1.838-.392.83 3.235 2.072-.442-.832-3.236 1.839-.391.83 3.235 2.072-.442-.832-3.235 1.84-.392.83 3.235 3.003-.64L19.467 4.19zm-3.064 18.06l-3.315.706.745 2.905 3.314-.707zm5.955-1.267l-3.313.706.744 2.905 3.314-.706z"/></svg></div>`;

  if (n.includes('momo')) return `<div class="w-8 h-8 rounded-xl bg-[#A50064]/20 border border-[#A50064]/40 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#A50064]">MM</div>`;
  if (n.includes('vietcombank') || n === 'vcb') return `<div class="w-8 h-8 rounded-xl bg-[#71C25A]/20 border border-[#71C25A]/40 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#71C25A]">VCB</div>`;
  if (n.includes('techcombank') || n === 'tcb') return `<div class="w-8 h-8 rounded-xl bg-[#EA1C24]/20 border border-[#EA1C24]/40 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#EA1C24]">TCB</div>`;
  if (n.includes('mb') || n.includes('mbbank')) return `<div class="w-8 h-8 rounded-xl bg-[#1431DF]/20 border border-[#1431DF]/40 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#4B68FF]">MB</div>`;
  if (n.includes('binance')) return `<div class="w-8 h-8 rounded-xl bg-[#FCD535]/20 border border-[#FCD535]/40 flex items-center justify-center shrink-0"><svg class="w-4 h-4 fill-[#FCD535]" viewBox="0 0 24 24"><path d="M12.01 4.908L8.12 8.795H4.225l7.785-7.785 7.77 7.785h-3.895L12.01 4.908zM15.9 8.795l3.895 3.895-3.895 3.895h3.895l3.895-3.895-3.895-3.895H15.9zm-7.78 0H4.225L.33 12.69l3.895 3.895h3.895L4.225 12.69 8.12 8.795zm3.89 3.895l-3.895 3.895h7.79l-3.895-3.895zm0 2.308l2.022-2.022L12.01 10.954l-2.022 2.022 2.022 2.022zm0 4.197l-3.895-3.895H4.225l7.785 7.785 7.77-7.785h-3.895l-3.895 3.895z"/></svg></div>`;
  if (n.includes('paypal')) return `<div class="w-8 h-8 rounded-xl bg-[#00457C]/20 border border-[#00457C]/40 flex items-center justify-center shrink-0"><svg class="w-4 h-4 fill-[#0079C1]" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/></svg></div>`;

  const firstLetter = (item.game || 'V').trim().charAt(0).toUpperCase();
  let bgGrad = 'from-cyan-500/20 to-purple-500/20 text-cyan-400 border-cyan-500/40';
  if (item.category === 'SOCIAL') bgGrad = 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/40';
  if (item.category === 'BANK') bgGrad = 'from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/40';

  return `<div class="w-8 h-8 rounded-xl bg-gradient-to-tr ${bgGrad} border flex items-center justify-center font-bold font-gaming text-sm shrink-0">${firstLetter}</div>`;
}

function handleGameNameInput(val) {
  const existing = getPlatformSharedIcon(val);
  if (existing) {
    if (existing.startsWith('data:image')) document.getElementById('accCustomIconBase64').value = existing;
    else document.getElementById('accIconUrl').value = existing;
    updateIconPreview(existing);
  }
}

function handleIconFileSelect(event) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = 80; canvas.height = 80;
      canvas.getContext('2d').drawImage(img, 0, 0, 80, 80);
      const compressed = canvas.toDataURL('image/webp', 0.85);
      document.getElementById('accCustomIconBase64').value = compressed;
      document.getElementById('accIconUrl').value = '';
      updateIconPreview(compressed);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleIconUrlInput(url) {
  document.getElementById('accCustomIconBase64').value = '';
  updateIconPreview(url.trim());
}

function updateIconPreview(src) {
  const box = document.getElementById('iconPreviewBox');
  const removeBtn = document.getElementById('removeIconBtn');
  if (src) {
    box.innerHTML = `<img src="${src}" class="w-full h-full object-cover">`;
    removeBtn.classList.remove('hidden');
  } else {
    box.innerHTML = `<i data-lucide="image" class="w-5 h-5"></i>`;
    removeBtn.classList.add('hidden');
    lucide.createIcons();
  }
}

function clearCustomIcon() {
  document.getElementById('accCustomIconBase64').value = '';
  document.getElementById('accIconUrl').value = '';
  document.getElementById('accIconFileInput').value = '';
  updateIconPreview('');
}

window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initDragAndDrop();

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      if (localStorage.getItem(MASTER_KEY_STORAGE)) {
        masterKey = localStorage.getItem(MASTER_KEY_STORAGE);
        await syncFromCloud();
        document.getElementById('lockScreen').classList.add('hidden');
      } else {
        document.getElementById('lockScreen').classList.remove('hidden');
        document.getElementById('cloudEmail').value = user.email || '';
        document.getElementById('cloudEmail').readOnly = true;
      }
    } else {
      document.getElementById('lockScreen').classList.remove('hidden');
    }
  });
});

function initDragAndDrop() {
  const grid = document.getElementById('accountsGrid');
  if (!grid) return;

  sortableInstance = new Sortable(grid, {
    animation: 220,
    handle: '.drag-handle',
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    onEnd: async function () {
      const cardElements = Array.from(grid.children);
      const visibleIds = cardElements.map(el => el.getAttribute('data-id')).filter(Boolean);

      if (visibleIds.length <= 1) return;

      const originalIndices = [];
      const movedItemsMap = {};

      accounts.forEach((acc, idx) => {
        if (visibleIds.includes(acc.id)) {
          originalIndices.push(idx);
          movedItemsMap[acc.id] = acc;
        }
      });

      originalIndices.forEach((origIdx, i) => {
        const newId = visibleIds[i];
        accounts[origIdx] = movedItemsMap[newId];
      });

      await pushToCloud();
      showToast('Đã lưu vị trí sắp xếp mới!');
    }
  });
}

function openBankTab() {
  if (isBankUnlocked) {
    applyCategoryTab('BANK');
    return;
  }
  document.getElementById('pinInput').value = '';
  if (!bankPinCode) {
    document.getElementById('pinModalTitle').innerText = 'Tạo Mã PIN Cấp 2';
    document.getElementById('pinModalSub').innerText = 'Tạo mã PIN 4 số để bảo vệ Két Ngân Hàng. Hãy nhớ kỹ mã này!';
  } else {
    document.getElementById('pinModalTitle').innerText = 'Mở Khóa Ngân Hàng';
    document.getElementById('pinModalSub').innerText = 'Nhập mã PIN 4 số của bạn để xem tài khoản.';
  }
  document.getElementById('pinModal').classList.remove('hidden');
  document.getElementById('pinModal').classList.add('flex');
  setTimeout(() => document.getElementById('pinInput').focus(), 100);
}

function closePinModal() {
  document.getElementById('pinModal').classList.add('hidden');
  document.getElementById('pinModal').classList.remove('flex');
}

function submitPin(e) {
  e.preventDefault();
  const pin = document.getElementById('pinInput').value.trim();
  if (pin.length < 4) {
    showToast('Mã PIN phải đủ 4 số!');
    return;
  }
  
  if (!bankPinCode) {
    bankPinCode = pin;
    pushToCloud();
    isBankUnlocked = true;
    closePinModal();
    applyCategoryTab('BANK');
    showToast('Đã tạo mã PIN & Mở khóa Két Ngân Hàng!');
  } else {
    if (pin === bankPinCode) {
      isBankUnlocked = true;
      closePinModal();
      applyCategoryTab('BANK');
      showToast('Đã mở khóa Két Ngân Hàng!');
    } else {
      showToast('Mã PIN không chính xác!');
      document.getElementById('pinInput').value = '';
    }
  }
}

function setCategoryTab(category) {
  if (category === 'BANK') {
    openBankTab();
  } else {
    isBankUnlocked = false; 
    applyCategoryTab(category);
  }
}

function applyCategoryTab(category) {
  currentCategoryFilter = category;
  const tabs = [
    { id: 'tabCatAll', cat: 'ALL', baseCls: 'text-cyan-300 border-cyan-500/50 bg-cyan-500/20' },
    { id: 'tabCatGame', cat: 'GAME', baseCls: 'text-purple-300 border-purple-500/50 bg-purple-500/20' },
    { id: 'tabCatSocial', cat: 'SOCIAL', baseCls: 'text-pink-300 border-pink-500/50 bg-pink-500/20' },
    { id: 'tabCatBank', cat: 'BANK', baseCls: 'text-rose-300 border-rose-500/50 bg-rose-500/20' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.id);
    if (t.cat === category) {
      btn.className = `shrink-0 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium border flex items-center gap-1.5 transition ${t.baseCls}`;
    } else {
      btn.className = "shrink-0 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60 flex items-center gap-1.5 transition";
    }
  });

  const select = document.getElementById('platformFilterSelect');
  if (select) select.value = 'ALL';

  updatePlatformFilter(true);
  renderAccounts();
}

function switchAuthTab(mode) {
  isRegisterMode = (mode === 'register');
  document.getElementById('tabLoginBtn').className = isRegisterMode ? 'flex-1 py-2 text-slate-400' : 'flex-1 py-2 text-cyan-400 border-b-2 border-cyan-400';
  document.getElementById('tabRegisterBtn').className = !isRegisterMode ? 'flex-1 py-2 text-slate-400' : 'flex-1 py-2 text-cyan-400 border-b-2 border-cyan-400';
  document.getElementById('authSubmitBtn').innerText = isRegisterMode ? 'Đăng Ký Tài Khoản Mới' : 'Đăng Nhập & Đồng Bộ';
  document.getElementById('authErrorMsg').classList.add('hidden');
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('cloudEmail').value.trim();
  const password = document.getElementById('cloudPassword').value;
  const masterPass = document.getElementById('masterPasswordInput').value;
  const errorEl = document.getElementById('authErrorMsg');

  try {
    errorEl.classList.add('hidden');
    if (isRegisterMode) {
      const res = await auth.createUserWithEmailAndPassword(email, password);
      currentUser = res.user;
    } else {
      const res = await auth.signInWithEmailAndPassword(email, password);
      currentUser = res.user;
    }

    masterKey = masterPass;
    localStorage.setItem(MASTER_KEY_STORAGE, masterKey);
    await syncFromCloud();
    document.getElementById('lockScreen').classList.add('hidden');
    showToast('Đã kết nối đám mây!');
  } catch (err) {
    errorEl.innerText = err.message;
    errorEl.classList.remove('hidden');
  }
}

async function syncFromCloud() {
  if (!currentUser || !masterKey) return;
  const docRef = db.collection('vaults').doc(currentUser.uid);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    try {
      const bytes = CryptoJS.AES.decrypt(docSnap.data().payload, masterKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) throw new Error();
      
      const parsed = JSON.parse(decrypted);
      let settingsObj = {};

      if (Array.isArray(parsed)) {
        accounts = parsed;
        platformIcons = {};
      } else {
        accounts = parsed.accounts || [];
        platformIcons = parsed.platformIcons || {};
        settingsObj = parsed.settings || {};
      }

      bankPinCode = settingsObj.bankPinCode || null;

      accounts.forEach(a => {
        if (!a.category) a.category = 'GAME';
        if (a.iconBase64 || a.iconUrl) {
          const k = (a.game || '').trim().toLowerCase();
          if (k && !platformIcons[k]) platformIcons[k] = a.iconBase64 || a.iconUrl;
        }
      });
    } catch (e) {
      alert('Sai Master Password! Vui lòng tải lại trang và nhập đúng khóa bảo vệ.');
      localStorage.removeItem(MASTER_KEY_STORAGE);
      document.getElementById('lockScreen').classList.remove('hidden');
      accounts = [];
    }
  } else {
    accounts = [];
    platformIcons = {};
    bankPinCode = null;
  }
  isBankUnlocked = false;
  updateTrashCount();
  applyCategoryTab('ALL');
}

async function pushToCloud() {
  if (!currentUser || !masterKey) return;
  const packageData = {
    accounts: accounts,
    platformIcons: platformIcons,
    settings: { bankPinCode: bankPinCode }
  };
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(packageData), masterKey).toString();

  await db.collection('vaults').doc(currentUser.uid).set({
    payload: encrypted,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  updateTrashCount();
}

function lockVault() {
  const modal = document.getElementById('logoutModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  lucide.createIcons();
}

function closeLogoutModal() {
  const modal = document.getElementById('logoutModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function confirmLogout() {
  closeLogoutModal();
  auth.signOut();
  localStorage.removeItem(MASTER_KEY_STORAGE);
  currentUser = null;
  masterKey = null;
  accounts = [];
  platformIcons = {};
  bankPinCode = null;
  isBankUnlocked = false;
  document.getElementById('cloudEmail').readOnly = false;
  document.getElementById('accountsGrid').innerHTML = '';
  document.getElementById('lockScreen').classList.remove('hidden');
  showToast('Đã đăng xuất và khóa két an toàn.');
}

function exportToExcel() {
  const activeList = accounts.filter(a => {
    if (a.deleted) return false;
    if (a.category === 'BANK' && !isBankUnlocked) return false;
    return true;
  });

  if (activeList.length === 0) {
    showToast('Kho dữ liệu đang trống!');
    return;
  }

  const excelData = activeList.map(item => ({
    "Category": item.category === 'BANK' ? 'Banking' : (item.category === 'SOCIAL' ? 'Social Media' : 'Game'),
    "Platform / Game": item.game || "",
    "User": item.user || "",
    "Password": item.password || "",
    "Email": item.email || "",
    "Phone number": item.phone || "",
    "Notes": item.notes || ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = [{ wch: 15 }, { wch: 22 }, { wch: 25 }, { wch: 25 }, { wch: 30 }, { wch: 18 }, { wch: 35 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");
  XLSX.writeFile(workbook, `Danh_sach_tai_khoan_${new Date().toISOString().slice(0, 10)}.xlsx`);
  showToast(`Đã xuất ${activeList.length} tài khoản!`);
}

function handleExcelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '' });

      let col = { g: -1, u: -1, p: -1, e: -1, ph: -1, n: -1, cat: -1 };
      let headerIdx = -1;
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r].map(c => String(c).trim().toLowerCase());
        col.g = row.findIndex(c => c.includes('game') || c.includes('platform') || c.includes('nền tảng') || c.includes('tên'));
        col.u = row.findIndex(c => c.includes('user') || c.includes('tài khoản'));
        col.p = row.findIndex(c => c.includes('pass') || c.includes('mật khẩu'));
        if (col.g !== -1 && (col.u !== -1 || col.p !== -1)) {
          headerIdx = r;
          col.cat = row.findIndex(c => c.includes('category') || c.includes('loại') || c.includes('danh mục'));
          col.e = row.findIndex(c => c.includes('email') || c.includes('mail'));
          col.ph = row.findIndex(c => c.includes('phone') || c.includes('sđt'));
          col.n = row.findIndex(c => c.includes('note') || c.includes('ghi'));
          break;
        }
      }

      if (headerIdx === -1) {
        showToast('Không tìm thấy cột Tên nền tảng/Game / User / Password!'); return;
      }

      const socialK = ['facebook', 'fb', 'google', 'gmail', 'tiktok', 'discord', 'telegram', 'twitter', 'x', 'instagram', 'insta', 'zalo', 'youtube'];
      const bankK = ['bank', 'vcb', 'mbbank', 'momo', 'zalopay', 'paypal', 'binance', 'ngân hàng', 'ví', 'tcb', 'techcombank', 'vietin', 'bidv', 'agribank'];

      let added = 0;
      for (let r = headerIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        const game = col.g !== -1 ? String(row[col.g] || '').trim() : '';
        const user = col.u !== -1 ? String(row[col.u] || '').trim() : '';
        
        let cat = 'GAME';
        const catCell = col.cat !== -1 ? String(row[col.cat] || '').toLowerCase() : '';
        if (catCell.includes('bank') || catCell.includes('ngân hàng')) cat = 'BANK';
        else if (catCell.includes('social')) cat = 'SOCIAL';
        else if (bankK.some(k => game.toLowerCase().includes(k))) cat = 'BANK';
        else if (socialK.some(k => game.toLowerCase().includes(k))) cat = 'SOCIAL';

        if (game || user) {
          accounts.push({
            id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            category: cat,
            game: game || 'Chưa phân loại',
            user: user,
            password: col.p !== -1 ? String(row[col.p] || '').trim() : '',
            email: col.e !== -1 ? String(row[col.e] || '').trim() : '',
            phone: col.ph !== -1 ? String(row[col.ph] || '').trim() : '',
            notes: col.n !== -1 ? String(row[col.n] || '').trim() : '',
            deleted: false
          });
          added++;
        }
      }
      if (added > 0) {
        await pushToCloud();
        updatePlatformFilter();
        renderAccounts();
        showToast(`Đã tải lên ${added} tài khoản!`);
      }
    } catch (err) {
      showToast('Lỗi đọc Excel: ' + err.message);
    } finally { event.target.value = ''; }
  };
  reader.readAsArrayBuffer(file);
}

function updatePlatformFilter(resetToAll = false) {
  const select = document.getElementById('platformFilterSelect');
  const val = resetToAll ? 'ALL' : select.value;
  const activeList = accounts.filter(a => {
    if (a.deleted) return false;
    if (currentCategoryFilter === 'ALL' && a.category === 'BANK') return false;
    if (currentCategoryFilter !== 'ALL' && a.category !== currentCategoryFilter) return false;
    return true;
  });

  const platforms = [...new Set(activeList.map(a => a.game).filter(Boolean))].sort();
  select.innerHTML = '<option value="ALL">Tất cả Nền tảng</option>';
  platforms.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g; opt.innerText = g;
    select.appendChild(opt);
  });

  if (!resetToAll && platforms.includes(val)) {
    select.value = val;
  } else {
    select.value = 'ALL';
  }
}

function updateTrashCount() {
  document.getElementById('trashCountBadge').innerText = accounts.filter(a => a.deleted).length;
}

function renderAccounts() {
  const grid = document.getElementById('accountsGrid');
  const empty = document.getElementById('emptyState');
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const fg = document.getElementById('platformFilterSelect').value;

  const filtered = accounts.filter(a => {
    if (a.deleted) return false;
    if (currentCategoryFilter === 'ALL' && a.category === 'BANK') return false;
    if (a.category === 'BANK' && !isBankUnlocked) return false;
    if (currentCategoryFilter !== 'ALL' && a.category !== currentCategoryFilter) return false;
    
    const mg = (!fg || fg === 'ALL') || (a.game === fg);
    const mq = !q || a.game.toLowerCase().includes(q) || a.user.toLowerCase().includes(q) || (a.email && a.email.toLowerCase().includes(q));
    return mg && mq;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.innerHTML = filtered.map(a => {
    const isBank = a.category === 'BANK';
    const isSocial = a.category === 'SOCIAL';
    const borderGlow = isBank ? 'border-rose-500/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'border-slate-700/80 neon-glow';
    const tagCls = isBank ? 'text-rose-400 border-rose-500/30' : (isSocial ? 'text-pink-400 border-pink-500/30' : 'text-purple-400 border-purple-500/30');
    const tagTxt = isBank ? 'BANK' : (isSocial ? 'MXH' : 'GAME');

    return `
      <div data-id="${a.id}" class="bg-cyber-800 border ${borderGlow} rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition select-none">
        <div>
          <div class="flex items-center justify-between mb-2.5 sm:mb-3">
            <div class="flex items-center gap-2 min-w-0">
              <div class="drag-handle cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-500 hover:text-cyan-400 transition" title="Nhấn giữ để kéo đổi vị trí">
                <i data-lucide="grip-vertical" class="w-4 h-4"></i>
              </div>
              ${getPlatformIcon(a)}
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-sm sm:text-base ${isBank ? 'text-rose-300' : 'text-cyan-400'} font-gaming truncate">${escapeHtml(a.game)}</span>
                  <span class="text-[9px] font-semibold px-1.5 py-0.2 rounded border shrink-0 ${tagCls}">${tagTxt}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-1 shrink-0">
              <button onclick="editAccount('${a.id}')" title="Sửa" class="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/60 rounded-lg transition active:scale-90"><i data-lucide="edit" class="w-4 h-4"></i></button>
              <button onclick="moveToTrash('${a.id}')" title="Xóa" class="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700/60 rounded-lg transition active:scale-90"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
          </div>

          <div class="bg-cyber-900 p-2.5 rounded-xl border border-slate-800 text-xs space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-slate-400 text-[11px] sm:text-xs">User:</span>
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="font-mono text-slate-200 select-all truncate max-w-[140px] sm:max-w-[180px]">${escapeHtml(a.user)}</span>
                <button onclick="copyToClipboard('${escapeHtml(a.user)}', 'Tài khoản')" class="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"><i data-lucide="copy" class="w-3.5 h-3.5"></i></button>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-slate-400 text-[11px] sm:text-xs">Pass:</span>
              <div class="flex items-center gap-1">
                <input type="password" id="pass_field_${a.id}" value="${escapeHtml(a.password)}" readonly class="bg-transparent text-right font-mono ${isBank ? 'text-rose-200' : 'text-cyan-300'} focus:outline-none w-24 sm:w-28 text-xs select-all">
                <button onclick="toggleCardPass('${a.id}')" class="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"><i data-lucide="eye" id="card_eye_${a.id}" class="w-3.5 h-3.5"></i></button>
                <button onclick="copyToClipboard('${escapeHtml(a.password)}', 'Mật khẩu')" class="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"><i data-lucide="copy" class="w-3.5 h-3.5"></i></button>
              </div>
            </div>

            ${a.email ? `<div class="flex justify-between items-center"><span class="text-slate-400 text-[11px] sm:text-xs">Mail:</span><div class="flex items-center gap-1.5 min-w-0"><span class="text-slate-300 select-all truncate max-w-[140px] sm:max-w-[180px]">${escapeHtml(a.email)}</span><button onclick="copyToClipboard('${escapeHtml(a.email)}', 'Email')" class="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"><i data-lucide="copy" class="w-3.5 h-3.5"></i></button></div></div>` : ''}
            ${a.phone ? `<div class="flex justify-between items-center"><span class="text-slate-400 text-[11px] sm:text-xs">SĐT/Thẻ:</span><div class="flex items-center gap-1.5"><span class="text-slate-300 select-all">${escapeHtml(a.phone)}</span><button onclick="copyToClipboard('${escapeHtml(a.phone)}', 'Số điện thoại')" class="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"><i data-lucide="copy" class="w-3.5 h-3.5"></i></button></div></div>` : ''}
          </div>
          ${a.notes ? `<div class="text-[11px] font-mono ${isBank ? 'text-rose-300/90' : 'text-slate-300'} mt-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 break-words whitespace-pre-wrap leading-relaxed select-text cursor-text">${escapeHtml(a.notes)}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

function toggleCardPass(id) {
  const input = document.getElementById(`pass_field_${id}`);
  const icon = document.getElementById(`card_eye_${id}`);
  if (input.type === 'password') { input.type = 'text'; icon.setAttribute('data-lucide', 'eye-off'); } 
  else { input.type = 'password'; icon.setAttribute('data-lucide', 'eye'); }
  lucide.createIcons();
}

function toggleModalPassVisibility() {
  const input = document.getElementById('accPass');
  const icon = document.getElementById('modalPassEyeIcon');
  if (input.type === 'password') { input.type = 'text'; icon.setAttribute('data-lucide', 'eye-off'); } 
  else { input.type = 'password'; icon.setAttribute('data-lucide', 'eye'); }
  lucide.createIcons();
}

function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => showToast(`Đã sao chép ${label}!`)).catch(() => showToast('Lỗi sao chép!'));
}

function openModal(editId = null) {
  const modal = document.getElementById('accountModal');
  document.getElementById('accountModalForm').reset();
  clearCustomIcon();

  if (editId) {
    const item = accounts.find(a => a.id === editId);
    if (item) {
      document.getElementById('modalTitle').innerText = 'Cập Nhật Tài Khoản';
      document.getElementById('editAccountId').value = item.id;
      document.getElementsByName('accCategory').forEach(r => r.checked = (r.value === (item.category || 'GAME')));
      
      document.getElementById('accGame').value = item.game || '';
      document.getElementById('accUser').value = item.user || '';
      document.getElementById('accPass').value = item.password || '';
      document.getElementById('accEmail').value = item.email || '';
      document.getElementById('accPhone').value = item.phone || '';
      document.getElementById('accNotes').value = item.notes || '';

      const existingImg = getPlatformSharedIcon(item.game);
      if (existingImg) {
        if (existingImg.startsWith('data:image')) document.getElementById('accCustomIconBase64').value = existingImg;
        else document.getElementById('accIconUrl').value = existingImg;
        updateIconPreview(existingImg);
      }
    }
  } else {
    document.getElementById('modalTitle').innerText = 'Thêm Tài Khoản Mới';
    document.getElementById('editAccountId').value = '';
    document.getElementsByName('accCategory').forEach(r => r.checked = (currentCategoryFilter !== 'ALL' ? r.value === currentCategoryFilter : r.value === 'GAME'));
  }

  modal.classList.remove('hidden'); modal.classList.add('flex'); lucide.createIcons();
}

function editAccount(id) { openModal(id); }
function closeModal() { document.getElementById('accountModal').classList.add('hidden'); document.getElementById('accountModal').classList.remove('flex'); }

async function saveAccount(e) {
  e.preventDefault();
  const id = document.getElementById('editAccountId').value;
  let selectedCategory = 'GAME';
  document.getElementsByName('accCategory').forEach(r => { if (r.checked) selectedCategory = r.value; });

  const gameName = document.getElementById('accGame').value.trim();
  const iconBase64 = document.getElementById('accCustomIconBase64').value;
  const iconUrl = document.getElementById('accIconUrl').value.trim();

  if (iconBase64 || iconUrl) platformIcons[gameName.toLowerCase()] = iconBase64 || iconUrl;

  const data = {
    category: selectedCategory, game: gameName, user: document.getElementById('accUser').value.trim(),
    password: document.getElementById('accPass').value, email: document.getElementById('accEmail').value.trim(),
    phone: document.getElementById('accPhone').value.trim(), notes: document.getElementById('accNotes').value.trim()
  };

  if (id) {
    const idx = accounts.findIndex(a => a.id === id);
    if (idx !== -1) accounts[idx] = { ...accounts[idx], ...data };
  } else {
    accounts.unshift({ id: 'acc_' + Date.now(), ...data, deleted: false });
  }

  await pushToCloud();
  closeModal();
  
  if (selectedCategory === 'BANK') {
    isBankUnlocked = true;
    applyCategoryTab('BANK');
  } else {
    updatePlatformFilter(); renderAccounts();
  }
  showToast('Đã lưu dữ liệu!');
}

async function moveToTrash(id) {
  const idx = accounts.findIndex(a => a.id === id);
  if (idx !== -1) {
    accounts[idx].deleted = true; accounts[idx].deletedAt = new Date().toISOString();
    await pushToCloud(); updatePlatformFilter(); renderAccounts(); showToast('Đã chuyển vào Thùng Rác.');
  }
}

function openTrashModal() {
  renderTrashList();
  document.getElementById('trashModal').classList.remove('hidden'); document.getElementById('trashModal').classList.add('flex');
  lucide.createIcons();
}
function closeTrashModal() { document.getElementById('trashModal').classList.add('hidden'); document.getElementById('trashModal').classList.remove('flex'); }

function renderTrashList() {
  const trashList = document.getElementById('trashList');
  const emptyNotice = document.getElementById('emptyTrashNotice');
  const emptyBtn = document.getElementById('emptyTrashBtn');
  const deletedAccounts = accounts.filter(a => a.deleted);

  if (deletedAccounts.length === 0) {
    trashList.innerHTML = ''; emptyNotice.classList.remove('hidden'); emptyBtn.classList.add('hidden'); return;
  }
  emptyNotice.classList.add('hidden'); emptyBtn.classList.remove('hidden');

  trashList.innerHTML = deletedAccounts.map(a => `
    <div class="bg-cyber-900 border border-slate-700/80 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5 truncate">
          <span class="text-[9px] font-semibold px-1.5 py-0.2 rounded border shrink-0 ${a.category === 'BANK' ? 'text-rose-400 border-rose-500/30' : (a.category === 'SOCIAL' ? 'text-pink-400 border-pink-500/30' : 'text-purple-400 border-purple-500/30')}">
            ${a.category === 'BANK' ? 'BANK' : (a.category === 'SOCIAL' ? 'MXH' : 'GAME')}
          </span>
          <span class="font-bold text-xs sm:text-sm ${a.category === 'BANK' ? 'text-rose-400' : 'text-cyan-400'} font-gaming truncate">${escapeHtml(a.game)}</span>
        </div>
        <p class="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">${escapeHtml(a.user)}</p>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button onclick="restoreAccount('${a.id}')" class="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-medium flex items-center gap-1"><i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i><span class="hidden sm:inline">Khôi phục</span></button>
        <button onclick="permanentlyDeleteAccount('${a.id}')" class="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg"><i data-lucide="trash" class="w-4 h-4"></i></button>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

async function restoreAccount(id) {
  const idx = accounts.findIndex(a => a.id === id);
  if (idx !== -1) {
    accounts[idx].deleted = false; delete accounts[idx].deletedAt;
    await pushToCloud(); renderTrashList(); updatePlatformFilter(); renderAccounts(); showToast('Đã khôi phục tài khoản!');
  }
}
async function permanentlyDeleteAccount(id) {
  if (confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này?')) {
    accounts = accounts.filter(a => id !== a.id);
    await pushToCloud(); renderTrashList(); updatePlatformFilter(); renderAccounts(); showToast('Đã xóa vĩnh viễn.');
  }
}
async function emptyTrashConfirm() {
  if (confirm('CẢNH BÁO: Xóa sạch toàn bộ thùng rác?')) {
    accounts = accounts.filter(a => !a.deleted);
    await pushToCloud(); renderTrashList(); updatePlatformFilter(); renderAccounts(); showToast('Đã dọn sạch thùng rác.');
  }
}

function showToast(msg) {
  const t = document.getElementById('toast'); document.getElementById('toastMsg').innerText = msg;
  t.classList.remove('translate-y-20', 'opacity-0'); setTimeout(() => t.classList.add('translate-y-20', 'opacity-0'), 2500);
}

function escapeHtml(string) { return String(string || '').replace(/[&<>"']/g, function(s) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]; }); }

// Đăng ký Service Worker cho PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}