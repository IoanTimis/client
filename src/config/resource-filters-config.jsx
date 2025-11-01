// Reusable filters config for product listing pages
export function getSortOptions(t) {
  return [
    { value: "createdAt:DESC", label: t('resources.filters.sortOptions.createdAtDESC') },
    { value: "createdAt:ASC", label: t('resources.filters.sortOptions.createdAtASC') },
    { value: "price:ASC", label: t('resources.filters.sortOptions.priceASC') },
    { value: "price:DESC", label: t('resources.filters.sortOptions.priceDESC') },
    { value: "name:ASC", label: t('resources.filters.sortOptions.nameASC') },
    { value: "name:DESC", label: t('resources.filters.sortOptions.nameDESC') },
  ];
}

export function getCamereOptions(t) {
  return [
    { value: "", label: t('common.all') },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
    { value: "6", label: "6" },
  ];
}

export function getFilters(t, sortBy, order) {
  const sortOptions = getSortOptions(t);
  const camereOptions = getCamereOptions(t);
  return [
    { key: "sort", label: t('resources.filters.sort'), type: "select", options: sortOptions },
    { key: "minPrice", label: t('resources.filters.minPrice'), type: "number", placeholder: t('resources.filters.placeholders.from'), step: "0.01" },
    { key: "maxPrice", label: t('resources.filters.maxPrice'), type: "number", placeholder: t('resources.filters.placeholders.to'), step: "0.01" },
    { key: "camere", label: t('resources.filters.rooms'), type: "select", options: camereOptions },
    { key: "suprafataMin", label: t('resources.filters.surfaceMin'), type: "number", placeholder: t('resources.filters.placeholders.min'), step: "5" },
    { key: "suprafataMax", label: t('resources.filters.surfaceMax'), type: "number", placeholder: t('resources.filters.placeholders.max'), step: "5" },
  ];
}

export function getDefaultValues(sortBy, order) {
  return {
    sort: `${sortBy}:${order}`,
    minPrice: "",
    maxPrice: "",
    camere: "",
    suprafataMin: "",
    suprafataMax: "",
  };
}

const resourceFiltersConfig = {
  getSortOptions,
  getCamereOptions,
  getFilters,
  getDefaultValues,
};

export default resourceFiltersConfig;
