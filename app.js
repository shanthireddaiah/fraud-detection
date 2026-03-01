// ============================================================
// FRAUD DETECTION PLATFORM — SHARED UTILITIES
// ============================================================

// AUTH
const USERS = [
  { email: 'shanthireddaiah@gmail.com', password: '1234', role: 'user', name: 'Shanthi Reddaiah' },
  { email: 'admin@gmail.com', password: 'admin', role: 'admin', name: 'Platform Admin' }
];

const Auth = {
  login(email, password) {
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('fd_session', JSON.stringify({ email: user.email, role: user.role, name: user.name }));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials. Please try again.' };
  },
  logout() {
    localStorage.removeItem('fd_session');
    window.location.href = 'index.html';
  },
  getSession() {
    const s = localStorage.getItem('fd_session');
    return s ? JSON.parse(s) : null;
  },
  isLoggedIn() { return !!this.getSession(); },
  isAdmin() { const s = this.getSession(); return s && s.role === 'admin'; },
  isUser() { const s = this.getSession(); return s && s.role === 'user'; },
  requireAuth(redirectTo = 'login.html') {
    if (!this.isLoggedIn()) { window.location.href = redirectTo; return false; }
    return true;
  },
  requireAdmin() {
    if (!this.isAdmin()) { window.location.href = 'index.html'; return false; }
    return true;
  }
};

// REPORTS (localStorage CRUD)
const Reports = {
  getAll() {
    return JSON.parse(localStorage.getItem('fd_reports') || '[]');
  },
  getByUser(email) {
    return this.getAll().filter(r => r.userEmail === email);
  },
  save(reports) {
    localStorage.setItem('fd_reports', JSON.stringify(reports));
  },
  add(report) {
    const reports = this.getAll();
    const newReport = {
      id: 'RPT-' + Date.now(),
      ...report,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    reports.unshift(newReport);
    this.save(reports);
    return newReport;
  },
  updateStatus(id, status) {
    const reports = this.getAll();
    const idx = reports.findIndex(r => r.id === id);
    if (idx > -1) {
      reports[idx].status = status;
      reports[idx].updatedAt = new Date().toISOString();
      this.save(reports);
      return true;
    }
    return false;
  },
  seedDemoData() {
    if (this.getAll().length > 0) return;
    const demo = [
      { id: 'RPT-001', userEmail: 'shanthireddaiah@gmail.com', userName: 'Shanthi Reddaiah', fraudType: 'Phishing', description: 'Received a suspicious email claiming to be from my bank asking for OTP.', location: 'Mumbai', amount: '50000', status: 'verified', createdAt: new Date(Date.now()-86400000*5).toISOString(), updatedAt: new Date(Date.now()-86400000*2).toISOString() },
      { id: 'RPT-002', userEmail: 'shanthireddaiah@gmail.com', userName: 'Shanthi Reddaiah', fraudType: 'Identity Theft', description: 'Someone opened a credit card using my Aadhaar details without my knowledge.', location: 'Delhi', amount: '120000', status: 'in-review', createdAt: new Date(Date.now()-86400000*3).toISOString(), updatedAt: new Date(Date.now()-86400000*1).toISOString() },
      { id: 'RPT-003', userEmail: 'shanthireddaiah@gmail.com', userName: 'Shanthi Reddaiah', fraudType: 'Financial Scam', description: 'Got a call about lottery winning and asked to pay processing fee.', location: 'Hyderabad', amount: '15000', status: 'rejected', createdAt: new Date(Date.now()-86400000*7).toISOString(), updatedAt: new Date(Date.now()-86400000*4).toISOString() },
      { id: 'RPT-004', userEmail: 'shanthireddaiah@gmail.com', userName: 'Shanthi Reddaiah', fraudType: 'Social Engineering', description: 'Caller posed as tech support and convinced me to install remote access software.', location: 'Bangalore', amount: '30000', status: 'pending', createdAt: new Date(Date.now()-86400000*1).toISOString(), updatedAt: new Date(Date.now()-86400000*1).toISOString() },
      { id: 'RPT-005', userEmail: 'test@example.com', userName: 'Test User', fraudType: 'Phishing', description: 'Fake UPI payment request through a spoofed app.', location: 'Chennai', amount: '8000', status: 'verified', createdAt: new Date(Date.now()-86400000*10).toISOString(), updatedAt: new Date(Date.now()-86400000*6).toISOString() },
      { id: 'RPT-006', userEmail: 'test@example.com', userName: 'Test User', fraudType: 'Investment Fraud', description: 'Promised 50% returns on crypto investments. Lost all principal.', location: 'Pune', amount: '200000', status: 'in-review', createdAt: new Date(Date.now()-86400000*2).toISOString(), updatedAt: new Date(Date.now()-86400000*1).toISOString() },
    ];
    this.save(demo);
  }
};

// TOAST
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container') || (() => {
    const c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
    return c;
  })();
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]||'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// FORMAT DATE
function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// FORMAT AMOUNT
function formatAmount(amt) {
  if (!amt) return '-';
  return '₹' + Number(amt).toLocaleString('en-IN');
}

// STATUS BADGE HTML
function statusBadge(status) {
  const map = {
    pending: ['badge-pending', '◷ Pending'],
    verified: ['badge-verified', '✓ Verified'],
    rejected: ['badge-rejected', '✕ Rejected'],
    'in-review': ['badge-review', '⟳ In Review']
  };
  const [cls, label] = map[status] || ['badge-pending', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

// RENDER NAV
function renderNav(activePage = '') {
  const session = Auth.getSession();
  const navLinks = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About' },
    { href: 'contact.html', label: 'Contact' },
    { href: 'terms.html', label: 'Terms' },
  ];

  if (session?.role === 'user') navLinks.push({ href: 'dashboard.html', label: 'Dashboard' });
  if (session?.role === 'admin') navLinks.push({ href: 'admin.html', label: 'Admin Panel' });
  if (session) navLinks.push({ href: 'profile.html', label: 'Profile' });

  const linksHTML = navLinks.map(l =>
    `<li><a href="${l.href}" class="${activePage === l.href ? 'active' : ''}">${l.label}</a></li>`
  ).join('');

  const authHTML = session
    ? `<span style="color:var(--text3);font-size:0.85rem;">Hi, ${session.name.split(' ')[0]}</span>
       <button class="btn btn-ghost btn-sm" onclick="Auth.logout()">Sign Out</button>`
    : `<a href="login.html" class="btn btn-ghost btn-sm">Sign In</a>
       <a href="login.html" class="btn btn-primary btn-sm">Get Started</a>`;

  return `
  <nav>
    <a href="index.html" class="nav-logo">
      <div class="logo-icon">🛡</div>
      FraudShield
    </a>
    <ul class="nav-links" id="nav-links">${linksHTML}</ul>
    <div class="nav-auth" id="nav-auth">${authHTML}</div>
    <button class="nav-toggle" onclick="toggleMobileNav()" id="nav-toggle">☰</button>
  </nav>`;
}

function toggleMobileNav() {
  document.getElementById('nav-links').classList.toggle('open');
  document.getElementById('nav-auth').classList.toggle('open');
}

// RENDER FOOTER
function renderFooter() {
  return `
  <footer>
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="nav-logo" style="text-decoration:none;">
          <div class="logo-icon">🛡</div>
          FraudShield
        </a>
        <p>A citizen-first fraud detection and reporting platform. Identify, understand, and report digital fraud — with or without an account.</p>
      </div>
      <div class="footer-links">
        <h4>Platform</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="dashboard.html">Dashboard</a></li>
          <li><a href="admin.html">Admin</a></li>
        </ul>
      </div>
      <div class="footer-links">
        <h4>Legal</h4>
        <ul>
          <li><a href="terms.html">Terms & Conditions</a></li>
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="forgot.html">Forgot Password</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2025 FraudShield. Frontend MVP — For Demonstration Only.</span>
      <span>Built with HTML · CSS · JavaScript</span>
    </div>
  </footer>`;
}

// MODAL HELPERS
function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Seed demo data on every page load
Reports.seedDemoData();
