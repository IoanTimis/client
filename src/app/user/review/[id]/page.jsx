"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api/api";

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

  async function fetchJson(path) {
    try {
      const res = await api.get(path, { timeout: 30000 });
      return res.data;
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        const next = `/user/review/${id}`;
        router.replace(`/auth/login?next=${encodeURIComponent(next)}`);
      }
      throw e;
    }
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
                {findings.map((f, idx) => (
                  <li key={f.id || idx} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{f.title || "Issue"}</div>
                      <span className="text-xs px-2 py-1 rounded bg-gray-200">{f.severity || "info"}</span>
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
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
