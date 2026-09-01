export const openGoogleMaps = (locationName?: string, universityName?: string) => {
  if (!locationName || !locationName.trim() || locationName.toLowerCase().includes('da definire')) {
    return;
  }
  const queryParts = [locationName.trim()];
  if (universityName && universityName.trim()) {
    queryParts.push(universityName.trim());
  }
  const query = encodeURIComponent(queryParts.join(' '));
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
