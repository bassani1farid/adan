function showPrayerTimes(timings, dateHijri, timezone) {
  document.getElementById('Fajr').textContent = timings.Fajr;
  document.getElementById('Dhuhr').textContent = timings.Dhuhr;
  document.getElementById('Asr').textContent = timings.Asr;
  document.getElementById('Maghrib').textContent = timings.Maghrib;
  document.getElementById('Isha').textContent = timings.Isha;

  document.getElementById('location').textContent = timezone;
  document.getElementById('date').textContent =
    `التاريخ الهجري: ${dateHijri.day} ${dateHijri.month.ar} ${dateHijri.year} هـ`;

  document.getElementById('loading').style.display = 'none';
  document.getElementById('prayer-times').style.display = 'table';
}

// Add a timeout to fetch
function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  return Promise.race([
    fetch(resource),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout)
    )
  ]);
}

function fetchPrayerTimes(lat, lon) {
  const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4&language=ar`;
  fetchWithTimeout(url)
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        const timings = data.data.timings;
        const dateHijri = data.data.date.hijri;
        const timezone = data.data.meta.timezone;

        // Cache the prayer times
        localStorage.setItem('prayerTimes', JSON.stringify({
          timings: timings,
          dateHijri: dateHijri,
          timezone: data.data.meta.timezone
        }));

        showPrayerTimes(timings, dateHijri, timezone);
      } else {
        document.getElementById('loading').textContent = 'حدث خطأ أثناء جلب أوقات الصلاة.';
      }
    })
    .catch(() => {
      document.getElementById('loading').textContent = 'تعذر الاتصال بالخادم.';
    });
}

// Show cached prayer times instantly if available
const cached = localStorage.getItem('prayerTimes');
if (cached) {
  const data = JSON.parse(cached);
  showPrayerTimes(data.timings, data.dateHijri, data.timezone);
} else {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
      },
      error => {
        document.getElementById('loading').textContent = 'لم يتم السماح بتحديد الموقع.';
        document.getElementById('location').textContent = '';
      }
    );
  } else {
    document.getElementById('loading').textContent = 'المتصفح لا يدعم تحديد الموقع.';
    document.getElementById('location').textContent = '';
  }
}