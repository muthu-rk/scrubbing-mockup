// src/pages/Annotation.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import frameData from '../data/dummyFrameDataFragmentedAdvanced.json';
import matches from '../data/dummyMatches.json';

export default function Annotation() {
  const { id }      = useParams();
  const nav         = useNavigate();
  const match       = matches.find(m => m.id === +id) || {};
  const totalFrames = frameData.length;
  const fps         = 6;
  const canvasRef   = useRef();

  // Playback & selection state
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying]       = useState(false);
  const [speed, setSpeed]           = useState(1);
  const [selectedTrack, setSelTrack] = useState(null);

  // Search & filters
  const [searchTerm, setSearchTerm]     = useState('');
  const [classFilters, setClassFilters] = useState({
    'team A': true,
    'team B': true,
    referee: true,
  });

  // Compute stats per track (class, count, startFrame, startTime, lengthSec)
  const trackStats = useMemo(() => {
    const stats = {};
    frameData.forEach((frame, idx) => {
      frame.tracks.forEach(t => {
        if (!stats[t.track_id]) {
          stats[t.track_id] = {
            class: t.class,
            count: 0,
            startFrame: idx,
            startTime: frame.timestamp,
          };
        }
        stats[t.track_id].count++;
        if (idx < stats[t.track_id].startFrame) {
          stats[t.track_id].startFrame = idx;
          stats[t.track_id].startTime  = frame.timestamp;
        }
      });
    });
    Object.values(stats).forEach(s => {
      s.lengthSec = (s.count / fps).toFixed(1);
    });
    return stats;
  }, []);

  const allTrackIds = useMemo(
    () => Object.keys(trackStats).map(n => Number(n)),
    [trackStats]
  );

  const filteredTracks = useMemo(
    () => allTrackIds.filter(tid => {
      const cls = trackStats[tid].class;
      if (!classFilters[cls]) return false;
      if (searchTerm && !`${tid}`.includes(searchTerm)) return false;
      return true;
    }),
    [allTrackIds, trackStats, classFilters, searchTerm]
  );

  // Draw bounding boxes on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const frame = frameData[frameIndex];
    frame.tracks.forEach(t => {
      let color = t.class === 'team A'
        ? 'blue'
        : t.class === 'team B'
        ? 'red'
        : 'green';
      ctx.strokeStyle = t.track_id === selectedTrack ? 'yellow' : color;
      ctx.lineWidth   = 2;
      const [x1, y1, x2, y2] = t.bbox;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    });
  }, [frameIndex, selectedTrack]);

  // Auto-play
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
  }, [playing, speed]);

  // Handlers
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
    v = Math.max(0, Math.min(v, totalFrames - 1));
    setFrameIndex(v);
  };

  // Select track and seek to its first appearance
  const handleTrackSelect = tid => {
    const idx = frameData.findIndex(f =>
      f.tracks.some(t => t.track_id === tid)
    );
    if (idx !== -1) setFrameIndex(idx);
    setSelTrack(tid);
  };

  // Canvas click to pick track under cursor
  const handleCanvasClick = e => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const frame = frameData[frameIndex];
    const hit = frame.tracks.find(t => {
      const [x1, y1, x2, y2] = t.bbox;
      return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    });
    if (hit) handleTrackSelect(hit.track_id);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b">
        <button
          onClick={() => nav(-1)}
          className="text-blue-600 hover:underline"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold">
          Match #{match.id}: {match.title}
        </h2>
        <button className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">
          Submit
        </button>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane */}
        <aside className="w-64 p-4 bg-gray-50 overflow-auto border-r">
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
            Tracks ({filteredTracks.length})
          </h3>
          <ul className="space-y-1">
            {filteredTracks.map(tid => {
              const { class: cls, lengthSec, startFrame, startTime } =
                trackStats[tid];
              const borderColor =
                cls === 'team A'
                  ? 'border-blue-400 bg-blue-100'
                  : cls === 'team B'
                  ? 'border-red-400 bg-red-100'
                  : 'border-green-400 bg-green-100';
              return (
                <li
                  key={tid}
                  title={`Start: Frame ${startFrame + 1} (t=${startTime}s)`}
                  onClick={() => handleTrackSelect(tid)}
                  className={`flex justify-between items-center p-2 border-l-4 ${borderColor} rounded cursor-pointer hover:bg-gray-100 ${
                    selectedTrack === tid ? 'ring-2 ring-yellow-300' : ''
                  }`}
                >
                  <span>#{tid}</span>
                  <span className="text-sm text-gray-600">{lengthSec}s</span>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Center Pane */}
        <section className="flex-1 flex flex-col items-center p-4">
          <div className="relative bg-black">
            <canvas
              ref={canvasRef}
              width={560}
              height={280}
              className="block"
              onClick={handleCanvasClick}
            />
            <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
              Video Player Placeholder
            </div>
          </div>

          {/* Controls */}
          <div className="w-full mt-4 flex items-center justify-center space-x-4">
            <button
              onClick={goPrev}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ⏮
            </button>
            {playing ? (
              <button
                onClick={() => setPlaying(false)}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                ❚❚
              </button>
            ) : (
              <button
                onClick={() => setPlaying(true)}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                ►
              </button>
            )}
            <button
              onClick={() => {
                setPlaying(false);
                setFrameIndex(0);
              }}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ■
            </button>
            <button
              onClick={goNext}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
            >
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

          {/* Gantt Chart Placeholder */}
          <div className="mt-6 w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500 rounded">
            Gantt Chart Placeholder
          </div>
        </section>

        {/* Right Pane */}
        <aside className="w-64 p-4 bg-gray-50 overflow-auto border-l">
          <h3 className="font-semibold mb-2">Details</h3>
          {selectedTrack == null ? (
            <p className="text-gray-600">Select a track…</p>
          ) : (
            frameData[frameIndex].tracks
              .filter(t => t.track_id === selectedTrack)
              .map(t => (
                <div key={t.track_id} className="mb-3">
                  <p><strong>Track {t.track_id}</strong></p>
                  <p>Class: {t.class}</p>
                  <p>BBox: [{t.bbox.join(', ')}]</p>
                  <p>XY: ({t.xy.join(', ')})</p>
                </div>
              ))
          )}
        </aside>
      </div>
    </div>
  );
}
