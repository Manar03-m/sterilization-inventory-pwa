import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig, ADMIN_CODE } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const refs = {
  topNavCard: document.getElementById("topNavCard"),
  installBtn: document.getElementById("installBtn"),
  tabBtns: document.querySelectorAll(".tab-btn"),
  employeeSection: document.getElementById("employeeSection"),
  adminSection: document.getElementById("adminSection"),
  reportSection: document.getElementById("reportSection"),
  withdrawForm: document.getElementById("withdrawForm"),
  employeeCode: document.getElementById("employeeCode"),
  employeeName: document.getElementById("employeeName"),
  productSelect: document.getElementById("productSelect"),
  quantity: document.getElementById("quantity"),
  adminLoginForm: document.getElementById("adminLoginForm"),
  adminCode: document.getElementById("adminCode"),
  adminPanel: document.getElementById("adminPanel"),
  employeeForm: document.getElementById("employeeForm"),
  seedEmployeesBtn: document.getElementById("seedEmployeesBtn"),
  productForm: document.getElementById("productForm"),
  employeesList: document.getElementById("employeesList"),
  disabledEmployeesList: document.getElementById("disabledEmployeesList"),
  productsList: document.getElementById("productsList"),
  withdrawalsList: document.getElementById("withdrawalsList"),
  refreshBtn: document.getElementById("refreshBtn"),
  seedProductsBtn: document.getElementById("seedProductsBtn"),
  weeklyReportBtn: document.getElementById("weeklyReportBtn"),
  closeReportBtn: document.getElementById("closeReportBtn"),
  reportDaysSelect: document.getElementById("reportDaysSelect"),
  reportDaysCustom: document.getElementById("reportDaysCustom"),
  applyReportRangeBtn: document.getElementById("applyReportRangeBtn"),
  printReportBtn: document.getElementById("printReportBtn"),
  reportMeta: document.getElementById("reportMeta"),
  reportByProduct: document.getElementById("reportByProduct"),
  reportByEmployee: document.getElementById("reportByEmployee"),
  newEmployeeName: document.getElementById("newEmployeeName"),
  newEmployeeCode: document.getElementById("newEmployeeCode"),
  newProductName: document.getElementById("newProductName"),
  newProductStock: document.getElementById("newProductStock"),
  newProductMin: document.getElementById("newProductMin"),
  noticeForm: document.getElementById("noticeForm"),
  noticeInput: document.getElementById("noticeInput"),
  clearNoticeBtn: document.getElementById("clearNoticeBtn"),
  employeeNoteBox: document.getElementById("employeeNoteBox"),
  toast: document.getElementById("toast"),
};

let deferredPrompt = null;
let selectedEmployee = null;
let productsCache = [];
let employeesCache = [];
let previousTabBeforeReport = "employee";
let currentReportDays = 7;

function getInstallHelpMessage() {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);

  if (isIOS) {
    return "على iPhone: افتحي زر المشاركة ثم Add to Home Screen.";
  }
  if (isAndroid) {
    return "على Android: من قائمة المتصفح اختاري Install app أو Add to Home screen.";
  }
  return "من إعدادات المتصفح اختاري Install app أو Add to Home screen.";
}
const DEFAULT_PRODUCT_STOCK = 100;
const DEFAULT_MIN_STOCK = 20;

const DEFAULT_PRODUCTS = [
  "APRON",
  "COVER SHOE",
  "Disposable Face Mask",
  "Patient GOWN",
  "DOCTOR CAP",
  "Disposable Latex Gloves Large",
  "Disposable Latex Gloves Medium",
  "Disposable Latex Gloves Small",
  "Bubble suit tubing ;(7mm length=30m)",
  "FIRST AID PLASTER",
  "ALCOHOL 76%",
  "ANIOSEPT 45 NPC 1L",
  "ANIOSAFE SAVON DOUX 1L",
  "Disposable Gloves Nylon",
  "SHEET SMS 100*100 CM",
  "SHEET SMS 120*120 CM",
  "HYDROGEN PEROXIDE 35%",
  "HEXANIOS G+R 5L",
  "Cleaning brush for M/C instruments",
  "Cleaning brush double ended, hard bristles",
  "Plastic seal with steam indicator",
  "Tape With Steam indicator",
  "Bowie/Dick Test Pack",
  "Steri Reel (Flat) 7.5*200",
  "Steri Reel (Flat) 10*200",
  "Steri Reel (Flat) 15*200",
  "Steri Reel (Flat) 20*200",
  "Steri Reel (Flat) 25*200",
  "Steri Reel (Flat) 30*200",
  "Steri Reel (Flat) 40*200",
  "SMS Sterilization Sheet 75*75 CM",
  "TAPE WITH PLAZMA 25/25M",
  "H2O2 Plasma Chemical Indicator",
  "Steri Reel (Plazma) 10*70",
  "Steri Reel (Plazma) 15*70",
  "Steri Reel (Plazma) 20*70",
  "Steri Reel (Plazma) 25*70",
  "Steri Reel (Plazma) 30*70",
  "Steri Reel (Plazma) 40*70",
  "Washer Cleaning Test Indicator With Frame",
  "Single use paper filter,diam",
  "Indicator labels",
  "Gauze Roll",
  "BOX WITH 3 BOTTLES (HYDROGEN PEROXIDE)",
  "SURFA'SAFE SH 750ML",
  "BIOLOGICAL INDICATOR (STEAM)",
  "BIOLOGICAL INDICATOR (H2O2)",
  "ANIOSYME DLT 5L",
  "ANIOS DLH 5L thermosept",
  "CHEMICAL INDICATOR MACHINE 5L",
  "RN SPECIAL MACHINE 5L",
  "CHEMICAL INDICATOR STEAM (5TST)",
  "TURBINE OIL MORITA",
  "FACE SHIELD",
  "Sharp Container (7L) leter",
  "ETO CHEMICAL INDICATOR",
  "ETO BIOLOGICAL INDICATOR",
  "ETO CARTRIDGE",
  "LABRICANTE OIL"
];

const DEFAULT_EMPLOYEES = [
  { name: "رنا", code: "0000" },
  { name: "سندس", code: "1111" },
  { name: "مرام", code: "2222" },
  { name: "ايثار", code: "3333" },
  { name: "ديما", code: "4444" },
  { name: "راكان", code: "5555" },
  { name: "نايف", code: "6666" },
];

function toast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.remove("hidden");
  setTimeout(() => refs.toast.classList.add("hidden"), 2500);
}

function switchTab(tab) {
  previousTabBeforeReport = tab;
  refs.tabBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
  refs.employeeSection.classList.toggle("hidden", tab !== "employee");
  refs.adminSection.classList.toggle("hidden", tab !== "admin");
  refs.reportSection.classList.add("hidden");
  refs.topNavCard.classList.remove("hidden");
}

function openReportPage() {
  refs.topNavCard.classList.add("hidden");
  refs.employeeSection.classList.add("hidden");
  refs.adminSection.classList.add("hidden");
  refs.reportSection.classList.remove("hidden");
}

function closeReportPage() {
  refs.reportSection.classList.add("hidden");
  refs.topNavCard.classList.remove("hidden");
  switchTab(previousTabBeforeReport || "admin");
}

function renderProductsSelect() {
  refs.productSelect.innerHTML = '<option value="">-- اختر المنتج --</option>';
  productsCache
    .filter((p) => p.active !== false)
    .forEach((p) => {
      const stock = Number(p.stock || 0);
      const min = Number(p.minStock || 0);
      const lowTag = stock <= min ? " - منخفض" : "";
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = `${p.name} (متوفر: ${stock}${lowTag})`;
      refs.productSelect.appendChild(option);
    });
}

function renderEmployeesList() {
  refs.employeesList.innerHTML = "";
  refs.disabledEmployeesList.innerHTML = "";

  const activeEmployees = employeesCache.filter((emp) => emp.active !== false);
  const disabledEmployees = employeesCache.filter((emp) => emp.active === false);

  if (!activeEmployees.length) {
    refs.employeesList.innerHTML = "<p>لا يوجد موظفين نشطين.</p>";
  } else {
    activeEmployees.forEach((emp) => {
      const row = document.createElement("div");
      row.className = "list-item";
      row.innerHTML = `
        <span>${emp.name} - رمز: ${emp.code}</span>
        <button data-id="${emp.id}" class="danger-btn">تعطيل</button>
      `;
      row.querySelector("button").addEventListener("click", async () => {
        await updateDoc(doc(db, "employees", emp.id), { active: false });
        toast("تم تعطيل الموظف");
        await loadEmployees();
      });
      refs.employeesList.appendChild(row);
    });
  }

  if (!disabledEmployees.length) {
    refs.disabledEmployeesList.innerHTML = "<p>لا يوجد موظفين معطلين.</p>";
    return;
  }

  disabledEmployees.forEach((emp) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <span>${emp.name} - رمز: ${emp.code}</span>
      <button data-id="${emp.id}" class="danger-btn">حذف نهائي</button>
    `;
    row.querySelector("button").addEventListener("click", async () => {
      await deleteDoc(doc(db, "employees", emp.id));
      toast("تم حذف الموظف نهائيا");
      await loadEmployees();
    });
    refs.disabledEmployeesList.appendChild(row);
  });
}

function renderProductsList() {
  refs.productsList.innerHTML = "";
  if (!productsCache.length) {
    refs.productsList.innerHTML = "<p>لا يوجد منتجات.</p>";
    return;
  }

  productsCache.forEach((prod) => {
    const stock = Number(prod.stock || 0);
    const minStock = Number(prod.minStock || 0);
    const isLow = stock <= minStock;
    const row = document.createElement("div");
    row.className = `product-item ${isLow ? "low-stock" : ""}`;
    row.innerHTML = `
      <div class="product-head">
        <strong>${prod.name}</strong>
        <span class="stock-badge ${isLow ? "danger" : ""}">
          الكمية: ${stock} | الحد الأدنى: ${minStock}
        </span>
      </div>
      <div class="row product-controls">
        <input data-name-input="${prod.id}" type="text" value="${prod.name}" placeholder="اسم المنتج" />
        <input data-stock-input="${prod.id}" type="number" min="0" value="${stock}" placeholder="الكمية" />
        <input data-min-input="${prod.id}" type="number" min="0" value="${minStock}" placeholder="الحد الأدنى" />
        <button data-save-product="${prod.id}">حفظ التعديلات</button>
        <button data-delete="${prod.id}" class="danger-btn">حذف</button>
      </div>
    `;

    row.querySelector(`[data-save-product="${prod.id}"]`).addEventListener("click", async () => {
      const nameInput = row.querySelector(`[data-name-input="${prod.id}"]`);
      const stockInput = row.querySelector(`[data-stock-input="${prod.id}"]`);
      const minInput = row.querySelector(`[data-min-input="${prod.id}"]`);
      const newName = String(nameInput.value || "").trim();
      const newStock = Number(stockInput.value);
      const newMinStock = Number(minInput.value);
      if (!newName) {
        toast("اسم المنتج مطلوب");
        return;
      }
      if (!Number.isFinite(newStock) || newStock < 0 || !Number.isFinite(newMinStock) || newMinStock < 0) {
        toast("ادخلي قيم صحيحة للاسم والكمية والحد الأدنى");
        return;
      }
      await saveProductDetails(prod.id, newName, newStock, newMinStock);
    });
    row.querySelector(`[data-delete="${prod.id}"]`).addEventListener("click", () => removeProduct(prod.id));
    refs.productsList.appendChild(row);
  });
}

async function saveProductDetails(productId, nextName, nextStock, nextMinStock) {
  await updateDoc(doc(db, "products", productId), {
    name: nextName,
    stock: nextStock,
    minStock: nextMinStock,
  });
  toast("تم حفظ التعديلات");
  await loadProducts();
}

async function removeProduct(id) {
  await deleteDoc(doc(db, "products", id));
  toast("تم حذف المنتج");
  await loadProducts();
}

async function seedDefaultProducts() {
  const existing = new Set(productsCache.map((p) => String(p.name || "").toLowerCase().trim()));
  const toInsert = DEFAULT_PRODUCTS.filter((name) => !existing.has(name.toLowerCase().trim()));
  if (!toInsert.length) {
    toast("كل المنتجات الأساسية موجودة بالفعل");
    return;
  }

  for (const name of toInsert) {
    await addDoc(collection(db, "products"), {
      name,
      stock: DEFAULT_PRODUCT_STOCK,
      minStock: DEFAULT_MIN_STOCK,
      active: true,
      createdAt: Timestamp.now(),
    });
  }

  toast(`تمت إضافة ${toInsert.length} منتج أساسي`);
  await loadProducts();
}

async function loadEmployees() {
  let snap = await getDocs(query(collection(db, "employees"), orderBy("createdAt", "desc")));
  if (snap.empty) {
    await seedDefaultEmployees();
    snap = await getDocs(query(collection(db, "employees"), orderBy("createdAt", "desc")));
  }
  employeesCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderEmployeesList();
}

async function seedDefaultEmployees() {
  const allEmployeesSnap = await getDocs(collection(db, "employees"));
  const existingKeys = new Set(
    allEmployeesSnap.docs.map((d) => {
      const data = d.data();
      return `${String(data.name || "").trim()}::${String(data.code || "").trim()}`;
    })
  );

  const toInsert = DEFAULT_EMPLOYEES.filter(
    (emp) => !existingKeys.has(`${emp.name}::${emp.code}`)
  );

  if (!toInsert.length) {
    toast("كل الموظفين الأساسيين موجودين بالفعل");
    return;
  }

  for (const emp of toInsert) {
    await addDoc(collection(db, "employees"), {
      name: emp.name,
      code: emp.code,
      active: true,
      createdAt: Timestamp.now(),
    });
  }

  toast(`تمت إضافة ${toInsert.length} موظف`);
}

async function loadProducts() {
  let snap = await getDocs(query(collection(db, "products"), orderBy("name", "asc")));
  if (snap.empty) {
    // أول تشغيل: إدخال المنتجات الأساسية تلقائيا حتى تظهر مباشرة للموظفين.
    for (const name of DEFAULT_PRODUCTS) {
      await addDoc(collection(db, "products"), {
        name,
        stock: DEFAULT_PRODUCT_STOCK,
        minStock: DEFAULT_MIN_STOCK,
        active: true,
        createdAt: Timestamp.now(),
      });
    }
    snap = await getDocs(query(collection(db, "products"), orderBy("name", "asc")));
  }

  productsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  renderProductsSelect();
  renderProductsList();
}

async function loadWithdrawals() {
  const snap = await getDocs(
    query(collection(db, "withdrawals"), orderBy("createdAt", "desc"), limit(30))
  );
  refs.withdrawalsList.innerHTML = "";
  if (!snap.docs.length) {
    refs.withdrawalsList.innerHTML = "<p>لا توجد عمليات.</p>";
    return;
  }

  snap.docs.forEach((w) => {
    const data = w.data();
    const time = data.createdAt?.toDate
      ? data.createdAt.toDate().toLocaleString("ar")
      : "-";
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `<span>${data.employeeName} سحب ${data.quantity} من ${data.productName}</span><small>${time}</small>`;
    refs.withdrawalsList.appendChild(row);
  });
}

async function loadNotice() {
  const settingsDoc = await getDoc(doc(db, "settings", "notice"));
  const note = settingsDoc.exists() ? String(settingsDoc.data().text || "").trim() : "";

  if (refs.noticeInput) {
    refs.noticeInput.value = note;
  }

  if (note) {
    refs.employeeNoteBox.textContent = `ملاحظة من المسؤول: ${note}`;
    refs.employeeNoteBox.classList.remove("hidden");
  } else {
    refs.employeeNoteBox.textContent = "";
    refs.employeeNoteBox.classList.add("hidden");
  }
}

async function resolveEmployeeByCode(code) {
  const snap = await getDocs(
    query(collection(db, "employees"), where("code", "==", code), where("active", "==", true), limit(1))
  );
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

function buildReportTable(entries, firstColLabel) {
  if (!entries.length) {
    return "<p>لا توجد بيانات ضمن هذه الفترة.</p>";
  }

  const rows = entries
    .map(
      ([name, qty]) =>
        `<tr><td>${name}</td><td>${qty}</td></tr>`
    )
    .join("");

  return `
    <table class="report-table">
      <thead>
        <tr>
          <th>${firstColLabel}</th>
          <th>إجمالي المسحوب</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function createWeeklyReport(days = 7) {
  const start = new Date();
  start.setDate(start.getDate() - Number(days));
  start.setHours(0, 0, 0, 0);

  const withdrawalsSnap = await getDocs(
    query(collection(db, "withdrawals"), where("createdAt", ">=", Timestamp.fromDate(start)))
  );

  const byProduct = {};
  const byEmployee = {};

  withdrawalsSnap.docs.forEach((d) => {
    const w = d.data();
    byProduct[w.productName] = (byProduct[w.productName] || 0) + Number(w.quantity || 0);
    byEmployee[w.employeeName] = (byEmployee[w.employeeName] || 0) + Number(w.quantity || 0);
  });

  const productEntries = Object.entries(byProduct).sort((a, b) => b[1] - a[1]);
  const employeeEntries = Object.entries(byEmployee).sort((a, b) => b[1] - a[1]);
  const totalWithdrawals = withdrawalsSnap.docs.length;

  refs.reportMeta.innerHTML = `الفترة: آخر ${days} أيام | عدد عمليات السحب: ${totalWithdrawals}`;
  refs.reportByProduct.innerHTML = buildReportTable(productEntries, "المنتج");
  refs.reportByEmployee.innerHTML = buildReportTable(employeeEntries, "الموظف");
}

refs.tabBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    switchTab(btn.dataset.tab);
  })
);

refs.employeeCode.addEventListener("blur", async () => {
  if (!refs.employeeCode.value.trim()) return;
  selectedEmployee = await resolveEmployeeByCode(refs.employeeCode.value.trim());
  refs.employeeName.value = selectedEmployee?.name || "";
  if (!selectedEmployee) toast("رمز الموظف غير صحيح");
});

refs.withdrawForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectedEmployee) {
    toast("تحقق من رمز الموظف أولا");
    return;
  }

  const product = productsCache.find((p) => p.id === refs.productSelect.value);
  const quantity = Number(refs.quantity.value);
  if (!product || !quantity || quantity < 1) {
    toast("البيانات غير مكتملة");
    return;
  }
  if (quantity > Number(product.stock || 0)) {
    toast("الكمية المطلوبة اكبر من المتوفر");
    return;
  }

  await addDoc(collection(db, "withdrawals"), {
    employeeId: selectedEmployee.id,
    employeeName: selectedEmployee.name,
    productId: product.id,
    productName: product.name,
    quantity,
    createdAt: Timestamp.now(),
  });

  await updateDoc(doc(db, "products", product.id), {
    stock: Number(product.stock) - quantity,
  });

  toast("تم تسجيل السحب");
  refs.withdrawForm.reset();
  refs.employeeName.value = "";
  selectedEmployee = null;
  await loadProducts();
  await loadWithdrawals();
});

refs.adminLoginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (refs.adminCode.value.trim() !== ADMIN_CODE) {
    toast("رمز المسؤول غير صحيح");
    return;
  }
  refs.adminPanel.classList.remove("hidden");
  refs.adminLoginForm.classList.add("hidden");
  await Promise.all([loadEmployees(), loadProducts(), loadWithdrawals(), loadNotice()]);
});

refs.employeeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = refs.newEmployeeName.value.trim();
  const code = refs.newEmployeeCode.value.trim();
  if (!name || !code) return;

  await addDoc(collection(db, "employees"), {
    name,
    code,
    active: true,
    createdAt: Timestamp.now(),
  });
  toast("تمت إضافة الموظف");
  refs.employeeForm.reset();
  await loadEmployees();
});

refs.productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = refs.newProductName.value.trim();
  const stock = Number(refs.newProductStock.value);
  const minStock = Number(refs.newProductMin.value);
  if (!name || stock < 0 || minStock < 0) return;

  await addDoc(collection(db, "products"), {
    name,
    stock,
    minStock,
    active: true,
    createdAt: Timestamp.now(),
  });
  toast("تمت إضافة المنتج");
  refs.productForm.reset();
  await loadProducts();
});

refs.refreshBtn.addEventListener("click", async () => {
  await Promise.all([loadEmployees(), loadProducts(), loadWithdrawals(), loadNotice()]);
  toast("تم التحديث");
});

refs.seedProductsBtn.addEventListener("click", async () => {
  await seedDefaultProducts();
});

refs.seedEmployeesBtn.addEventListener("click", async () => {
  await seedDefaultEmployees();
  await loadEmployees();
});

refs.weeklyReportBtn.addEventListener("click", async () => {
  await createWeeklyReport(currentReportDays);
  openReportPage();
});

refs.closeReportBtn.addEventListener("click", () => closeReportPage());

refs.reportDaysSelect.addEventListener("change", () => {
  const isCustom = refs.reportDaysSelect.value === "custom";
  refs.reportDaysCustom.classList.toggle("hidden", !isCustom);
});

refs.applyReportRangeBtn.addEventListener("click", async () => {
  if (refs.reportDaysSelect.value === "custom") {
    const customDays = Number(refs.reportDaysCustom.value);
    if (!Number.isFinite(customDays) || customDays < 1) {
      toast("ادخلي عدد أيام صحيح");
      return;
    }
    currentReportDays = customDays;
  } else {
    currentReportDays = Number(refs.reportDaysSelect.value);
  }

  await createWeeklyReport(currentReportDays);
  toast("تم تحديث الجرد");
});

refs.printReportBtn.addEventListener("click", () => {
  window.print();
});

refs.noticeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = refs.noticeInput.value.trim();
  if (!text) {
    toast("اكتبي الملاحظة أولا");
    return;
  }
  await setDoc(doc(db, "settings", "notice"), {
    text,
    updatedAt: Timestamp.now(),
  });
  toast("تم حفظ الملاحظة");
  await loadNotice();
});

refs.clearNoticeBtn.addEventListener("click", async () => {
  await setDoc(doc(db, "settings", "notice"), {
    text: "",
    updatedAt: Timestamp.now(),
  });
  toast("تم حذف الملاحظة");
  await loadNotice();
});

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  refs.installBtn.classList.remove("hidden");
});

refs.installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) {
    alert(getInstallHelpMessage());
    return;
  }
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  refs.installBtn.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
  refs.installBtn.classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}

switchTab("employee");
loadProducts();
loadNotice();
refs.installBtn.classList.remove("hidden");
