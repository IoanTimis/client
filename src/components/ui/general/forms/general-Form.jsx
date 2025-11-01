"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/general/primitives";
import { useLanguage } from "@/context/language-context";

/**
 * GeneralForm — configurable form renderer with per-field validation and configurable action.
 *
 * Props:
 * - fields: Array<{
 *     name: string,
 *     label?: string,
 *     type?: 'text'|'number'|'select'|'textarea'|'checkbox'|'radio'|'date'|'email'|'password',
 *     placeholder?: string,
 *     options?: Array<{ value: any, label: string }>, // for select/radio
 *     required?: boolean,
 *     disabled?: boolean,
 *     defaultValue?: any,
 *     help?: string,
 *     validate?: {
 *       min?: number,
 *       max?: number,
 *       minLength?: number,
 *       maxLength?: number,
 *       pattern?: RegExp,
 *       custom?: (value, values) => string | null   // return error message or null
 *     }
 *   }>
 * - initialValues?: Record<string, any>
 * - action?: { url: string, method?: 'POST'|'PUT'|'PATCH'|'DELETE', headers?: Record<string,string>, transform?: (payload)=>any }
 * - onSubmit?: async (payload) => ({ success: boolean, message?: string })  // optional; if missing action is used
 * - onSuccess?: (resp) => void
 * - onError?: (err) => void
 * - submitLabel?: string
 * - className?: string
 * - header?: React.ReactNode | string   // usage/help text shown at top
 * - showSuccess?: boolean (default true)
 * - showReset?: boolean (default true) // whether to show the Reset button
 * - showClose?: boolean (default false) // whether to show a Close button (useful inside modals)
 * - onClose?: () => void // optional callback invoked when Close is clicked (e.g. modal close)
 * - scroll?: boolean (default true) // whether the form itself applies a max-height and makes its body scrollable
 * - maxHeightClass?: string (default 'max-h-[70vh]') // tailwind class for max-height when scroll is true
 * - overflowClass?: string (default 'overflow-auto') // tailwind class for overflow when scroll is true
 *
 * Behavior:
 * - validates fields client-side and shows error text under each input
 * - either calls onSubmit(payload) or posts to action.url (JSON)
 * - shows top success / error message
 */

export default function GeneralForm({
  fields = [],
  initialValues = {},
  action = null,
  onSubmit = null,
  onSuccess = null,
  onError = null,
  cols = { base: 1, md: 2 },
  submitLabel = "Submit",
  className = "",
  header = null,
  showSuccess = true,
  showReset = false,
  showClose = false,
  onClose = null,
  scroll = true,
  maxHeightClass = 'max-h-[70vh]',
  overflowClass = 'overflow-auto',
}) {
  const { t } = useLanguage();
  const buildInitial = () => {
    const vals = { ...(initialValues || {}) };
    fields.forEach((f) => {
      if (vals[f.name] === undefined) {
        vals[f.name] = f.defaultValue ?? (f.type === "checkbox" ? false : "");
      }
    });
    return vals;
  };

  const [values, setValues] = useState(buildInitial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [globalMessage, setGlobalMessage] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [filePreviews, setFilePreviews] = useState({});
  const filePreviewsRef = React.useRef([]);

  useEffect(() => {
    // if initialValues prop changes, reset values (but keep user edits otherwise)
    setValues((prev) => ({ ...buildInitial(), ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues), JSON.stringify(fields)]);

  const inputClass =
    "block w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-gray-500";

  const validateField = (f, val, allValues) => {
    if (!f) return null;
    const v = val;
    if (f.required) {
      if (f.type === "checkbox") {
        if (!v) return f.messageRequired ?? t('form.required');
      } else if (f.type === 'featureList') {
        // require at least one selected feature
        if (!Array.isArray(v) || v.length === 0) return f.messageRequired ?? t('form.required');
      } else if (v === "" || v == null) {
        return f.messageRequired ?? t('form.required');
      }
    }
    const rules = f.validate || {};
    if (rules.min != null && Number(v) < rules.min) return rules.messageMin ?? t('form.min', { min: rules.min });
    if (rules.max != null && Number(v) > rules.max) return rules.messageMax ?? t('form.max', { max: rules.max });
    if (rules.minLength != null && String(v).length < rules.minLength)
      return rules.messageMinLength ?? t('form.minLength', { minLength: rules.minLength });
    if (rules.maxLength != null && String(v).length > rules.maxLength)
      return rules.messageMaxLength ?? t('form.maxLength', { maxLength: rules.maxLength });
    if (rules.pattern && !rules.pattern.test(String(v))) return rules.messagePattern ?? t('form.pattern');
    if (typeof rules.custom === "function") {
      try {
        const res = rules.custom(v, allValues);
        if (typeof res === "string" && res.length) return res;
      } catch (err) {
        return t('form.invalid');
      }
    }
    return null;
  };

  const validateAll = () => {
    const next = {};
    fields.forEach((f) => {
      const v = values[f.name];
      const err = validateField(f, v, values);
      if (err) next[f.name] = err;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (name, rawVal, type) => {
    let v = rawVal;
    if (type === "number") {
      v = rawVal === "" ? "" : Number(rawVal);
    } else if (type === "file") {
      // rawVal may be a FileList or an array of File
      if (rawVal instanceof FileList) v = Array.from(rawVal);
      else if (Array.isArray(rawVal)) v = rawVal;
      else v = rawVal ? [rawVal] : [];
    }
    setValues((p) => ({ ...p, [name]: v }));
    setErrors((p) => ({ ...p, [name]: undefined }));
    setGlobalError(null);
    setGlobalMessage(null);
  };

  // build image previews for file fields (object URLs) and revoke previous URLs on change/unmount
  useEffect(() => {
    // revoke previous
    if (filePreviewsRef.current && filePreviewsRef.current.length) {
      filePreviewsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch (e) {}
      });
    }
    const next = {};
    const created = [];
    fields.forEach((f) => {
      if (f.type === 'file') {
        const files = values[f.name];
        if (Array.isArray(files) && files.length) {
          next[f.name] = files.map((file) => {
            if (file && file.type && file.type.startsWith('image/')) {
              const url = URL.createObjectURL(file);
              created.push(url);
              return { isImage: true, url };
            }
            return { isImage: false, name: file?.name };
          });
        } else {
          next[f.name] = [];
        }
      }
    });
    filePreviewsRef.current = created;
    setFilePreviews(next);
    return () => {
      if (created && created.length) created.forEach((u) => { try { URL.revokeObjectURL(u); } catch (e) {} });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values), JSON.stringify(fields)]);

  const submitPayload = async (payload) => {
    if (typeof onSubmit === "function") {
      // If payload contains File instances, pass FormData to onSubmit
      const containsFile = Object.values(payload).some((val) => {
        if (val instanceof File || val instanceof Blob) return true;
        if (Array.isArray(val) && val.some((i) => i instanceof File || i instanceof Blob)) return true;
        return false;
      });
      if (containsFile) {
        const fd = new FormData();
        fields.forEach((f) => {
          const v = payload[f.name];
          if (f.type === 'file') {
            if (Array.isArray(v)) {
              v.forEach((file) => fd.append(f.name, file));
            } else if (v) {
              fd.append(f.name, v);
            }
          } else if (v !== undefined && v !== null) {
            fd.append(f.name, typeof v === 'object' ? JSON.stringify(v) : String(v));
          }
        });
        return await onSubmit(fd);
      }
      return await onSubmit(payload);
    }
    if (action && action.url) {
      const method = action.method ?? "POST";
      // detect file presence
      const containsFile = Object.values(payload).some((val) => {
        if (val instanceof File || val instanceof Blob) return true;
        if (Array.isArray(val) && val.some((i) => i instanceof File || i instanceof Blob)) return true;
        return false;
      });

      let body;
      let headers = { ...(action.headers || {}) };
      if (containsFile) {
        // build FormData
        const fd = new FormData();
        fields.forEach((f) => {
          const v = payload[f.name];
          if (f.type === 'file') {
            if (Array.isArray(v)) {
              v.forEach((file) => fd.append(f.name, file));
            } else if (v) {
              fd.append(f.name, v);
            }
          } else if (v !== undefined && v !== null) {
            fd.append(f.name, typeof v === 'object' ? JSON.stringify(v) : String(v));
          }
        });
        body = fd;
        // do not set Content-Type header; browser will set boundary
        if (headers['Content-Type']) delete headers['Content-Type'];
      } else {
        const transformed = action.transform ? action.transform(payload) : payload;
        body = JSON.stringify(transformed);
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      }

      const res = await fetch(action.url, {
        method,
        headers,
        body,
      });
      const json = await res.json().catch(() => ({ success: res.ok, status: res.status }));
      return json;
    }
    throw new Error("No onSubmit handler or action provided");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setGlobalError(null);
    setGlobalMessage(null);

    if (!validateAll()) {
      setGlobalError(t('form.validationFailed'));
      return;
    }

    setSubmitting(true);
    try {
      const resp = await submitPayload(values);
      // expect resp to be { success: boolean, message?: string, data?: any }
      const ok = resp && (resp.success === true || resp.status === 200 || resp.status === 201 || resp.ok === true);
      if (ok) {
        if (showSuccess) setGlobalMessage(resp.message ?? t('form.success'));
        if (typeof onSuccess === "function") onSuccess(resp);
      } else {
        const msg = resp?.message ?? t('form.failed');
        setGlobalError(msg);
        if (typeof onError === "function") onError(resp);
      }
    } catch (err) {
      setGlobalError(err?.message ?? t('common.genericError'));
      if (typeof onError === "function") onError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (f) => {
    const v = values[f.name];
    const err = errors[f.name];

    const common = {
      id: f.name,
      name: f.name,
      disabled: f.disabled,
      placeholder: f.placeholder,
      className: inputClass,
      value: v === undefined || v === null ? "" : v,
      onChange: (e) => handleChange(f.name, e.target.value, f.type),
    };

    return (
      <div key={f.name} className="mb-3">
        {f.label ? (
          <label htmlFor={f.name} className="block text-sm font-medium mb-1">
            {f.label}
            {f.required ? <span className="ml-1 text-red-600">*</span> : null}
          </label>
        ) : null}
        {f.type === 'featureList' && (f.required || f.showNote) ? (
          <div className="text-xs text-gray-500 -mt-1 mb-2">
            {t('resource.form.featuresNote') || 'Choose at least one feature.'}
          </div>
        ) : null}

        {f.type === "textarea" ? (
          <textarea {...common} rows={f.rows || 4} className={common.className + " resize-y"} />
        ) : f.type === "select" ? (
          <select
            {...common}
            onChange={(e) => handleChange(f.name, e.target.value, f.type)}
            className={inputClass}
            value={common.value}
          >
            {(f.options || []).map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : f.type === 'featureList' ? (
          <div className="space-y-2">
            {/* Predefined options as single-line rows: checkbox + value input + remove */}
            {(f.options || []).map((opt) => {
              const optName = opt.value;
              const isBoolean = (opt && (opt.kind === 'boolean')) || ['new','nou'].includes(String(optName).toLowerCase());
              const present = Array.isArray(v) && v.find((it) => it?.name === optName);
              const val = present ? present.value : '';
              return (
                <div key={optName} className="w-full">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!present}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setValues((prev) => {
                            const arr = Array.isArray(prev[f.name]) ? [...prev[f.name]] : [];
                            if (checked) {
                              if (!arr.find((it) => it?.name === optName)) {
                                arr.push({ name: optName, value: '' });
                              }
                            } else {
                              const next = arr.filter((it) => it?.name !== optName);
                              return { ...prev, [f.name]: next };
                            }
                            return { ...prev, [f.name]: arr };
                          });
                        }}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {isBoolean ? (
                      <select
                        disabled={!present}
                        className={inputClass + " flex-1"}
                        value={(typeof val === 'boolean') ? String(val) : (val === 'true' || val === 'false' ? val : '')}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const nv = raw === 'true' ? true : raw === 'false' ? false : '';
                          setValues((prev) => {
                            const arr = Array.isArray(prev[f.name]) ? [...prev[f.name]] : [];
                            const idx = arr.findIndex((it) => it?.name === optName);
                            if (idx === -1) {
                              arr.push({ name: optName, value: nv });
                            } else {
                              arr[idx] = { ...arr[idx], value: nv };
                            }
                            return { ...prev, [f.name]: arr };
                          });
                        }}
                      >
                        <option value="">--</option>
                        <option value="true">{t('common.yes') || 'Da'}</option>
                        <option value="false">{t('common.no') || 'Nu'}</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={val}
                        disabled={!present}
                        placeholder={f.placeholderValue || t('resource.form.featureValue') || 'Value'}
                        className={inputClass + " flex-1"}
                        onChange={(e) => {
                          const nv = e.target.value;
                          setValues((prev) => {
                            const arr = Array.isArray(prev[f.name]) ? [...prev[f.name]] : [];
                            const idx = arr.findIndex((it) => it?.name === optName);
                            if (idx === -1) {
                              arr.push({ name: optName, value: nv });
                            } else {
                              arr[idx] = { ...arr[idx], value: nv };
                            }
                            return { ...prev, [f.name]: arr };
                          });
                        }}
                      />
                    )}
                    <Button
                      type="button"
                      variant="empty-red"
                      disabled={!present}
                      onClick={() => {
                        setValues((prev) => {
                          const arr = (Array.isArray(prev[f.name]) ? prev[f.name] : []).filter((it) => it?.name !== optName);
                          return { ...prev, [f.name]: arr };
                        });
                      }}
                    >
                      {t('common.remove') || 'Remove'}
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Any custom entries (non-predefined) — optional based on allowCustom */}
            {f.allowCustom !== false && Array.isArray(v) && v.filter(it => !(f.options || []).some(opt => opt.value === it.name)).map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
                <input
                  type="text"
                  value={item?.name ?? ''}
                  placeholder={f.placeholderName || t('resource.form.featureName') || 'Name'}
                  className={inputClass}
                  onChange={(e) => {
                    const val = e.target.value;
                    setValues((prev) => {
                      const arr = Array.isArray(prev[f.name]) ? [...prev[f.name]] : [];
                      const at = arr[idx] || { name: '', value: '' };
                      arr[idx] = { ...at, name: val };
                      return { ...prev, [f.name]: arr };
                    });
                  }}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item?.value ?? ''}
                    placeholder={f.placeholderValue || t('resource.form.featureValue') || 'Value'}
                    className={inputClass}
                    onChange={(e) => {
                      const val = e.target.value;
                      setValues((prev) => {
                        const arr = Array.isArray(prev[f.name]) ? [...prev[f.name]] : [];
                        const at = arr[idx] || { name: '', value: '' };
                        arr[idx] = { ...at, value: val };
                        return { ...prev, [f.name]: arr };
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="empty-gray"
                    onClick={() => {
                      setValues((prev) => {
                        const arr = (Array.isArray(prev[f.name]) ? prev[f.name] : []).filter((_, i) => i !== idx);
                        return { ...prev, [f.name]: arr };
                      });
                    }}
                  >
                    {t('common.remove') || 'Remove'}
                  </Button>
                </div>
              </div>
            ))}

            {f.showAddButton !== false && (
              <div>
                <Button
                  type="button"
                  variant="empty-blue"
                  onClick={() => {
                    setValues((prev) => {
                      const arr = Array.isArray(prev[f.name]) ? [...prev[f.name]] : [];
                      return { ...prev, [f.name]: [...arr, { name: '', value: '' }] };
                    });
                  }}
                >
                  {t('resource.form.addFeature') || 'Add feature'}
                </Button>
              </div>
            )}
          </div>
        ) : f.type === 'file' ? (
          <>
            <input
              id={f.name}
              name={f.name}
              type="file"
              multiple={!!f.multiple}
              onChange={(e) => handleChange(f.name, e.target.files, 'file')}
              className={inputClass}
            />
            {Array.isArray(values[f.name]) && values[f.name].length ? (
              <div className="mt-2">
                {/* if previews are available show image grid similar to dashboard */}
                {filePreviews[f.name] && filePreviews[f.name].length ? (
                  <div className="grid grid-cols-3 gap-2">
                    {filePreviews[f.name].map((p, idx) => (
                      p.isImage ? (
                        <div key={idx} className="border rounded overflow-hidden">
                          <div
                            role="img"
                            aria-label={`preview-${idx}`}
                            className="w-full h-24 bg-center bg-cover"
                            style={{ backgroundImage: `url(${p.url})` }}
                          />
                        </div>
                      ) : (
                        <div key={idx} className="text-xs text-gray-700 truncate p-1 border rounded">{p.name}</div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-700">
                    {values[f.name].map((file, i) => (
                      <div key={i} className="truncate">{file.name}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </>
        ) : f.type === "radio" ? (
          <div className="flex flex-col gap-2">
            {(f.options || []).map((opt) => (
              <label key={String(opt.value)} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={f.name}
                  value={opt.value}
                  checked={String(v) === String(opt.value)}
                  onChange={() => handleChange(f.name, opt.value)}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        ) : f.type === "checkbox" ? (
          <label className="inline-flex items-center gap-2">
            <input
              id={f.name}
              name={f.name}
              type="checkbox"
              checked={Boolean(v)}
              onChange={(e) => handleChange(f.name, e.target.checked)}
            />
            <span className="text-sm">{f.help || f.label}</span>
          </label>
        ) : (
          // default input types: text, number, email, password, date
          <input
            {...common}
            type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "password" ? "password" : f.type === "date" ? "date" : "text"}
          />
        )}

        {f.help && f.type !== "checkbox" ? <div className="text-xs text-gray-500 mt-1">{f.help}</div> : null}
        {err ? <div className="text-sm text-red-600 mt-1">{err}</div> : null}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={(() => {
      const classes = ['w-full'];
      if (scroll) {
        if (maxHeightClass) classes.push(maxHeightClass);
        if (overflowClass) classes.push(overflowClass);
      }
      if (className) classes.push(className);
      return classes.join(' ');
    })()}> 
      {header ? (
        <div className="mb-4">
          {typeof header === "string" ? <div className="text-sm text-gray-700">{header}</div> : header}
          <div className="h-px my-3 bg-gray-100" />
        </div>
      ) : null}

      {globalMessage ? <div className="mb-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-sm">{globalMessage}</div> : null}
      {globalError ? <div className="mb-3 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{globalError}</div> : null}

      <div className={(() => {
        // Build Tailwind-safe classnames for grid columns.
        // Avoid runtime template strings that Tailwind JIT can't detect.
        const safeCols = (n) => {
          // support 1..4 columns explicitly
          switch (Number(n)) {
            case 1:
              return 'grid-cols-1';
            case 2:
              return 'grid-cols-2';
            case 3:
              return 'grid-cols-3';
            case 4:
              return 'grid-cols-4';
            default:
              return 'grid-cols-1';
          }
        };

        const safeResponsive = (bp, n) => {
          // explicit breakpoint mappings we expect to use
          // include all variants so Tailwind picks them up
          switch (bp) {
            case 'sm':
              switch (Number(n)) {
                case 1: return 'sm:grid-cols-1';
                case 2: return 'sm:grid-cols-2';
                case 3: return 'sm:grid-cols-3';
                case 4: return 'sm:grid-cols-4';
                default: return 'sm:grid-cols-1';
              }
            case 'md':
              switch (Number(n)) {
                case 1: return 'md:grid-cols-1';
                case 2: return 'md:grid-cols-2';
                case 3: return 'md:grid-cols-3';
                case 4: return 'md:grid-cols-4';
                default: return 'md:grid-cols-1';
              }
            case 'lg':
              switch (Number(n)) {
                case 1: return 'lg:grid-cols-1';
                case 2: return 'lg:grid-cols-2';
                case 3: return 'lg:grid-cols-3';
                case 4: return 'lg:grid-cols-4';
                default: return 'lg:grid-cols-1';
              }
            case 'xl':
              switch (Number(n)) {
                case 1: return 'xl:grid-cols-1';
                case 2: return 'xl:grid-cols-2';
                case 3: return 'xl:grid-cols-3';
                case 4: return 'xl:grid-cols-4';
                default: return 'xl:grid-cols-1';
              }
            case '2xl':
              switch (Number(n)) {
                case 1: return '2xl:grid-cols-1';
                case 2: return '2xl:grid-cols-2';
                case 3: return '2xl:grid-cols-3';
                case 4: return '2xl:grid-cols-4';
                default: return '2xl:grid-cols-1';
              }
            default:
              return '';
          }
        };

        // cols can be a number or an object like { base:1, md:2 }
        let classes = ['grid'];
        if (typeof cols === 'number' || typeof cols === 'string') {
          classes.push(safeCols(cols));
          // keep md fallback to same value to preserve previous behavior
          classes.push(safeResponsive('md', cols));
        } else if (typeof cols === 'object' && cols !== null) {
          const base = cols.base ?? 1;
          classes.push(safeCols(base));
          Object.keys(cols).forEach((k) => {
            if (k === 'base') return;
            const v = cols[k];
            const r = safeResponsive(k, v);
            if (r) classes.push(r);
          });
        } else {
          // fallback
          classes.push('grid-cols-1', 'md:grid-cols-2');
        }
        classes.push('gap-4');
        return classes.filter(Boolean).join(' ');
      })()}>
        {fields.map(renderField)}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button
          type="submit"
          variant="empty-blue"
          className=""
          disabled={submitting}
        >
          {submitting ? "…" : (submitLabel || t('form.submit'))}
        </Button>
        {showReset ? (
          <Button
            type="button"
            variant="empty-gray"
            className=""
            onClick={() => {
              setValues(buildInitial());
              setErrors({});
              setGlobalError(null);
              setGlobalMessage(null);
            }}
          >
            {t('form.reset')}
          </Button>
        ) : null}

        {showClose ? (
          <Button
            type="button"
            variant="empty-gray"
            className=""
            onClick={() => {
              if (typeof onClose === 'function') onClose();
            }}
          >
            {t('form.close')}
          </Button>
        ) : null}
      </div>
    </form>
  );
}