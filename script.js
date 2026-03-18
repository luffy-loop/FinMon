
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const toggle = document.getElementById("toggle");
const search = document.getElementById("search");
const monthFilter = document.getElementById("monthFilter");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart;

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === "" || amount.value.trim() === "") return;

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: +amount.value,
    category: category.value,
    date: new Date().toISOString()
  };

  transactions.push(transaction);

  updateLocalStorage();
  updateUI();

  text.value = "";
  amount.value = "";
}

function updateUI() {
  list.innerHTML = "";

  // 🔍 + 📅 FILTER LOGIC
  const filteredTransactions = transactions.filter(t => {
    const matchText = t.text
      .toLowerCase()
      .includes(search.value.toLowerCase());

    if (!monthFilter.value) return matchText;

    if (!t.date) return matchText; // fix old data

    const selectedMonth = new Date(monthFilter.value).getMonth();
    const transactionMonth = new Date(t.date).getMonth();

    return matchText && selectedMonth === transactionMonth;
  });

  let total = 0;
  let inc = 0;
  let exp = 0;

  filteredTransactions.forEach(t => {
    total += t.amount;

    if (t.amount > 0) inc += t.amount;
    else exp += t.amount;

    const li = document.createElement("li");
    li.classList.add(t.amount > 0 ? "plus" : "minus");

    li.innerHTML = `
      <div>
        ${t.text} <br>
        <small>(${t.category})</small>
      </div>
      <div>
        ₹${t.amount}
        <button onclick="deleteTransaction(${t.id})">x</button>
      </div>
    `;

    list.appendChild(li);
  });

  balance.innerText = `₹${total}`;
  income.innerText = `₹${inc}`;
  expense.innerText = `₹${Math.abs(exp)}`;

  updateChart(filteredTransactions);
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  updateUI();
}
function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}


function updateChart(dataList) {
  const categories = {};

  dataList.forEach(t => {
    const key = t.category || "Other";
    categories[key] = (categories[key] || 0) + t.amount;
  });

  const data = {
    labels: Object.keys(categories),
    datasets: [{
      data: Object.values(categories)
    }]
  };

  if (chart) chart.destroy();

  const ctx = document.getElementById("chart").getContext("2d");

  chart = new Chart(ctx, {
    type: "pie",
    data: data
  });
}
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

form.addEventListener("submit", addTransaction);
search.addEventListener("input", updateUI);
monthFilter.addEventListener("change", updateUI);

updateUI();
