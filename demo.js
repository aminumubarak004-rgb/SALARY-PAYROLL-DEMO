// Public demo is deliberately self-contained: fictional hard-coded data only.
// Do not add localStorage, API, or private workspace reads/writes to this file.
const sampleRecords = [
  { id: 'DEMO-001', period: '2026-09', name: 'Amina Bello', department: 'Operations', basic: 300000, allowances: 300000, paye: 47850, pension: 38400, other: 7500, net: 506250, workflow: 'Approved', payment: 'Paid' },
  { id: 'DEMO-002', period: '2026-09', name: 'Tunde Okafor', department: 'Finance', basic: 250000, allowances: 250000, paye: 33200, pension: 32000, other: 6250, net: 428550, workflow: 'Under Review', payment: 'Pending' },
  { id: 'DEMO-003', period: '2026-09', name: 'Zara Ibrahim', department: 'People', basic: 200000, allowances: 200000, paye: 23900, pension: 25600, other: 5000, net: 345500, workflow: 'Draft', payment: 'Pending' },
  { id: 'DEMO-004', period: '2026-08', name: 'Amina Bello', department: 'Operations', basic: 300000, allowances: 300000, paye: 47850, pension: 38400, other: 7500, net: 506250, workflow: 'Approved', payment: 'Paid' },
  { id: 'DEMO-005', period: '2026-08', name: 'Tunde Okafor', department: 'Finance', basic: 250000, allowances: 250000, paye: 33200, pension: 32000, other: 6250, net: 428550, workflow: 'Approved', payment: 'Paid' },
  { id: 'DEMO-006', period: '2026-08', name: 'Zara Ibrahim', department: 'People', basic: 200000, allowances: 200000, paye: 23900, pension: 25600, other: 5000, net: 345500, workflow: 'Under Review', payment: 'Pending' },
];
const $ = (id) => document.getElementById(id);
const money = (value) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value || 0);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const periods = [...new Set(sampleRecords.map((record) => record.period))].sort().reverse();
const departments = [...new Set(sampleRecords.map((record) => record.department))].sort();
const periodLabel = (period) => new Date(`${period}-01T00:00:00`).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
const deductions = (record) => record.paye + record.pension + record.other;

function fillSelect(select, values, allLabel) {
  select.innerHTML = `${allLabel ? `<option value="">${allLabel}</option>` : ''}${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value.includes('-') ? periodLabel(value) : value)}</option>`).join('')}`;
}
function selectedRecords(period, department = '') {
  return sampleRecords.filter((record) => (!period || period === 'all' || record.period === period) && (!department || record.department === department));
}
function renderDashboard() {
  const selected = selectedRecords($('dashboard-period').value, $('dashboard-department').value);
  const gross = selected.reduce((sum, record) => sum + record.basic + record.allowances, 0);
  const totalDeductions = selected.reduce((sum, record) => sum + deductions(record), 0);
  $('metric-employees').textContent = new Set(selected.map((record) => record.name)).size;
  $('metric-paid').textContent = selected.filter((record) => record.payment === 'Paid').length;
  $('metric-paid-note').textContent = `of ${selected.length} sample records`;
  $('metric-gross').textContent = money(gross);
  $('metric-net').textContent = money(gross - totalDeductions);
  $('metric-deductions').textContent = money(totalDeductions);
  $('metric-pending').textContent = selected.filter((record) => record.payment !== 'Paid').length;
  $('trend-chart').innerHTML = periods.map((period) => {
    const rows = selectedRecords(period, $('dashboard-department').value);
    const monthGross = rows.reduce((sum, record) => sum + record.basic + record.allowances, 0);
    const monthNet = rows.reduce((sum, record) => sum + record.net, 0);
    const max = Math.max(gross, 1);
    return `<div class="trend-column"><div class="trend-bars"><i style="height:${Math.max(4, monthGross / max * 100)}%"></i><b style="height:${Math.max(4, monthNet / max * 100)}%"></b></div><small>${escapeHtml(period.slice(2))}</small></div>`;
  }).join('');
  $('status-chart').innerHTML = ['Paid', 'Pending'].map((status) => `<div class="status-row"><span><i class="status-dot ${status.toLowerCase()}"></i>${status}</span><strong>${selected.filter((record) => record.payment === status).length}</strong></div>`).join('');
  const byDepartment = departments.map((department) => [department, selected.filter((record) => record.department === department).reduce((sum, record) => sum + record.basic + record.allowances, 0)]).filter(([, amount]) => amount);
  const maxDepartment = Math.max(...byDepartment.map(([, amount]) => amount), 1);
  $('department-chart').innerHTML = byDepartment.map(([department, amount]) => `<div class="bar-row"><span>${escapeHtml(department)}</span><i><b style="width:${amount / maxDepartment * 100}%"></b></i><strong>${money(amount)}</strong></div>`).join('');
  const deductionTypes = [['paye', 'PAYE'], ['pension', 'Pension'], ['other', 'Other']];
  $('deduction-chart').innerHTML = deductionTypes.map(([key, label]) => {
    const total = selected.reduce((sum, record) => sum + record[key], 0);
    return `<div class="bar-row"><span>${label}</span><i><b style="width:${Math.min(100, total / Math.max(totalDeductions, 1) * 100)}%"></b></i><strong>${money(total)}</strong></div>`;
  }).join('');
}
function renderRecords() {
  const period = $('record-period').value;
  const department = $('record-department').value;
  const status = $('record-status').value;
  const query = $('record-search').value.trim().toLowerCase();
  const selected = sampleRecords.filter((record) => (!period || record.period === period) && (!department || record.department === department) && (!status || record.workflow === status) && (!query || `${record.name} ${record.department}`.toLowerCase().includes(query)));
  $('records-body').innerHTML = selected.map((record) => `<tr><td>${escapeHtml(periodLabel(record.period))}</td><td>${escapeHtml(record.name)}<small>${escapeHtml(record.id)}</small></td><td>${escapeHtml(record.department)}</td><td>${money(record.basic + record.allowances)}</td><td>${money(deductions(record))}</td><td><strong>${money(record.net)}</strong></td><td>${escapeHtml(record.workflow)}</td><td>${escapeHtml(record.payment)}</td></tr>`).join('');
  $('records-empty').classList.toggle('hidden', selected.length > 0);
}
function renderEmployeeReport() {
  const name = $('report-employee').value;
  const employeeRecords = sampleRecords.filter((record) => record.name === name).sort((a, b) => b.period.localeCompare(a.period));
  const gross = employeeRecords.reduce((sum, record) => sum + record.basic + record.allowances, 0);
  const net = employeeRecords.reduce((sum, record) => sum + record.net, 0);
  $('employee-report-output').innerHTML = `<div class="profile-header"><div><p class="kicker">Fictional sample profile</p><h3>${escapeHtml(name)}</h3><span>${escapeHtml(employeeRecords[0]?.department || '')} / Demo employee</span></div><div class="profile-total"><small>Total sample net pay</small><strong>${money(net)}</strong></div></div><div class="summary-grid compact-summary"><div><span>Records</span><strong>${employeeRecords.length}</strong></div><div><span>Gross earnings</span><strong>${money(gross)}</strong></div><div><span>Deductions</span><strong>${money(gross - net)}</strong></div></div><div class="table-wrap"><table><thead><tr><th>Month</th><th>Gross</th><th>PAYE</th><th>Pension</th><th>Net pay</th><th>Payment</th></tr></thead><tbody>${employeeRecords.map((record) => `<tr><td>${escapeHtml(periodLabel(record.period))}</td><td>${money(record.basic + record.allowances)}</td><td>${money(record.paye)}</td><td>${money(record.pension)}</td><td><strong>${money(record.net)}</strong></td><td>${escapeHtml(record.payment)}</td></tr>`).join('')}</tbody></table></div>`;
}
function renderCompanyReport() {
  const selected = selectedRecords($('company-period').value);
  const totals = selected.reduce((sum, record) => ({ basic: sum.basic + record.basic, allowances: sum.allowances + record.allowances, gross: sum.gross + record.basic + record.allowances, deductions: sum.deductions + deductions(record), net: sum.net + record.net }), { basic: 0, allowances: 0, gross: 0, deductions: 0, net: 0 });
  $('company-summary').innerHTML = [['Sample records', selected.length], ['Basic salary', money(totals.basic)], ['Allowances', money(totals.allowances)], ['Gross payroll', money(totals.gross)], ['Deductions', money(totals.deductions)], ['Net payable', money(totals.net)]].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
  $('company-body').innerHTML = selected.map((record) => `<tr><td>${escapeHtml(record.name)}</td><td>${escapeHtml(record.department)}</td><td>${money(record.basic)}</td><td>${money(record.allowances)}</td><td>${money(record.basic + record.allowances)}</td><td>${money(deductions(record))}</td><td><strong>${money(record.net)}</strong></td></tr>`).join('');
}

fillSelect($('dashboard-period'), periods, 'All sample periods');
fillSelect($('dashboard-department'), departments, 'All departments');
fillSelect($('record-period'), periods, 'All periods');
fillSelect($('record-department'), departments, 'All departments');
fillSelect($('report-employee'), [...new Set(sampleRecords.map((record) => record.name))]);
fillSelect($('company-period'), periods, 'All sample periods');
$('dashboard-period').value = periods[0];
$('company-period').value = 'all';
$('dashboard-period').addEventListener('change', renderDashboard);
$('dashboard-department').addEventListener('change', renderDashboard);
['record-period', 'record-department', 'record-status', 'record-search'].forEach((id) => $(id).addEventListener('input', renderRecords));
$('report-employee').addEventListener('change', renderEmployeeReport);
$('company-period').addEventListener('change', renderCompanyReport);
document.querySelectorAll('.nav-tab').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.nav-tab').forEach((item) => item.classList.toggle('active', item === button));
  document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === `${button.dataset.view}-view`));
}));
renderDashboard();
renderRecords();
renderEmployeeReport();
renderCompanyReport();
