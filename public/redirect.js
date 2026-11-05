if (window.location.hostname === 'adibdex.lovable.app') {
  const destination = new URL(window.location.href);
  destination.protocol = 'https:';
  destination.hostname = 'adibdex.com';
  destination.port = '';
  window.location.replace(destination.href);
}
