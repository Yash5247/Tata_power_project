// Example: ping the health endpoint on load (optional)
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      console.log('Health:', data);
    }
  } catch (e) {
    console.warn('Health check failed');
  }
});


