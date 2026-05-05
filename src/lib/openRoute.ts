export function openRoute(lat: number, lng: number) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${lat},${lng}&travelmode=driving`;
      window.open(url, "_blank", "noopener");
    },
    () => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank", "noopener");
    },
  );
}