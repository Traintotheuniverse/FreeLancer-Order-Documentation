const STORAGE_KEY = "freelancer-order-records-v1";

const state = {
  orders: [],
  filter: "unpaid",
  month: "all",
  editingId: null,
};

const els = {
  listView: document.querySelector("#listView"),
  formView: document.querySelector("#formView"),
  orderList: document.querySelector("#orderList"),
  summary: document.querySelector("#summary"),
  monthFilter: document.querySelector("#monthFilter"),
  addOrderBtn: document.querySelector("#addOrderBtn"),
  exportCsvBtn: document.querySelector("#exportCsvBtn"),
  segments: document.querySelectorAll(".segment"),
  backBtn: document.querySelector("#backBtn"),
  deleteBtn: document.querySelector("#deleteBtn"),
  formTitle: document.querySelector("#formTitle"),
  orderForm: document.querySelector("#orderForm"),
  formMessage: document.querySelector("#formMessage"),
  totalPrice: document.querySelector("#totalPrice"),
  inputs: {
    orderDate: document.querySelector("#orderDate"),
    project: document.querySelector("#project"),
    client: document.querySelector("#client"),
    description: document.querySelector("#description"),
    quantity: document.querySelector("#quantity"),
    unitPrice: document.querySelector("#unitPrice"),
    deliveryDate: document.querySelector("#deliveryDate"),
    paymentDate: document.querySelector("#paymentDate"),
  },
};

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMoney(value) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value || 0);
}

function formatDate(dateString) {
  if (!dateString) return "未填写";
  const [year, month, day] = dateString.split("-");
  return `${month}/${day}`;
}

function orderMonth(order) {
  return (order.orderDate || "").slice(0, 7);
}

function formatMonth(monthValue) {
  if (monthValue === "all") return "全部月份";
  const [year, month] = monthValue.split("-");
  return `${year}年${Number(month)}月`;
}

function makeId() {
  return `order-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sampleOrders() {
  const current = today();
  return [
    {
      id: makeId(),
      orderDate: current,
      project: "KV设计",
      client: "晴山咖啡",
      description: "七夕活动主视觉",
      quantity: 1,
      unitPrice: 1800,
      deliveryDate: current,
      paymentStatus: "unpaid",
      paymentDate: "",
    },
    {
      id: makeId(),
      orderDate: current,
      project: "修图",
      client: "Mia",
      description: "头像精修",
      quantity: 6,
      unitPrice: 120,
      deliveryDate: current,
      paymentStatus: "unpaid",
      paymentDate: "",
    },
    {
      id: makeId(),
      orderDate: current,
      project: "插画",
      client: "蓝盒工作室",
      description: "公众号封面插画",
      quantity: 2,
      unitPrice: 650,
      deliveryDate: current,
      paymentStatus: "paid",
      paymentDate: current,
    },
  ];
}

function orderTotal(order) {
  return Number(order.quantity || 0) * Number(order.unitPrice || 0);
}

function loadOrders() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    state.orders = JSON.parse(saved);
    return;
  }
  state.orders = sampleOrders();
  saveOrders();
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.orders));
}

function monthFilteredOrders() {
  if (state.month === "all") return [...state.orders];
  return state.orders.filter((order) => orderMonth(order) === state.month);
}

function filteredOrders() {
  const monthOrders = monthFilteredOrders();
  if (state.filter === "all") return monthOrders;
  return monthOrders.filter((order) => order.paymentStatus === state.filter);
}

function renderMonthOptions() {
  const months = [...new Set(state.orders.map(orderMonth).filter(Boolean))].sort().reverse();
  const validMonths = ["all", ...months];
  if (!validMonths.includes(state.month)) {
    state.month = "all";
  }

  els.monthFilter.innerHTML = validMonths
    .map((month) => `<option value="${month}">${formatMonth(month)}</option>`)
    .join("");
  els.monthFilter.value = state.month;
}

function renderSummary() {
  const all = monthFilteredOrders();
  const unpaid = all.filter((order) => order.paymentStatus === "unpaid");
  const paid = all.filter((order) => order.paymentStatus === "paid");
  const unpaidAmount = unpaid.reduce((sum, order) => sum + orderTotal(order), 0);
  const paidAmount = paid.reduce((sum, order) => sum + orderTotal(order), 0);
  const totalAmount = all.reduce((sum, order) => sum + orderTotal(order), 0);

  if (state.filter === "all") {
    els.summary.className = "summary all";
    els.summary.innerHTML = [
      summaryItem("总订单数", `${all.length} 单`),
      summaryItem("总金额", formatMoney(totalAmount)),
      summaryItem("已收金额", formatMoney(paidAmount)),
      summaryItem("未收金额", formatMoney(unpaidAmount)),
    ].join("");
    return;
  }

  if (state.filter === "paid") {
    els.summary.className = "summary";
    els.summary.innerHTML = [
      summaryItem("已付款订单", `${paid.length} 单`),
      summaryItem("已收金额", formatMoney(paidAmount)),
    ].join("");
    return;
  }

  els.summary.className = "summary";
  els.summary.innerHTML = [
    summaryItem("未付款订单", `${unpaid.length} 单`),
    summaryItem("未收总金额", formatMoney(unpaidAmount)),
  ].join("");
}

function summaryItem(label, value) {
  return `<div class="summary-item"><span>${label}</span><strong>${value}</strong></div>`;
}

function renderOrders() {
  renderMonthOptions();
  renderSummary();
  els.segments.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === state.filter);
  });

  const orders = filteredOrders().sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate));

  if (!orders.length) {
    els.orderList.innerHTML = `<div class="empty-state">这里暂时没有订单。<br />点下面的“新增订单”记录一笔。</div>`;
    return;
  }

  els.orderList.innerHTML = orders.map(orderCard).join("");
}

function orderCard(order) {
  const title = order.project || "未命名项目";
  const desc = order.description || order.client || "没有项目说明";
  const statusLabel = order.paymentStatus === "paid" ? "已付款" : "未付款";
  const quickPaid = order.paymentStatus === "unpaid"
    ? `<button class="quick-paid" type="button" data-paid-id="${order.id}">标记已付款</button>`
    : "";

  return `
    <article class="order-card" data-order-id="${order.id}">
      <div class="order-card-top">
        <div>
          <h3 class="order-title">${escapeHtml(title)}</h3>
          <p class="order-desc">${escapeHtml(desc)}</p>
        </div>
        <div class="order-price">${formatMoney(orderTotal(order))}</div>
      </div>
      <div class="order-meta">
        <span class="meta-text">交付 ${formatDate(order.deliveryDate)}</span>
        <span class="status-badge ${order.paymentStatus}">${statusLabel}</span>
      </div>
      ${quickPaid}
    </article>
  `;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showList() {
  state.editingId = null;
  els.formView.hidden = true;
  els.listView.hidden = false;
  renderOrders();
}

function showForm(order = null) {
  state.editingId = order?.id || null;
  els.listView.hidden = true;
  els.formView.hidden = false;
  els.formTitle.textContent = order ? "编辑订单" : "新增订单";
  els.deleteBtn.hidden = !order;
  hideFormMessage();

  const data = order || {
    orderDate: today(),
    project: "",
    client: "",
    description: "",
    quantity: 1,
    unitPrice: "",
    deliveryDate: today(),
    paymentStatus: "unpaid",
    paymentDate: "",
  };

  els.inputs.orderDate.value = data.orderDate || today();
  els.inputs.project.value = data.project || "";
  els.inputs.client.value = data.client || "";
  els.inputs.description.value = data.description || "";
  els.inputs.quantity.value = data.quantity ?? "";
  els.inputs.unitPrice.value = data.unitPrice ?? "";
  els.inputs.deliveryDate.value = data.deliveryDate || today();
  els.inputs.paymentDate.value = data.paymentDate || "";
  document.querySelector(`input[name="paymentStatus"][value="${data.paymentStatus || "unpaid"}"]`).checked = true;
  updateTotalPreview();
}

function formStatus() {
  return document.querySelector('input[name="paymentStatus"]:checked').value;
}

function collectForm() {
  const status = formStatus();
  return {
    id: state.editingId || makeId(),
    orderDate: els.inputs.orderDate.value,
    project: els.inputs.project.value.trim(),
    client: els.inputs.client.value.trim(),
    description: els.inputs.description.value.trim(),
    quantity: Number(els.inputs.quantity.value),
    unitPrice: Number(els.inputs.unitPrice.value),
    deliveryDate: els.inputs.deliveryDate.value,
    paymentStatus: status,
    paymentDate: status === "paid" ? els.inputs.paymentDate.value : "",
  };
}

function validateOrder(order) {
  const missing = [];
  if (!order.orderDate) missing.push("接单日期");
  if (!order.deliveryDate) missing.push("交付日期");
  if (!order.quantity) missing.push("数量");
  if (!order.unitPrice) missing.push("单价");

  if (missing.length) return `请填写：${missing.join("、")}`;
  if (order.quantity <= 0) return "数量必须大于 0";
  if (order.unitPrice <= 0) return "单价必须大于 0";
  return "";
}

function showFormMessage(message) {
  els.formMessage.textContent = message;
  els.formMessage.hidden = false;
  els.formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideFormMessage() {
  els.formMessage.hidden = true;
  els.formMessage.textContent = "";
}

function updateTotalPreview() {
  const quantity = Number(els.inputs.quantity.value || 0);
  const unitPrice = Number(els.inputs.unitPrice.value || 0);
  els.totalPrice.textContent = formatMoney(quantity * unitPrice);
}

function markPaid(orderId) {
  state.orders = state.orders.map((order) => {
    if (order.id !== orderId) return order;
    return {
      ...order,
      paymentStatus: "paid",
      paymentDate: order.paymentDate || today(),
    };
  });
  saveOrders();
  renderOrders();
}

function handleStatusChange() {
  const status = formStatus();
  if (status === "paid" && !els.inputs.paymentDate.value) {
    els.inputs.paymentDate.value = today();
  }
  if (status === "unpaid") {
    els.inputs.paymentDate.value = "";
  }
}

function saveForm(event) {
  event.preventDefault();
  const order = collectForm();
  const error = validateOrder(order);
  if (error) {
    showFormMessage(error);
    return;
  }

  const existingIndex = state.orders.findIndex((item) => item.id === order.id);
  if (existingIndex >= 0) {
    state.orders[existingIndex] = order;
  } else {
    state.orders.unshift(order);
  }

  saveOrders();
  showList();
}

function deleteCurrentOrder() {
  if (!state.editingId) return;
  const confirmed = window.confirm("确定要删除这笔订单吗？删除后不能恢复。");
  if (!confirmed) return;
  state.orders = state.orders.filter((order) => order.id !== state.editingId);
  saveOrders();
  showList();
}

function exportCsv() {
  const rows = filteredOrders();
  const headers = [
    "接单日期",
    "项目",
    "客户",
    "项目说明",
    "数量",
    "单价",
    "总价",
    "交付日期",
    "付款状态",
    "付款日期",
  ];
  const body = rows.map((order) => [
    order.orderDate,
    order.project,
    order.client,
    order.description,
    order.quantity,
    order.unitPrice,
    orderTotal(order),
    order.deliveryDate,
    order.paymentStatus === "paid" ? "已付款" : "未付款",
    order.paymentDate,
  ]);

  const csv = [headers, ...body].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `接单记录-${state.filter}-${state.month}-${today()}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function bindEvents() {
  els.addOrderBtn.addEventListener("click", () => showForm());
  els.exportCsvBtn.addEventListener("click", exportCsv);
  els.monthFilter.addEventListener("change", () => {
    state.month = els.monthFilter.value;
    renderOrders();
  });
  els.backBtn.addEventListener("click", showList);
  els.deleteBtn.addEventListener("click", deleteCurrentOrder);
  els.orderForm.addEventListener("submit", saveForm);
  els.inputs.quantity.addEventListener("input", updateTotalPreview);
  els.inputs.unitPrice.addEventListener("input", updateTotalPreview);

  document.querySelectorAll('input[name="paymentStatus"]').forEach((input) => {
    input.addEventListener("change", handleStatusChange);
  });

  els.segments.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      renderOrders();
    });
  });

  els.orderList.addEventListener("click", (event) => {
    const paidButton = event.target.closest("[data-paid-id]");
    if (paidButton) {
      event.stopPropagation();
      markPaid(paidButton.dataset.paidId);
      return;
    }

    const card = event.target.closest("[data-order-id]");
    if (!card) return;
    const order = state.orders.find((item) => item.id === card.dataset.orderId);
    if (order) showForm(order);
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

loadOrders();
bindEvents();
renderOrders();
registerServiceWorker();
