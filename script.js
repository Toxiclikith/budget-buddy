// DOM Elements
const transactionBtn = document.getElementById("add-transaction-btn");
const modal = document.getElementById("transaction-modal");
const cancelBtn = document.getElementById("cancel-btn");
const form = document.getElementById("transaction-form");
const transactionType = document.getElementById("transaction-type");
const categorySelect = document.getElementById("category");
const transactionList = document.getElementById("transaction-list");
const totalIncomeEl = document.getElementById("total-income");
const totalExpensesEl = document.getElementById("total-expenses");
const currentMonthEl = document.getElementById("current-month");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

// Fields
const amountInput = document.getElementById("amount");
const currencyInput = document.getElementById("currency");
const dateInput = document.getElementById("date");
const noteInput = document.getElementById("note");

// Data
let transactions = [];
let currentDate = new Date();

// Category Icons
const incomeCategories = [
  { icon: 'bi-cash-stack', name: 'Salary' },
  { icon: 'bi-briefcase-fill', name: 'Business' },
  { icon: 'bi-gift-fill', name: 'Gifts' },
  { icon: 'bi-graph-up-arrow', name: 'Investment' },
  { icon: 'bi-three-dots', name: 'Others' },
];

const expenseCategories = [
  { icon: 'bi-cup-straw', name: 'Food' },
  { icon: 'bi-truck', name: 'Transport' },
  { icon: 'bi-bag-fill', name: 'Shopping' },
  { icon: 'bi-controller', name: 'Entertainment' },
  { icon: 'bi-heart-pulse', name: 'Health' },
  { icon: 'bi-book', name: 'Education' },
  { icon: 'bi-airplane-engines', name: 'Travel' },
  { icon: 'bi-three-dots', name: 'Others' },
];

// Utility: Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB');
}

// Utility: Format currency
function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

// Populate Category Dropdown
function populateCategories() {
  const type = transactionType.value;
  const categories = type === "income" ? incomeCategories : expenseCategories;

  categorySelect.innerHTML = "";
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.name;
    opt.textContent = cat.name;
    categorySelect.appendChild(opt);
  });
}

// Update Summary Totals
function updateSummary() {
  let totalIncome = 0;
  let totalExpense = 0;

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  transactions.forEach(tx => {
    const txDate = new Date(tx.date);
    if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
      if (tx.type === "income") {
        totalIncome += parseFloat(tx.amount);
      } else {
        totalExpense += parseFloat(tx.amount);
      }
    }
  });

  const currency = transactions[0]?.currency || "INR";
  totalIncomeEl.textContent = formatCurrency(totalIncome, currency);
  totalExpensesEl.textContent = formatCurrency(totalExpense, currency);
}

// Render Transactions
function renderTransactions() {
  transactionList.innerHTML = "";

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const filtered = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  filtered.forEach(tx => {
    const categoryList = tx.type === "income" ? incomeCategories : expenseCategories;
    const categoryIcon = categoryList.find(c => c.name === tx.category)?.icon || "bi-question-circle";

    const li = document.createElement("li");
    li.className = `transaction-item ${tx.type}`;
    li.innerHTML = `
      <div class="details">
        <i class="bi ${categoryIcon}"></i>
        <div>
          <strong>${tx.category}</strong><br>
          <small>${formatDate(tx.date)}${tx.note ? ` • ${tx.note}` : ""}</small>
        </div>
      </div>
      <div class="amount">
        ${formatCurrency(tx.amount, tx.currency)}
      </div>
    `;
    transactionList.appendChild(li);
  });
}

// Update Month Title
function updateMonthTitle() {
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  currentMonthEl.textContent = `${month} ${year}`;
}

// Open Modal
transactionBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  form.reset();
  dateInput.valueAsDate = new Date();
  populateCategories();
});

// Cancel Modal
cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Change Category on Type Change
transactionType.addEventListener("change", populateCategories);

// Form Submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTransaction = {
    type: transactionType.value,
    currency: currencyInput.value,
    amount: parseFloat(amountInput.value),
    category: categorySelect.value,
    date: dateInput.value,
    note: noteInput.value.trim()
  };

  transactions.push(newTransaction);

  modal.classList.add("hidden");
  renderTransactions();
  updateSummary();
});

// Month Navigation
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateMonthTitle();
  renderTransactions();
  updateSummary();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateMonthTitle();
  renderTransactions();
  updateSummary();
});

// Initial Setup
function init() {
  updateMonthTitle();
  populateCategories();
  renderTransactions();
  updateSummary();
}
init();
