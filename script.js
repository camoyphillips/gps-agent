const API_URL = '/api/logs';

window.onload = async () => {
  try {
    const res = await fetch(API_URL);
    const logs = await res.json();

    const tbody = document.querySelector('#logTable tbody');
    logs.forEach(log => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${new Date(log.timestamp).toLocaleString()}</td>
        <td>${log.phone}</td>
        <td>${log.lat}</td>
        <td>${log.lng}</td>
        <td>${log.zoneName}</td>
        <td>${log.action}</td>
        <td class="triggered-${log.triggered}">${log.triggered ? 'Yes' : 'No'}</td>
      `;

      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Failed to load logs:', err);
  }
};
