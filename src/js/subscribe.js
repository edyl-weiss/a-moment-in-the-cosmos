// Daily-email sign-up form, and the short notes shown when someone arrives back from a confirm or
// unsubscribe link (#subscribed, #unsubscribed, #email-expired, #email-error).
import { $ } from './util.js';

const form = $('#signupForm'), msg = $('#signupMsg'), btn = $('#signupBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#signupEmail').value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = 'That doesn’t look like an email address'; msg.dataset.kind = 'err'; return; }
  btn.disabled = true; msg.textContent = 'Sending…'; msg.dataset.kind = '';
  try {
    const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, website: form.website.value }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again later');
    msg.textContent = 'Almost there. Check your inbox for a confirmation email';
    msg.dataset.kind = 'ok';
    form.reset();
  } catch (err) {
    msg.textContent = err.message.startsWith('Failed') ? 'Couldn’t reach the server. Please try again later' : err.message;
    msg.dataset.kind = 'err';
  } finally { btn.disabled = false; }
});

const NOTES = {
  '#subscribed': 'You’re subscribed. Tomorrow’s photograph will find its way to you just after midnight UTC',
  '#unsubscribed': 'You’re unsubscribed. No more emails',
  '#email-expired': 'That link has expired or isn’t valid. Try signing up again',
  '#email-error': 'Something went wrong confirming your email. Please try the link again'
};
function showNote() {
  const note = NOTES[location.hash];
  if (!note) return;
  history.replaceState(null, '', location.pathname + location.search);   // tidy the address bar
  const t = $('#toast');
  t.textContent = note; t.hidden = false;
  requestAnimationFrame(() => t.classList.add('on'));
  setTimeout(() => { t.classList.remove('on'); setTimeout(() => { t.hidden = true; }, 400); }, 6000);
  t.onclick = () => { t.classList.remove('on'); t.hidden = true; };
}
showNote();
addEventListener('hashchange', showNote);
