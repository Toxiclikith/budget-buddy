const transactionBtn = document.getElementById("add-transaction-btn");
const modal = document.getElementById("transaction-modal");
const cancelBtn = document.getElementById("cancel-btn");
const form = document.getElementById("transaction-form");
const categorySelect = document.getElementById("category");
const transactionList = document.getElementById("transaction-list");
const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const monthScroll = document.getElementById("month-scroll");
const incomeBtn = document.getElementById("income-btn");
const expenseBtn = document.getElementById("expense-btn");
const amountInput = document.getElementById("amount");
const currencyInput = document.getElementById("currency");
const dateInput = document.getElementById("date");
const noteInput = document.getElementById("note");
const deleteBtn = document.getElementById("delete-btn");
const editControls = document.getElementById("edit-buttons");
const modalTitle = document.getElementById("modal-title");
const saveBtn = document.getElementById("save-btn");


let transactions = [];
let currentDate = new Date();
let selectedMonth = currentDate.getMonth();
let selectedYear = currentDate.getFullYear();
let isEditing = false;
let editingIndex = null;
let selectedType = 'income';

const incomeCategories = [
  { icon: 'bi-cash-stack', name: 'Salary' },
  { icon: 'bi-briefcase', name: 'Business' },
  { icon: 'bi-gift', name: 'Gifts' },
  { icon: 'bi-bar-chart', name: 'Investments' },
  { icon: 'bi-piggy-bank', name: 'Interest' },
  { icon: 'bi-three-dots', name: 'Others' },
];

const expenseCategories = [
  { icon: 'bi-cup-straw', name: 'Food' },
  { icon: 'bi-cart', name: 'Groceries' },
  { icon: 'bi-house', name: 'Rent' },
  { icon: 'bi-bus-front', name: 'Transport' },
  { icon: 'bi-bag', name: 'Shopping' },
  { icon: 'bi-controller', name: 'Entertainment' },
  { icon: 'bi-heart-pulse', name: 'Health' },
  { icon: 'bi-book', name: 'Education' },
  { icon: 'bi-airplane', name: 'Travel' },
  { icon: 'bi-three-dots', name: 'Others' },
];

function renderMonths() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  monthScroll.innerHTML = '';

  const startYear = 2024;
  const startMonth = 0;

  const today = new Date();
  const maxTransactionDate = transactions.length > 0
    ? new Date(Math.max(...transactions.map(t => new Date(t.date).getTime())))
    : today;

  const endYear = Math.max(today.getFullYear(), maxTransactionDate.getFullYear());
  const endMonth = Math.max(
    today.getFullYear() === endYear ? today.getMonth() : 11,
    maxTransactionDate.getFullYear() === endYear ? new Date(maxTransactionDate).getMonth() : 11
  );

  for (let year = startYear; year <= endYear; year++) {
    const monthStart = (year === startYear) ? startMonth : 0;
    const monthEnd = (year === endYear) ? endMonth : 11;

    for (let month = monthStart; month <= monthEnd; month++) {
      const div = document.createElement("div");
      div.className = "month-item";
      div.textContent = `${months[month]} ${year}`;
      div.dataset.month = month;
      div.dataset.year = year;

      if (month === selectedMonth && year === selectedYear) {
        div.classList.add("active");
      }

      div.addEventListener("click", () => {
        selectedMonth = month;
        selectedYear = year;
        document.querySelectorAll(".month-item").forEach(m => m.classList.remove("active"));
        div.classList.add("active");
        renderTransactions();
      });

      monthScroll.appendChild(div);
    }
  }

  setTimeout(() => {
    const activeMonth = document.querySelector(".month-item.active");
    if (activeMonth) {
      activeMonth.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
  }, 50);
}

function renderCategories() {
  const categories = selectedType === 'income' ? incomeCategories : expenseCategories;
  const dropdownList = document.getElementById("dropdown-list");
  const selected = document.getElementById("selected-category");
  const hiddenInput = document.getElementById("category");

  dropdownList.innerHTML = '';
  selected.textContent = "Select Category";
  hiddenInput.value = '';

  categories.forEach(cat => {
    const li = document.createElement("li");
    li.innerHTML = `<i class="bi ${cat.icon}"></i> ${cat.name}`;
    li.setAttribute("data-value", cat.name);
    li.style.cursor = "pointer";

    li.addEventListener("click", () => {
      selected.innerHTML = `<i class="bi ${cat.icon}"></i> ${cat.name}`;
      hiddenInput.value = cat.name;
      dropdownList.classList.remove("show");
    });

    dropdownList.appendChild(li);
  });
}

document.getElementById("selected-category").addEventListener("click", () => {
  document.getElementById("dropdown-list").classList.toggle("show");
});

window.addEventListener("click", (e) => {
  if (!e.target.closest("#category-dropdown")) {
    document.getElementById("dropdown-list").classList.remove("show");
  }
});

function renderTransactions() {
  const filtered = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  let totalIncome = 0;
  let totalExpenses = 0;
  transactionList.innerHTML = '';

  filtered.forEach((t, index) => {
    const li = document.createElement("li");
    li.className = `transaction-item ${t.type}`;

    const icon = (t.type === 'income' ? incomeCategories : expenseCategories)
      .find(c => c.name === t.category)?.icon || 'bi-question';

    li.innerHTML = `
      <div class="details">
        <i class="bi ${icon}"></i>
        <div>
          <strong>${t.category}</strong><br/>
          <small>${t.note || ''} - ${new Date(t.date).toLocaleDateString()}</small>
        </div>
      </div>
      <div>
        <strong>${t.currency} ${t.amount.toFixed(2)}</strong>
      </div>
    `;
    li.style.cursor = "pointer";
    li.addEventListener("click", () => openModal(t, index));
    transactionList.appendChild(li);

    if (t.type === 'income') totalIncome += t.amount;
    else totalExpenses += t.amount;
  });

  totalIncomeEl.textContent = `₹${totalIncome.toFixed(2)}`;
  totalExpensesEl.textContent = `₹${totalExpenses.toFixed(2)}`;
}

function openModal(editData = null, index = null) {
  modal.classList.remove("hidden");
  form.reset();
  setDateToToday();

  if (editData && typeof editData === 'object' && !Array.isArray(editData)) {
    // Edit Mode
    deleteBtn.style.display = "inline-block";
    isEditing = true;
    editingIndex = index;

    setType(editData.type);
    renderCategories();
    saveTransactionsToLocalStorage();
    renderTransactions();

    amountInput.value = editData.amount;
    currencyInput.value = editData.currency;
    dateInput.value = editData.date;
    noteInput.value = editData.note;
    categorySelect.value = editData.category;

    const catList = editData.type === 'income' ? incomeCategories : expenseCategories;
    const selectedCat = catList.find(c => c.name === editData.category);
    if (selectedCat) {
      document.getElementById("selected-category").innerHTML = `<i class="bi ${selectedCat.icon}"></i> ${selectedCat.name}`;
    }

    modalTitle.innerHTML = `<i class="bi bi-pencil-square"></i> Edit Transaction`;
  } else {
    // Add Mode
    deleteBtn.style.display = "none";
    isEditing = false;
    editingIndex = null;

    setType('income');
    renderCategories();
    saveTransactionsToLocalStorage();
    renderTransactions();

    const defaultCat = incomeCategories[0];
    if (defaultCat) {
      categorySelect.value = defaultCat.name;
      document.getElementById("selected-category").innerHTML = `<i class="bi ${defaultCat.icon}"></i> ${defaultCat.name}`;
    }

    modalTitle.innerHTML = `<i class="bi bi-pencil-square"></i> Add Transaction`;
  }
}

function closeModal() {
  modal.classList.add("hidden");
}

function setType(type) {
  selectedType = type;
  form.classList.remove("income-theme", "expense-theme");
  form.classList.add(type === 'income' ? "income-theme" : "expense-theme");
  renderCategories();
}


function setDateToToday() {
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTransaction = {
    type: selectedType,
    currency: currencyInput.value,
    amount: parseFloat(amountInput.value),
    category: categorySelect.value,
    date: dateInput.value,
    note: noteInput.value,
  };

  if (isEditing && editingIndex !== null) {
    transactions[editingIndex] = newTransaction;
  } else {
    transactions.push(newTransaction);
  }
  closeModal();
  renderMonths();
  renderTransactions();
  saveTransactionsToLocalStorage();
});

deleteBtn.addEventListener("click", () => {
  if (isEditing && editingIndex !== null) {
    if (confirm("Are you sure you want to delete this transaction?")) {
      transactions.splice(editingIndex, 1);
      // saveTransactionsToLocalStorage(); 
      closeModal();
      renderTransactions();
      saveTransactionsToLocalStorage();
    }
  }
});

function saveTransactionsToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTransactionsFromLocalStorage() {
  const data = localStorage.getItem('transactions');
  if (data) {
    transactions = JSON.parse(data);
  } else {
    transactions = [];
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadTransactionsFromLocalStorage();
  renderTransactions();
  renderMonths();
});

transactionBtn.addEventListener("click", () => openModal());
cancelBtn.addEventListener("click", closeModal);
incomeBtn.addEventListener("click", () => setType('income'));
expenseBtn.addEventListener("click", () => setType('expense'));

// Initialize
// renderMonths();
// renderTransactions();
