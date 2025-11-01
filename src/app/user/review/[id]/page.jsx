"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api/api";
import CommentInput from "@/components/ui/general/comments/comment-input";
import CommentList from "@/components/ui/general/comments/comment-list";
import { useLanguage } from "@/context/language-context";
import { useSelector } from "react-redux";

function severityRank(s) {
  return s === "error" ? 3 : s === "warn" ? 2 : 1;
}

export default function ReviewDetailPage() {
  const user = useSelector((state) => state.user.info);
  const router = useRouter();
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState(null);
  const [sortKey, setSortKey] = React.useState("severity"); // severity | file | line
  const [sortDir, setSortDir] = React.useState("desc"); // asc | desc
  const [commentsByFinding, setCommentsByFinding] = React.useState({}); // { [findingId]: { loading, error, comments: [], status: 'open'|'resolved' } }
  const [newCommentText, setNewCommentText] = React.useState({}); // { [findingId]: string }
  // Determine authentication status from Redux user state instead of cookies
  const isLogged = React.useMemo(() => {
    return !!(user && (user.id || user._id || user.email));
  }, [user]);

  async function fetchJson(path, { method = "GET", body, timeoutMs = 30000, retry = 0 } = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const config = { timeout: timeoutMs };
        let res;
        if (method === "GET") res = await api.get(path, config);
        else if (method === "POST") res = await api.post(path, body || {}, config);
        else if (method === "PUT") res = await api.put(path, body || {}, config);
        else if (method === "DELETE") res = await api.delete(path, config);
        else res = await api.request({ url: path, method, data: body, ...config });
        return res.data;
      } catch (e) {
        lastErr = e;
        const status = e?.response?.status;
        if (status === 401 || status === 403) throw e;
        const msg = String(e?.message || e);
        const isTimeout = /timeout/i.test(msg);
        if (isTimeout && attempt < retry) {
          await new Promise(r => setTimeout(r, 500));
          continue;
        }
        throw e;
      }
    }
    throw lastErr || new Error('Unknown request error');
  }

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetchJson(`/review/${id}`)
      .then((d) => {
        if (mounted) setData(d);
      })
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id, router]);

  const findings = React.useMemo(() => {
    if (!data?.findings) return [];
    const arr = [...data.findings];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "severity") cmp = severityRank(a.severity) - severityRank(b.severity);
      else if (sortKey === "file") cmp = (a.file || "").localeCompare(b.file || "");
      else if (sortKey === "line") cmp = (a.lineStart || 0) - (b.lineStart || 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [data, sortKey, sortDir]);

  const counts = React.useMemo(() => {
    const c = { error: 0, warn: 0, info: 0 };
    for (const f of data?.findings || []) {
      c[f.severity || "info"] = (c[f.severity || "info"] || 0) + 1;
    }
    return c;
  }, [data]);

  function severityLabel(s) {
    const sev = (s || 'info').toLowerCase();
    if (sev === 'error') return t('review.detail.severity.error');
    if (sev === 'warn') return t('review.detail.severity.warn');
    return t('review.detail.severity.info');
  }

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('review.detail.title')} {id}</h1>
        <Link className="text-blue-600 underline" href="/user/review">{t('review.detail.back')}</Link>
      </div>

      {loading && <div className="mt-4">{t('common.loading')}</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}

      {data && (
        <>
          <div className="mt-4 text-sm text-black">
            <div>{t('review.detail.scope')}: <span className="font-mono">{data.scope || "n/a"}</span></div>
            <div className="mt-1">{t('review.detail.counts')}: <span className="text-red-700">{t('review.detail.severity.error')} {counts.error}</span> · <span className="text-yellow-700">{t('review.detail.severity.warn')} {counts.warn}</span> · <span className="text-gray-700">{t('review.detail.severity.info')} {counts.info}</span></div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-black">{t('review.detail.sortBy')}</span>
            <select className="border rounded p-1" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <option value="severity">{t('review.detail.sort.severity')}</option>
              <option value="file">{t('review.detail.sort.file')}</option>
              <option value="line">{t('review.detail.sort.line')}</option>
            </select>
            <select className="border rounded p-1" value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
              <option value="desc">{t('review.detail.sort.desc')}</option>
              <option value="asc">{t('review.detail.sort.asc')}</option>
            </select>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">{t('review.detail.findings')}</h2>
            {findings.length === 0 ? (
              <div className="mt-2 text-black">{t('review.detail.noFindings')}</div>
            ) : (
              <ul className="mt-3 space-y-3">
                {findings.map((f, idx) => {
                  const findingKey = f?.id ?? `f-${idx}-${f?.file || 'nofile'}-${f?.lineStart || 0}`;
                  return (
                  <li key={findingKey} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{f.title || t('review.detail.issue')}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-gray-200">{severityLabel(f.severity)}</span>
                        {(() => {
                          const state = commentsByFinding[f.id]?.status || 'open';
                          return (
                            <span className={`text-xs px-2 py-1 rounded ${state==='resolved' ? 'bg-green-200 text-green-900' : 'bg-yellow-100 text-yellow-900'}`}>
                              {state === 'resolved' ? t('review.detail.status.resolved') : t('review.detail.status.open')}
                            </span>
                          );
                        })()}
                        {isLogged && f.id ? (() => {
                          const state = commentsByFinding[f.id]?.status || 'open';
                          const commonCls = "text-xs px-2 py-1 rounded border";
                          if (state === 'resolved') {
                            return (
                              <button
                                className={commonCls}
                                onClick={async () => {
                                  try {
                                    const d = await fetchJson(`/review/finding/${f.id}/reopen`, { method: 'POST', body: {}, timeoutMs: 15000 });
                                    setCommentsByFinding((prev) => ({ ...prev, [f.id]: { ...(prev[f.id]||{comments:[]}), status: d.status || 'open' } }));
                                  } catch (e) { alert(`Failed to reopen: ${String(e?.message || e)}`); }
                                }}
                              >{t('review.detail.action.reopen')}</button>
                            );
                          }
                          return (
                            <button
                              className={commonCls}
                              onClick={async () => {
                                try {
                                  const d = await fetchJson(`/review/finding/${f.id}/resolve`, { method: 'POST', body: {}, timeoutMs: 15000 });
                                  setCommentsByFinding((prev) => ({ ...prev, [f.id]: { ...(prev[f.id]||{comments:[]}), status: d.status || 'open' } }));
                                } catch (e) { alert(`Failed to resolve: ${String(e?.message || e)}`); }
                              }}
                            >{t('review.detail.action.resolve')}</button>
                          );
                        })() : null}
                      </div>
                    </div>
                    <div className="text-sm text-black mt-1">{f.description}</div>
                    <div className="text-xs text-black mt-1">{f.file} {f.lineStart ? `(${f.lineStart}-${f.lineEnd || f.lineStart})` : ""}</div>
                    {f.recommendation && <pre className="mt-2 bg-gray-50 p-2 overflow-auto text-xs">{f.recommendation}</pre>}
                    {f.fixPatch && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">{t('review.detail.suggestedPatch')}</summary>
                        <pre className="bg-gray-50 p-2 overflow-auto text-xs">{f.fixPatch}</pre>
                      </details>
                    )}
                    {typeof f.effortHours === "number" && <div className="mt-2 text-xs">{t('review.detail.estimatedEffort', { hours: f.effortHours })}</div>}

                    {/* Comments section */}
                    <details className="mt-3 group" onToggle={async (e) => {
                      if (e.currentTarget.open && f.id && !commentsByFinding[f.id]) {
                        setCommentsByFinding((prev) => ({ ...prev, [f.id]: { loading: true, error: '', comments: [], status: 'open' } }));
                        try {
                          const d = await fetchJson(`/review/finding/${f.id}/comments`);
                          setCommentsByFinding((prev) => ({ ...prev, [f.id]: { loading: false, error: '', comments: d.comments || [], status: d.status || 'open' } }));
                        } catch (err) {
                          setCommentsByFinding((prev) => ({ ...prev, [f.id]: { loading: false, error: String(err?.message || err), comments: [], status: 'open' } }));
                        }
                      }
                    }}>
                      <summary className="cursor-pointer text-sm border border-gray-300">{t('review.detail.comments')}</summary>
                      <div className="mt-2 space-y-2">
                        {commentsByFinding[f.id]?.loading && <div className="text-sm">{t('review.detail.loadingComments')}</div>}
                        {commentsByFinding[f.id]?.error && <div className="text-sm text-red-600">{commentsByFinding[f.id]?.error}</div>}
                        <CommentInput
                          value={newCommentText[f.id] || ''}
                          disabled={!isLogged}
                          onSubmit={async () => {
                            const text = (newCommentText[f.id] || '').trim();
                            if (!text) return;
                            if (!isLogged) {
                              const next = `/user/review/${id}`;
                              router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
                              return;
                            }
                            try {
                              const row = await fetchJson(`/review/finding/${f.id}/comments`, { method: 'POST', body: { text }, timeoutMs: 20000 });
                              setCommentsByFinding((prev) => {
                                const cur = prev[f.id] || { comments: [], status: 'open' };
                                return { ...prev, [f.id]: { ...cur, comments: [...(cur.comments||[]), row] } };
                              });
                              setNewCommentText((prev) => ({ ...prev, [f.id]: '' }));
                            } catch (e) {
                              const status = e?.response?.status;
                              if (status === 401 || status === 403) {
                                const next = `/user/review/${id}`;
                                router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
                                return;
                              }
                              alert(`Failed to add comment: ${String(e?.message || e)}`);
                            }
                          }}
                          setValue={(val) => setNewCommentText((prev) => ({ ...prev, [f.id]: val }))}
                        />
                        <CommentList
                          comments={(commentsByFinding[f.id]?.comments || []).map((c) => ({
                            id: c.id,
                            user_id: c.user_id,
                            createdAt: c.createdAt,
                            // Normalize to .message expected by CommentList
                            message: c.text || (c.action === 'resolve' ? t('review.detail.comment.resolved') : c.action === 'reopen' ? t('review.detail.comment.reopened') : ''),
                            author: c.author || null,
                          }))}
                          language={language}
                          t={t}
                          currentUserId={user?.id || user?._id || undefined}
                          resourceOwnerId={undefined}
                        />
                        {!isLogged && (
                          <div className="text-xs text-gray-600">{t('auth.loginToComment') || 'Please log in to comment.'}</div>
                        )}
                        
                      </div>
                    </details>
                  </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
