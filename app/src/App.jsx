import { useState } from "react";
import "./App.css";

const transactions = [
  { id: 1, name: "Ăn trưa", category: "Food", date: "12/09/2026", amount: -85000, icon: "🍜" },
  { id: 2, name: "Lương part-time", category: "Income", date: "11/09/2026", amount: 3500000, icon: "💰" },
  { id: 3, name: "Mua sách", category: "Education", date: "10/09/2026", amount: -250000, icon: "📚" },
  { id: 4, name: "Grab", category: "Transport", date: "09/09/2026", amount: -65000, icon: "🚗" },
  { id: 5, name: "Netflix", category: "Entertainment", date: "08/09/2026", amount: -180000, icon: "🎬" }
];

const menuItems = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Transactions", icon: "↔" },
  { name: "Categories", icon: "▦" },
  { name: "Budgets", icon: "◉" },
  { name: "Goals", icon: "☆" },
  { name: "Analytics", icon: "▥" },
  { name: "Settings", icon: "⚙" }
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const balance = 12500000;
  const income = 3500000;
  const expense = 580000;

  const formatMoney = (money) => {
    return new Intl.NumberFormat("vi-VN").format(Math.abs(money)) + " ₫";
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">₫</div>
          <span>MoneyFlow</span>
        </div>

        <div className="menu">
          <p className="menu-title">MENU</p>

          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`menu-item ${activePage === item.name ? "active" : ""}`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="menu-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="upgrade">
            <div className="upgrade-icon">🚀</div>
            <strong>Upgrade Pro</strong>
            <p>Get more powerful features.</p>
            <button>Upgrade</button>
          </div>

          <div className="profile">
            <div className="avatar">H</div>
            <div>
              <strong>Hiếu</strong>
              <p>Free Account</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <p className="hello">Welcome back 👋</p>
            <h1>{activePage}</h1>
          </div>

          <div className="header-right">
            <button className="notification">🔔</button>
            <button className="add-button">+ Add Transaction</button>
          </div>
        </header>

        {activePage === "Dashboard" ? (
          <>
            <section className="cards">
              <div className="card balance-card">
                <div className="card-top">
                  <span>Total Balance</span>
                  <span className="card-icon">💳</span>
                </div>
                <h2>{formatMoney(balance)}</h2>
                <p className="positive">+8.2% from last month</p>
              </div>

              <div className="card">
                <div className="card-top">
                  <span>Income</span>
                  <span className="card-icon income-icon">↗</span>
                </div>
                <h2>{formatMoney(income)}</h2>
                <p className="positive">+12.5% from last month</p>
              </div>

              <div className="card">
                <div className="card-top">
                  <span>Expense</span>
                  <span className="card-icon expense-icon">↘</span>
                </div>
                <h2>{formatMoney(expense)}</h2>
                <p className="negative">-4.3% from last month</p>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel chart-panel">
                <div className="panel-header">
                  <div>
                    <h3>Spending Overview</h3>
                    <p>Your spending this month</p>
                  </div>

                  <select>
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>This Year</option>
                  </select>
                </div>

                <div className="chart">
                  <div className="y-axis">
                    <span>1M</span>
                    <span>750K</span>
                    <span>500K</span>
                    <span>250K</span>
                    <span>0</span>
                  </div>

                  <div className="bars">
                    <div className="bar-item">
                      <div className="bar" style={{ height: "35%" }}></div>
                      <span>Mon</span>
                    </div>

                    <div className="bar-item">
                      <div className="bar" style={{ height: "55%" }}></div>
                      <span>Tue</span>
                    </div>

                    <div className="bar-item">
                      <div className="bar" style={{ height: "45%" }}></div>
                      <span>Wed</span>
                    </div>

                    <div className="bar-item">
                      <div className="bar" style={{ height: "75%" }}></div>
                      <span>Thu</span>
                    </div>

                    <div className="bar-item">
                      <div className="bar" style={{ height: "50%" }}></div>
                      <span>Fri</span>
                    </div>

                    <div className="bar-item">
                      <div className="bar" style={{ height: "85%" }}></div>
                      <span>Sat</span>
                    </div>

                    <div className="bar-item">
                      <div className="bar" style={{ height: "40%" }}></div>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel categories-panel">
                <div className="panel-header">
                  <div>
                    <h3>Categories</h3>
                    <p>Where your money goes</p>
                  </div>
                  <button className="more">•••</button>
                </div>

                <div className="category">
                  <div className="category-info">
                    <span className="category-icon food">🍜</span>
                    <div>
                      <strong>Food</strong>
                      <p>32%</p>
                    </div>
                  </div>
                  <strong>185K ₫</strong>
                </div>

                <div className="category">
                  <div className="category-info">
                    <span className="category-icon transport">🚗</span>
                    <div>
                      <strong>Transport</strong>
                      <p>21%</p>
                    </div>
                  </div>
                  <strong>120K ₫</strong>
                </div>

                <div className="category">
                  <div className="category-info">
                    <span className="category-icon education">📚</span>
                    <div>
                      <strong>Education</strong>
                      <p>18%</p>
                    </div>
                  </div>
                  <strong>105K ₫</strong>
                </div>

                <div className="category">
                  <div className="category-info">
                    <span className="category-icon entertainment">🎬</span>
                    <div>
                      <strong>Entertainment</strong>
                      <p>15%</p>
                    </div>
                  </div>
                  <strong>90K ₫</strong>
                </div>
              </div>
            </section>

            <section className="panel transactions-panel">
              <div className="panel-header">
                <div>
                  <h3>Recent Transactions</h3>
                  <p>Your latest financial activity</p>
                </div>

                <button className="view-all">View all →</button>
              </div>

              <div className="transaction-list">
                {transactions.map((transaction) => (
                  <div className="transaction" key={transaction.id}>
                    <div className="transaction-left">
                      <div className="transaction-icon">
                        {transaction.icon}
                      </div>

                      <div>
                        <strong>{transaction.name}</strong>
                        <p>{transaction.category} · {transaction.date}</p>
                      </div>
                    </div>

                    <strong className={transaction.amount > 0 ? "money-positive" : "money-negative"}>
                      {transaction.amount > 0 ? "+" : "-"}{formatMoney(transaction.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="empty-page">
            <div className="empty-icon">🚧</div>
            <h2>{activePage}</h2>
            <p>This page will be developed next.</p>
            <button onClick={() => setActivePage("Dashboard")}>
              ← Back to Dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;