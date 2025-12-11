const form = document.getElementById('eggForm');
const recordList = document.getElementById('recordList');
const weeklyTotal = document.getElementById('weeklyTotal');
const clearBtn = document.getElementById('clearAll');
let chart;

// Load data
function loadRecords() {
  const records = JSON.parse(localStorage.getItem('bountyFarmEggs') || '[]');
  records.sort((a,b) => new Date(b.date) - new Date(a.date));
  return records;
}

// Save record
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const date = document.getElementById('date').value;
  const record = {
    date,
    frizzle: parseInt(document.getElementById('frizzle').value) || 0,
    silkie: parseInt(document.getElementById('silkie').value) || 0,
    guinea: parseInt(document.getElementById('guinea').value) || 0,
    total: () => record.frizzle + record.silkie + record.guinea
  };
  record.total = record.frizzle + record.silkie + record.guinea;

  const records = loadRecords();
  // Remove old entry for same date
  const filtered = records.filter(r => r.date !== date);
  filtered.push(record);
  
  localStorage.setItem('bountyFarmEggs', JSON.stringify(filtered));
  
  updateAll();
  form.reset();
  document.getElementById('date').valueAsDate = new Date();
});

// Update everything
function updateAll() {
  displayRecords();
  updateWeeklyTotal();
  updateChart();
}

function displayRecords() {
  const records = loadRecords();
  recordList.innerHTML = records.map(r => `
    <div class="record-item">
      <strong>${new Date(r.date).toLocaleDateString('en-GB')}</strong>: 
      🐔 ${r.frizzle} | 🐥 ${r.silkie} | 🐦 ${r.guinea} 
      → <strong>${r.total} eggs</strong>
    </div>
  `).join('');
}

function updateWeeklyTotal() {
  const records = loadRecords();
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7*24*60*60*1000);
  
  const thisWeek = records.filter(r => new Date(r.date) >= weekAgo);
  const total = thisWeek.reduce((sum, r) => sum + r.total, 0);
  
  weeklyTotal.textContent = `${total} eggs this week 🥚`;
}

function updateChart() {
  const records = loadRecords();
  const last30Days = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const record = records.find(r => r.date === dateStr);
    last30Days.push({
      date: date.toLocaleDateString('en', {weekday: 'short'}),
      frizzle: record?.frizzle || 0,
      silkie: record?.silkie || 0,
      guinea: record?.guinea || 0,
      total: (record?.total) || 0
    });
  }

  const ctx = document.getElementById('eggChart').getContext('2d');
  
  if (chart) chart.destroy();
  
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: last30Days.map(d => d.date),
      datasets: [
        {
          label: 'Frizzle Hens',
          data: last30Days.map(d => d.frizzle),
          backgroundColor: '#f4a261'
        },
        {
          label: 'Silkie Chickens',
          data: last30Days.map(d => d.silkie),
          backgroundColor: '#2d6a4f'
        },
        {
          label: 'Guinea Fowl',
          data: last30Days.map(d => d.guinea),
          backgroundColor: '#1b1b1e'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: false },
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    }
  });
}

// Clear all data
clearBtn.addEventListener('click', () => {
  if (confirm('Delete ALL egg records? This cannot be undone!')) {
    localStorage.removeItem('bountyFarmEggs');
    updateAll();
  }
});

// Init
document.getElementById('date').valueAsDate = new Date();
updateAll();
