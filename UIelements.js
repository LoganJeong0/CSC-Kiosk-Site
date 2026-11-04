function updateClock() {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  });
  document.getElementById('time').textContent = time;
  document.getElementById('date').textContent = date;
}


updateClock();
setInterval(updateClock, 1000);