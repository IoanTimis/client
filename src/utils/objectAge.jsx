export function objectAge(obj, language = 'ro') {
  if (!obj) return '';
  const date = obj.createdAt ? new Date(obj.createdAt) : null;
  if (!date || isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const wk = Math.floor(day / 7);
  const mo = Math.floor(day / 30);
  const yr = Math.floor(day / 365);
  const t = (ro, en) => (language?.startsWith('ro') ? ro : en);
  if (yr > 0) return t(`acum ${yr} ${yr === 1 ? 'an' : 'ani'}`, `${yr} year${yr>1?'s':''} ago`);
  if (mo > 0) return t(`acum ${mo} ${mo === 1 ? 'lună' : 'luni'}`, `${mo} month${mo>1?'s':''} ago`);
  if (wk > 0) return t(`acum ${wk} ${wk === 1 ? 'săptămână' : 'săptămâni'}`, `${wk} week${wk>1?'s':''} ago`);
  if (day > 0) return t(`acum ${day} ${day === 1 ? 'zi' : 'zile'}`, `${day} day${day>1?'s':''} ago`);
  if (hr > 0) return t(`acum ${hr} ${hr === 1 ? 'oră' : 'ore'}`, `${hr} hour${hr>1?'s':''} ago`);
  if (min > 0) return t(`acum ${min} ${min === 1 ? 'minut' : 'minute'}`, `${min} minute${min>1?'s':''} ago`);
  return t('acum câteva secunde', 'just now');
}
