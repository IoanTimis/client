// Helpers to produce dashboard-specific form configs (i18n-aware)
export function getFeatureOptions(t) {
  return [
    { value: 'surface', label: t('resource.features.surface') || 'Surface' },
    { value: 'level', label: t('resource.features.level') || 'Level' },
    // mark boolean features with kind: 'boolean' to render a yes/no select in forms
    { value: 'new', label: t('resource.features.new') || 'New', kind: 'boolean' },
  ];
}

export function getCreateFields(t) {
  const featureOptions = getFeatureOptions(t);
  return [
  { name: 'name', label: t('resource.form.name'), type: 'text', required: true },
  { name: 'description', label: t('resource.form.description'), type: 'textarea', required: true, rows: 4 },
  { name: 'price', label: t('resource.form.price'), type: 'number', required: true },
  { name: 'latitude', label: t('resource.form.latitude') || 'Latitudine', type: 'text', required: true, placeholder: t('resource.form.latitudePlaceholder') || "44.4268 sau 44°25'36.6\"N" },
  { name: 'longitude', label: t('resource.form.longitude') || 'Longitudine', type: 'text', required: true, placeholder: t('resource.form.longitudePlaceholder') || "26.1025 sau 26°06'09.0\"E/V" },
  { name: 'features', label: t('resource.form.features'), type: 'featureList', defaultValue: [], required: true, allowCustom: false, showAddButton: false, options: featureOptions },
  { name: 'images', label: t('resource.form.images'), type: 'file', multiple: true, help: t('resource.form.imagesHelp') },
  ];
}

export function getEditFields(t, editing) {
  if (!editing) return [];
  const featureOptions = getFeatureOptions(t);
  const booleanNames = new Set((featureOptions || []).filter(o => o.kind === 'boolean').map(o => String(o.value).toLowerCase()));
  const toBool = (val) => {
    if (typeof val === 'boolean') return val;
    const s = String(val ?? '').trim().toLowerCase();
    if (["true","1","da","yes","y"].includes(s)) return true;
    if (["false","0","nu","no","n"].includes(s)) return false;
    return '';
  };
  return [
  { name: 'name', label: t('resource.form.name'), type: 'text', required: true, defaultValue: editing.name },
  { name: 'description', label: t('resource.form.description'), type: 'textarea', required: true, rows: 4, defaultValue: editing.description || '' },
  { name: 'price', label: t('resource.form.price'), type: 'number', required: true, defaultValue: editing.price },
  { name: 'latitude', label: t('resource.form.latitude') || 'Latitudine', type: 'text', required: true, defaultValue: editing?.coordinates?.latitude != null ? String(editing.coordinates.latitude) : '', placeholder: "44.4268 sau 44°25'36.6\"N" },
  { name: 'longitude', label: t('resource.form.longitude') || 'Longitudine', type: 'text', required: true, defaultValue: editing?.coordinates?.longitude != null ? String(editing.coordinates.longitude) : '', placeholder: "26.1025 sau 26°06'09.0\"E" },
  { name: 'features', label: t('resource.form.features'), type: 'featureList', required: true, allowCustom: false, showAddButton: false, options: featureOptions, defaultValue: (Array.isArray(editing.features) ? editing.features.map(f => {
    const name = String(f?.name || '').toLowerCase();
    const rawVal = f?.value;
    const value = booleanNames.has(name) ? toBool(rawVal) : String(rawVal ?? '');
    return { name: String(f?.name || ''), value };
  }) : []) },
  { name: 'images', label: t('resource.form.images'), type: 'file', multiple: true, help: t('resource.form.imagesHelp') },
  ];
}

const dashboardConfig = {
  getFeatureOptions,
  getCreateFields,
  getEditFields,
};

export default dashboardConfig;
