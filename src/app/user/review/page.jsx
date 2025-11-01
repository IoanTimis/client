"use client";

import React from "react";
import Link from "next/link";

export default function ReviewPage() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState("");
  const [guidelines, setGuidelines] = React.useState("");
  const [reviewId, setReviewId] = React.useState(null);
  const [saved, setSaved] = React.useState([]);

  async function fetchJson(path, { method = "GET", body } = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(`${API}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text?.slice(0,200)}`);
      }
      return await res.json();
    } finally {
      clearTimeout(id);
    }
  }

  const runStaged = async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchJson(`/review/staged`, { method: "POST", body: {} });
      setResult(data);
      if (data.reviewId) setReviewId(data.reviewId);
    } catch (e) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  };

  const runRepoSample = async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchJson(`/review/repo`, { method: "POST", body: {} });
      setResult(data);
      if (data.reviewId) setReviewId(data.reviewId);
    } catch (e) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  };

  const runCustomFiles = async (files) => {
    setLoading(true); setError("");
    try {
      const payloadFiles = await Promise.all(Array.from(files).map(async (f) => ({ path: f.name, content: await f.text() })));
      const data = await fetchJson(`/review/analyze`, { method: "POST", body: { files: payloadFiles, guidelines: guidelines || undefined } });
      setResult(data);
      if (data.reviewId) setReviewId(data.reviewId);
    } catch (e) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  };

  const loadLatestReviews = async () => {
    setError("");
    try {
      const data = await fetchJson(`/review/latest`);
      setSaved(data.reviews || []);
    } catch (e) {
      setError(String(e?.message || e));
    }
  };

  const loadReviewById = async (id) => {
    setLoading(true); setError("");
    try {
      const data = await fetchJson(`/user/review/${id}`);
      setResult({ findings: data.findings || [], meta: data.meta || {} });
      setReviewId(id);
    } catch (e) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto text-black">
      <h1 className="text-2xl font-bold">AI Code Review Assistant</h1>
      <p className="text-black mt-1">Rule-aware reviews with local LLM. Choose a source and run.</p>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="border rounded p-4">
          <h2 className="font-semibold">Incremental (staged)</h2>
          <p className="text-sm text-black">Reviews only staged JS/TS files (git add).</p>
          <button className="mt-3 bg-black text-white px-3 py-2 rounded" onClick={runStaged} disabled={loading}>
            {loading ? 'Running…' : 'Run staged review'}
          </button>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold">Project sample</h2>
          <p className="text-sm text-black">Scans a small sample of repository files.</p>
          <button className="mt-3 bg-black text-white px-3 py-2 rounded" onClick={runRepoSample} disabled={loading}>
            {loading ? 'Running…' : 'Run sample review'}
          </button>
        </div>
        <div className="border rounded p-4">
          <h2 className="font-semibold">Custom files</h2>
          <p className="text-sm text-black">Drop files to analyze without git.</p>
          <input aria-label="Upload files for AI review" type="file" multiple className="mt-3" onChange={(e) => runCustomFiles(e.target.files)} />
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold">Saved reviews</h2>
          <button className="mt-3 bg-gray-800 text-white px-3 py-2 rounded" onClick={loadLatestReviews} disabled={loading}>Load latest</button>
          <ul className="mt-3 space-y-2 max-h-64 overflow-auto text-sm">
            {saved.map((r) => (
              <li key={r.id} className="flex items-center justify-between">
                <div className="space-x-2">
                  <button className="underline" onClick={() => loadReviewById(r.id)}>#{r.id} · {r.scope || 'n/a'}</button>
                  <Link className="text-blue-600 underline" href={`/user/review/${r.id}`}>open</Link>
                </div>
                <span className="text-xs">{r.findings} findings</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 border rounded p-4">
          <h2 className="font-semibold">Guidelines (optional)</h2>
          <textarea
            className="mt-2 w-full border rounded p-2 h-32"
            placeholder="Paste custom rules here (otherwise defaults are used)."
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
          />
          {reviewId && (
            <div className="mt-3 text-sm">Saved as review <span className="font-mono">#{reviewId}</span></div>
          )}
        </div>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Findings</h2>
          {Array.isArray(result.findings) && result.findings.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {result.findings.map((f, idx) => (
                <li key={f.id || idx} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{f.title || 'Issue'}</div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-200">{f.severity || 'info'}</span>
                  </div>
                  <div className="text-sm text-black mt-1">{f.description}</div>
                  <div className="text-xs text-black mt-1">{f.file} {f.lineStart ? `(${f.lineStart}-${f.lineEnd || f.lineStart})` : ''}</div>
                  {f.recommendation && <pre className="mt-2 bg-gray-50 p-2 overflow-auto text-xs">{f.recommendation}</pre>}
                  {f.fixPatch && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">Suggested patch</summary>
                      <pre className="bg-gray-50 p-2 overflow-auto text-xs">{f.fixPatch}</pre>
                    </details>
                  )}
                  {typeof f.effortHours === 'number' && <div className="mt-2 text-xs">Estimated effort: {f.effortHours}h</div>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-2 text-black">No findings or model returned unstructured output.</div>
          )}
          {result?.meta?.raw && (
            <details className="mt-4">
              <summary className="cursor-pointer">Raw model output (truncated)</summary>
              <pre className="bg-gray-50 p-2 overflow-auto text-xs">{result.meta.raw}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
