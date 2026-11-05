const redirectHosts = new Set(['adibdex.lovable.app', 'adibdex.netlify.app']);

if (redirectHosts.has(window.location.hostname)) {
  const destination = new URL(window.location.href);
  destination.protocol = 'https:';
  destination.hostname = 'adibdex.com';
  destination.port = '';
  window.location.replace(destination.href);
}
