"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api/api";
import CommentInput from "@/components/ui/general/comments/comment-input";
import CommentList from "@/components/ui/general/comments/comment-list";

function severityRank(s) {
  return s === "error" ? 3 : s === "warn" ? 2 : 1;
}

export default function ReviewDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState(null);
  const [sortKey, setSortKey] = React.useState("severity"); // severity | file | line
  const [sortDir, setSortDir] = React.useState("desc"); // asc | desc
  const [commentsByFinding, setCommentsByFinding] = React.useState({}); // { [findingId]: { loading, error, comments: [], status: 'open'|'resolved' } }
  const [newCommentText, setNewCommentText] = React.useState({}); // { [findingId]: string }

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
        if (status === 401 || status === 403) {
          const next = `/user/review/${id}`;
          router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
          throw e;
        }
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

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Review #{id}</h1>
        <Link className="text-blue-600 underline" href="/user/review">← Back to Reviews</Link>
      </div>

      {loading && <div className="mt-4">Loading…</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}

      {data && (
        <>
          <div className="mt-4 text-sm text-black">
            <div>Scope: <span className="font-mono">{data.scope || "n/a"}</span></div>
            <div className="mt-1">Counts: <span className="text-red-700">error {counts.error}</span> · <span className="text-yellow-700">warn {counts.warn}</span> · <span className="text-gray-700">info {counts.info}</span></div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-black">Sort by:</span>
            <select className="border rounded p-1" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <option value="severity">Severity</option>
              <option value="file">File</option>
              <option value="line">Line</option>
            </select>
            <select className="border rounded p-1" value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Findings</h2>
            {findings.length === 0 ? (
              <div className="mt-2 text-black">No findings.</div>
            ) : (
              <ul className="mt-3 space-y-3">
                {findings.map((f, idx) => {
                  const findingKey = f?.id ?? `f-${idx}-${f?.file || 'nofile'}-${f?.lineStart || 0}`;
                  return (
                  <li key={findingKey} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{f.title || "Issue"}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-gray-200">{f.severity || "info"}</span>
                        {(() => {
                          const state = commentsByFinding[f.id]?.status || 'open';
                          return (
                            <span className={`text-xs px-2 py-1 rounded ${state==='resolved' ? 'bg-green-200 text-green-900' : 'bg-yellow-100 text-yellow-900'}`}>
                              {state === 'resolved' ? 'resolved' : 'open'}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="text-sm text-black mt-1">{f.description}</div>
                    <div className="text-xs text-black mt-1">{f.file} {f.lineStart ? `(${f.lineStart}-${f.lineEnd || f.lineStart})` : ""}</div>
                    {f.recommendation && <pre className="mt-2 bg-gray-50 p-2 overflow-auto text-xs">{f.recommendation}</pre>}
                    {f.fixPatch && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">Suggested patch</summary>
                        <pre className="bg-gray-50 p-2 overflow-auto text-xs">{f.fixPatch}</pre>
                      </details>
                    )}
                    {typeof f.effortHours === "number" && <div className="mt-2 text-xs">Estimated effort: {f.effortHours}h</div>}

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
                      <div></div>
                      <summary className="cursor-pointer text-sm border border-gray-300">Comments</summary>
                      <div className="mt-2 space-y-2">
                        {commentsByFinding[f.id]?.loading && <div className="text-sm">Loading comments…</div>}
                        {commentsByFinding[f.id]?.error && <div className="text-sm text-red-600">{commentsByFinding[f.id]?.error}</div>}
                        <CommentInput
                          value={newCommentText[f.id] || ''}
                          disabled={false}
                          onSubmit={async () => {
                            const text = (newCommentText[f.id] || '').trim();
                            if (!text) return;
                            try {
                              const row = await fetchJson(`/review/finding/${f.id}/comments`, { method: 'POST', body: { text }, timeoutMs: 20000 });
                              setCommentsByFinding((prev) => {
                                const cur = prev[f.id] || { comments: [], status: 'open' };
                                return { ...prev, [f.id]: { ...cur, comments: [...(cur.comments||[]), row] } };
                              });
                              setNewCommentText((prev) => ({ ...prev, [f.id]: '' }));
                            } catch (e) {
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
                            message: c.text || (c.action === 'resolve' ? 'Marked as resolved' : c.action === 'reopen' ? 'Reopened' : ''),
                            author: c.author || null,
                          }))}
                          language="en"
                          // t is optional in component; omit to use defaults
                          currentUserId={undefined}
                          resourceOwnerId={undefined}
                        />
                        <div className="flex gap-2">
                          {(() => {
                            const status = commentsByFinding[f.id]?.status || 'open';
                            if (status === 'resolved') {
                              return (
                                <button
                                  className="text-sm px-3 py-1 rounded border"
                                  onClick={async () => {
                                    try {
                                      const d = await fetchJson(`/review/finding/${f.id}/reopen`, { method: 'POST', body: {}, timeoutMs: 15000 });
                                      setCommentsByFinding((prev) => ({ ...prev, [f.id]: { ...(prev[f.id]||{}), status: d.status || 'open' } }));
                                    } catch (e) { alert(`Failed to reopen: ${String(e?.message || e)}`); }
                                  }}
                                >Reopen</button>
                              );
                            }
                            return (
                              <button
                                className="text-sm px-3 py-1 rounded border"
                                onClick={async () => {
                                  try {
                                    const d = await fetchJson(`/review/finding/${f.id}/resolve`, { method: 'POST', body: {}, timeoutMs: 15000 });
                                    setCommentsByFinding((prev) => ({ ...prev, [f.id]: { ...(prev[f.id]||{}), status: d.status || 'open' } }));
                                  } catch (e) { alert(`Failed to resolve: ${String(e?.message || e)}`); }
                                }}
                              >Mark as resolved</button>
                            );
                          })()}
                        </div>
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
