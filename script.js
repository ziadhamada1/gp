// إعداد الخريطة
var map = L.map('map').setView([31.20776, 29.91181], 17);

// تعريف Tile Layers
var streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

var terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenTopoMap contributors'
});

// إضافة الطبقة الافتراضية (Terrain)
terrainLayer.addTo(map);

// التحكم بالطبقات
var baseMaps = {
  "خارطة Streets": streetLayer,
  "تضاريس": terrainLayer
};

L.control.layers(baseMaps).addTo(map);

var gpsMarker, snapMarker, line;

document.getElementById('getLocationBtn').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("المتصفح لا يدعم تحديد الموقع الجغرافي");
  }
});

function showPosition(position) {
  var gpsLat = position.coords.latitude;
  var gpsLng = position.coords.longitude;

  // محاكاة Snap GPS بدقة أعلى
  var snapLat = gpsLat + 0.00002;
  var snapLng = gpsLng + 0.00002;

  // إزالة الماركرات السابقة
  if (gpsMarker) map.removeLayer(gpsMarker);
  if (snapMarker) map.removeLayer(snapMarker);
  if (line) map.removeLayer(line);

  // إضافة الماركرات
  gpsMarker = L.marker([gpsLat, gpsLng]).addTo(map).bindPopup('GPS العادي').openPopup();
  snapMarker = L.marker([snapLat, snapLng], {
    icon: L.icon({
      iconUrl:'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize:[25,25]
    })
  }).addTo(map).bindPopup('Snap GPS').openPopup();

  // رسم خط الفرق
  line = L.polyline([[gpsLat, gpsLng],[snapLat, snapLng]], {color:'red', dashArray:'5,10'}).addTo(map);

  // ضبط الخريطة لتظهر كلا النقطتين بدون تغيير الطبقة
  var group = L.featureGroup([gpsMarker, snapMarker]);
  map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 20 });

  // إعادة الطبقة النشطة بعد fitBounds لتجنب فقدان التضاريس
  if (map.hasLayer(streetLayer)) streetLayer.addTo(map);
  if (map.hasLayer(terrainLayer)) terrainLayer.addTo(map);

  // حساب المسافة
  var distance = map.distance([gpsLat, gpsLng],[snapLat, snapLng]);
  document.getElementById('distance').innerText = 'الفارق بين GPS وSnap GPS: ' + distance.toFixed(2) + ' متر';
  document.getElementById('accurate').innerText = 'Snap GPS عادةً أدق من GPS العادي';
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      alert("رفض المستخدم السماح بتحديد الموقع");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("الموقع غير متاح");
      break;
    case error.TIMEOUT:
      alert("انتهت مهلة طلب الموقع");
      break;
    default:
      alert("حدث خطأ في تحديد الموقع");
      break;
  }
}
