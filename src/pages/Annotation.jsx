// src/pages/Annotation.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import initialData from '../data/dummyFrameDataFragmentedAdvanced.json';
import matches from '../data/dummyMatches.json';

export default function Annotation() {
  const { id } = useParams();
  const nav = useNavigate();
  const match = matches.find(m => m.id === +id) || {};
  const fps = 6;
  const nativeW = 560;
  const nativeH = 280;
  const canvasRef = useRef();
  const tracksListRef = useRef();
  const ganttRef = useRef();

  // ── Core state ─────────────────────────────────────────────────────────────
  const [data, setData] = useState(initialData);
  const totalFrames = data.length;
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedTrack, setSelTrack] = useState(null);
  const [checkedTracks, setChecked] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilters, setClassFilters] = useState({
    'team A': true,
    'team B': true,
    referee: true,
  });
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [scale, setScale] = useState(1);
  const [ganttZoom, setGanttZoom] = useState(1);

  // ID generators
  const nextIdRef = useRef(
    Math.max(...initialData.flatMap(f => f.tracks.map(t => +t.track_id))) + 1
  );
  const suffixCount = useRef({});

  // Activity log
  const [activity, setActivity] = useState([]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const trackStats = useMemo(() => {
    const stats = {};
    data.forEach((frame, idx) => {
      (frame.tracks || []).forEach(t => {
        const tid = String(t.track_id);
        if (!stats[tid]) {
          stats[tid] = {
            class: t.class,
            count: 0,
            startFrame: idx,
            startTime: frame.timestamp,
          };
        }
        stats[tid].count++;
        if (idx < stats[tid].startFrame) {
          stats[tid].startFrame = idx;
          stats[tid].startTime = frame.timestamp;
        }
      });
    });
    Object.values(stats).forEach(s => {
      s.lengthSec = s.count / fps;
    });
    return stats;
  }, [data]);

  const allIds = useMemo(() => Object.keys(trackStats), [trackStats]);
  const filtered = useMemo(
    () =>
      allIds.filter(tid => {
        const cls = trackStats[tid].class;
        return classFilters[cls] && (!searchTerm || tid.includes(searchTerm));
      }),
    [allIds, trackStats, classFilters, searchTerm]
  );

  const classCounts = useMemo(() => {
    const c = { 'team A': 0, 'team B': 0, referee: 0 };
    Object.values(trackStats).forEach(s => c[s.class]++);
    return c;
  }, [trackStats]);

  // ── Gantt data & dimensions ────────────────────────────────────────────────
  const durationTotal = data[data.length - 1]?.timestamp || totalFrames / fps;
  const timelineWidth = nativeW * scale * ganttZoom;
  const pxPerSec = timelineWidth / durationTotal;

  const ganttTracks = useMemo(
    () =>
      Object.entries(trackStats).map(([tid, s]) => ({
        id: tid,
        start: s.startTime,
        end: s.startTime + s.lengthSec,
        cls: s.class,
      })),
    [trackStats]
  );

  // ── Draw bounding boxes ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvas.width / nativeW;
    const scaleY = canvas.height / nativeH;
    const frame = data[frameIndex] || { tracks: [] };
    (frame.tracks || []).forEach(t => {
      const color =
        t.class === 'team A'
          ? 'blue'
          : t.class === 'team B'
          ? 'red'
          : 'green';
      ctx.strokeStyle =
        String(t.track_id) === selectedTrack ? 'yellow' : color;
      ctx.lineWidth = 2;
      const [x1, y1, x2, y2] = t.bbox;
      ctx.strokeRect(
        x1 * scaleX,
        y1 * scaleY,
        (x2 - x1) * scaleX,
        (y2 - y1) * scaleY
      );
    });
  }, [data, frameIndex, selectedTrack, scale]);

  // ── Auto-play ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setFrameIndex(i => {
        if (i + 1 >= totalFrames) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 1000 / speed);
    return () => clearInterval(iv);
  }, [playing, speed, totalFrames]);

  // ── Scroll left pane & gantt on track select ──────────────────────────────
  useEffect(() => {
    if (!selectedTrack) return;
    // Left pane
    const li = document.getElementById(`track-${selectedTrack}`);
    if (li && tracksListRef.current) {
      li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    // Gantt chart
    const bar = document.getElementById(`gantt-${selectedTrack}`);
    if (bar && ganttRef.current) {
      bar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedTrack]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleClass = cls =>
    setClassFilters(f => ({ ...f, [cls]: !f[cls] }));

  const goPrev = () => {
    setPlaying(false);
    setFrameIndex(i => Math.max(i - 1, 0));
  };
  const goNext = () => {
    setPlaying(false);
    setFrameIndex(i => Math.min(i + 1, totalFrames - 1));
  };
  const jumpTo = e => {
    let v = Number(e.target.value) - 1;
    if (isNaN(v)) return;
    const clamped = Math.min(Math.max(v, 0), data.length - 1);
    setFrameIndex(clamped);
  };

  const handleMerge = () => {
    if (checkedTracks.length < 2) return;
    const baseId = checkedTracks[0];
    const newId = String(nextIdRef.current++);
    setData(prev =>
      prev.map(frame => {
        const any = (frame.tracks || []).some(t =>
          checkedTracks.includes(String(t.track_id))
        );
        const filteredTracks = (frame.tracks || []).filter(
          t => !checkedTracks.includes(String(t.track_id))
        );
        if (any) {
          const repr = (frame.tracks || []).find(
            t => String(t.track_id) === baseId
          );
          filteredTracks.push({ ...repr, track_id: newId });
        }
        return { ...frame, tracks: filteredTracks };
      })
    );
    setChecked([]);
    setActivity(act => [
      ...act,
      `Merge [${checkedTracks.join(', ')}] → ${newId}`,
    ]);
  };

  const handleSplit = () => {
    if (!selectedTrack) return;
    const orig = selectedTrack;
    const cnt = suffixCount.current[orig] || 0;
    suffixCount.current[orig] = cnt + 1;
    const newA = `${orig}_a`;
    const newB = `${orig}_b`;
    setData(prev =>
      prev.map((frame, idx) => ({
        ...frame,
        tracks: (frame.tracks || []).flatMap(t => {
          if (String(t.track_id) !== orig) return [t];
          const copy = { ...t };
          copy.track_id = idx < frameIndex ? newA : newB;
          return [copy];
        }),
      }))
    );
    setSelTrack(null);
    setActivity(act => [
      ...act,
      `Split ${orig} → ${newA}, ${newB}`,
    ]);
  };

  const handleDelete = () => {
    if (!selectedTrack) return;
    if (!window.confirm(`Delete track ${selectedTrack}?`)) return;
    setData(prev =>
      prev.map(frame => ({
        ...frame,
        tracks: (frame.tracks || []).filter(
          t => String(t.track_id) !== selectedTrack
        ),
      }))
    );
    setActivity(act => [...act, `Delete ${selectedTrack}`]);
    setSelTrack(null);
  };

  const canvasClick = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / nativeW);
    const y = (e.clientY - rect.top) / (rect.height / nativeH);
    const frame = data[frameIndex] || { tracks: [] };
    const hits = (frame.tracks || []).filter(t => {
      const [x1, y1, x2, y2] = t.bbox;
      return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    });
    if (hits.length) setSelTrack(String(hits[0].track_id));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex justify-between p-4 bg-white border-b">
        <button onClick={() => nav(-1)} className="text-blue-600">
          ← Back
        </button>
        <h2 className="font-semibold">
          Match #{match.id}: {match.title}
        </h2>
        <button className="bg-green-500 text-white px-4 rounded">
          Submit
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane */}
        {leftCollapsed ? (
          <div className="w-8 bg-gray-100 flex items-center justify-center">
            <button onClick={() => setLeftCollapsed(false)}>▶</button>
          </div>
        ) : (
          <aside className="w-64 p-4 bg-gray-50 border-r overflow-y-auto flex flex-col relative">
            <button
              onClick={() => setLeftCollapsed(true)}
              className="absolute top-2 right-2"
            >
              ◀
            </button>

            {/* Actions */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={handleMerge}
                disabled={checkedTracks.length < 2}
                className="bg-blue-500 text-white px-2 rounded disabled:bg-gray-300"
              >
                Merge
              </button>
              <button
                onClick={handleSplit}
                disabled={!selectedTrack}
                className="bg-yellow-500 text-white px-2 rounded disabled:bg-gray-300"
              >
                Split
              </button>
              <button
                onClick={handleDelete}
                disabled={!selectedTrack}
                className="bg-red-500 text-white px-2 rounded disabled:bg-gray-300"
              >
                Delete
              </button>
            </div>

            {/* Search & Filters */}
            <input
              type="text"
              placeholder="Search ID…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full mb-3 p-2 border rounded"
            />
            {['team A', 'team B', 'referee'].map(cls => (
              <label key={cls} className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  checked={classFilters[cls]}
                  onChange={() => toggleClass(cls)}
                />
                <span
                  className={
                    cls === 'team A'
                      ? 'text-blue-600'
                      : cls === 'team B'
                      ? 'text-red-600'
                      : 'text-green-600'
                  }
                >
                  {cls}
                </span>
              </label>
            ))}

            <h3 className="font-semibold mt-4 mb-2">
              Tracks ({filtered.length})
            </h3>
            <ul
              ref={tracksListRef}
              className="flex-1 overflow-auto space-y-1"
            >
              {filtered.map(tid => {
                const s = trackStats[tid];
                const border =
                  s.class === 'team A'
                    ? 'border-blue-400 bg-blue-100'
                    : s.class === 'team B'
                    ? 'border-red-400 bg-red-100'
                    : 'border-green-400 bg-green-100';
                const isSel = tid === selectedTrack;
                return (
                  <li
                    id={`track-${tid}`}
                    key={tid}
                    className={`
                      flex items-center justify-between p-2 border ${border} rounded cursor-pointer
                      ${isSel ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}
                    `}
                    onClick={() => setSelTrack(tid)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={checkedTracks.includes(tid)}
                        onChange={() => {
                          setChecked(ch =>
                            ch.includes(tid)
                              ? ch.filter(x => x !== tid)
                              : [...ch, tid]
                          );
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                      <span>#{tid}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {s.lengthSec.toFixed(1)}s
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}

        {/* Video & Canvas */}
        <section className="flex-1 flex flex-col items-center p-4 relative">
          <div
            className="relative bg-black"
            style={{
              width: nativeW * scale,
              height: nativeH * scale,
            }}
          >
            <canvas
              ref={canvasRef}
              width={nativeW * scale}
              height={nativeH * scale}
              onClick={canvasClick}
            />
          </div>

          {/* Canvas Zoom */}
          <div className="flex items-center mt-2 space-x-2">
            <label>Canvas Zoom</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              onChange={e => setScale(+e.target.value)}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2 mt-4">
            <button onClick={goPrev} className="p-2 bg-gray-200 rounded">
              ⏮
            </button>
            {playing ? (
              <button
                onClick={() => setPlaying(false)}
                className="p-2 bg-gray-200 rounded"
              >
                ❚❚
              </button>
            ) : (
              <button
                onClick={() => setPlaying(true)}
                className="p-2 bg-gray-200 rounded"
              >
                ►
              </button>
            )}
            <button
              onClick={() => {
                setPlaying(false);
                setFrameIndex(0);
              }}
              className="p-2 bg-gray-200 rounded"
            >
              ■
            </button>
            <button onClick={goNext} className="p-2 bg-gray-200 rounded">
              ⏭
            </button>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max={totalFrames}
                value={frameIndex + 1}
                onChange={jumpTo}
                className="w-16 p-1 text-center border rounded"
              />
              <span>/ {totalFrames}</span>
            </div>
            <select
              value={speed}
              onChange={e => setSpeed(+e.target.value)}
              className="p-1 border rounded"
            >
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={1.5}>1.5×</option>
              <option value={2}>2×</option>
            </select>
          </div>

          {/* Time Slider */}
          <div className="w-full mt-2">
            <label className="block mb-1">Time Viewer</label>
            <input
              type="range"
              min="1"
              max={totalFrames}
              value={frameIndex + 1}
              onChange={jumpTo}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-700">
              {((data[frameIndex] || { timestamp: 0 }).timestamp).toFixed(2)} s
            </div>
          </div>

          {/* ── MVP Gantt Chart ────────────────────────────────────────────────── */}
          <div className="mt-6 w-full flex flex-col space-y-2">
            {/* Timeline Zoom Slider */}
            <div className="flex items-center px-2">
              <label className="text-xs mr-2">Timeline Zoom</label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={ganttZoom}
                onChange={e => setGanttZoom(+e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Chart */}
            <div
              ref={ganttRef}
              className="relative h-40 overflow-auto border rounded"
            >
              {/* X-Axis */}
              <div className="absolute top-2 left-16 right-0 h-4">
                {[0, 0.25, 0.5, 0.75, 1].map(frac => {
                  const sec = durationTotal * frac;
                  const left = sec * pxPerSec;
                  return (
                    <div
                      key={frac}
                      className="absolute text-xs text-gray-600"
                      style={{ left }}
                    >
                      {Math.round(sec)}s
                    </div>
                  );
                })}
              </div>

              {/* Y-Axis labels */}
              {ganttTracks.map((t, i) => (
                <div
                  key={t.id}
                  className="absolute left-0 text-xs text-gray-700"
                  style={{ top: 20 + i * 24 }}
                >
                  #{t.id}
                </div>
              ))}

              {/* Bars */}
              <div
                className="absolute top-2 left-16"
                style={{ width: timelineWidth, height: ganttTracks.length * 24 }}
              >
                {ganttTracks.map((t, i) => {
                  const top = i * 24;
                  const left = t.start * pxPerSec;
                  const width = (t.end - t.start) * pxPerSec;
                  const isSel = t.id === selectedTrack;
                  const bgColor =
                    t.cls === 'team A'
                      ? 'rgba(59,130,246,0.5)'
                      : t.cls === 'team B'
                      ? 'rgba(239,68,68,0.5)'
                      : 'rgba(34,197,94,0.5)';
                  const borderColor =
                    t.cls === 'team A'
                      ? '#3b82f6'
                      : t.cls === 'team B'
                      ? '#ef4444'
                      : '#22c55e';
                  return (
                    <div
                      id={`gantt-${t.id}`}
                      key={t.id}
                      onClick={() => setSelTrack(t.id)}
                      title={`Track ${t.id}: ${t.start.toFixed(
                        1
                      )}–${t.end.toFixed(1)}s`}
                      style={{
                        position: 'absolute',
                        top,
                        left,
                        width,
                        height: 20,
                        backgroundColor: bgColor,
                        border: isSel
                          ? '2px solid yellow'
                          : `1px solid ${borderColor}`,
                        opacity: isSel ? 1 : 0.7,
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Right Pane: Details & Activity */}
        <aside className="w-64 p-4 bg-gray-50 border-l flex flex-col">
          {/* Details */}
          <div className="flex-1 overflow-auto">
            <h3 className="font-semibold mb-2">Details</h3>
            {(!data[frameIndex]?.tracks || !selectedTrack) ? (
              <p className="text-gray-600">Select a track…</p>
            ) : (
              (data[frameIndex].tracks || [])
                .filter(t => String(t.track_id) === selectedTrack)
                .map(t => (
                  <div key={t.track_id} className="mb-4">
                    <p><strong>Track {t.track_id}</strong></p>
                    <p>Class: {t.class}</p>
                    <p>
                      Timestamp:{' '}
                      {((data[frameIndex] || { timestamp: 0 }).timestamp).toFixed(2)} s
                    </p>
                    <p>BBox: [{t.bbox.join(', ')}]</p>
                  </div>
                ))
            )}
          </div>

          {/* Activity */}
          <div className="h-48 overflow-auto border-t pt-2 mt-2">
            <h3 className="font-semibold mb-2">Activity</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {activity.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      {/* Footer counts */}
      <footer className="p-2 bg-white border-t text-center">
        Team A: {classCounts['team A']} | Team B: {classCounts['team B']} | Referee:{' '}
        {classCounts.referee}
      </footer>
    </div>
  );
}
