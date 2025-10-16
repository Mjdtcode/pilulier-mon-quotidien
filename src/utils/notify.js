export function ensureNotifPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') Notification.requestPermission();
}

export function notify(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body });
}
