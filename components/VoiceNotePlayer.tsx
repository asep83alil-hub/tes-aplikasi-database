import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Trash2, Download, Volume2, VolumeX, Mic } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VoiceNotePlayerProps {
  audioUrl: string;
  duration?: number;
  title?: string;
  dateLabel?: string;
  onDelete?: () => void;
  onReRecord?: () => void;
  compact?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  duration,
  title = "Voice Note Sesi Terapi",
  dateLabel,
  onDelete,
  onReRecord,
  compact = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (duration && duration > 0) {
      setTotalDuration(duration);
    }
  }, [duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.playbackRate = playbackRate;
      audio.play().catch(err => console.error("Playback error:", err));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const togglePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // Waveform bars simulation
  const waveformHeights = [
    30, 50, 75, 40, 60, 90, 100, 70, 85, 45, 
    65, 95, 80, 55, 70, 90, 100, 60, 40, 75, 
    85, 95, 65, 50, 80, 100, 70, 60, 45, 30
  ];

  return (
    <div className={cn(
      "w-full rounded-2xl border transition-all duration-200 select-none",
      compact 
        ? "p-2.5 bg-amber-50/70 border-amber-900/15" 
        : "p-4 bg-gradient-to-r from-amber-50/90 via-amber-100/50 to-orange-50/80 border-amber-900/20 shadow-sm"
    )}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* Play/Pause Main Button */}
        <button
          type="button"
          onClick={togglePlayPause}
          className={cn(
            "h-11 w-11 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 cursor-pointer",
            isPlaying 
              ? "bg-amber-900 text-amber-100 hover:bg-black ring-4 ring-amber-700/20" 
              : "bg-gradient-to-br from-amber-700 to-amber-900 text-white hover:brightness-110"
          )}
          title={isPlaying ? "Jeda Voice Note" : "Putar Voice Note"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Center: Title + Waveform + Scrubber */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="p-1 bg-amber-200/80 rounded-md text-amber-950">
                <Mic className="h-3 w-3" />
              </span>
              <span className="text-xs font-black text-slate-800 tracking-tight truncate">
                {title}
              </span>
              {dateLabel && (
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                  • {dateLabel}
                </span>
              )}
            </div>

            {/* Current / Total Time */}
            <div className="text-[11px] font-mono font-bold text-amber-950 shrink-0">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </div>
          </div>

          {/* Interactive Waveform / Slider Container */}
          <div className="relative flex items-center h-6 group">
            {/* Background waveform visualization */}
            <div className="absolute inset-0 flex items-center justify-between gap-[2px] opacity-40 px-1 pointer-events-none">
              {waveformHeights.map((h, i) => {
                const barPercent = (i / waveformHeights.length) * 100;
                const isPassed = barPercent <= progressPercent;
                return (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={cn(
                      "flex-1 rounded-full transition-all duration-150",
                      isPassed ? "bg-amber-800" : "bg-amber-400/80",
                      isPlaying && isPassed && "animate-pulse"
                    )}
                  />
                );
              })}
            </div>

            {/* Native Slider on top of waveform */}
            <input
              type="range"
              min="0"
              max={totalDuration || 1}
              step="0.05"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 appearance-none bg-transparent cursor-pointer z-10 accent-amber-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Speed Toggle */}
          <button
            type="button"
            onClick={togglePlaybackRate}
            className="px-2 py-1 bg-white/80 hover:bg-white text-slate-700 rounded-lg text-[10px] font-mono font-black border border-amber-900/10 shadow-xs transition-colors cursor-pointer"
            title="Kecepatan putar"
          >
            {playbackRate}x
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
            title={isMuted ? "Bunyikan" : "Bisukan"}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          {/* Download Audio */}
          <a
            href={audioUrl}
            download={`VoiceNote_${title.replace(/\s/g, '_')}.webm`}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
            title="Unduh rekaman suara"
          >
            <Download className="h-3.5 w-3.5" />
          </a>

          {/* Re-Record (if in edit mode) */}
          {onReRecord && (
            <button
              type="button"
              onClick={onReRecord}
              className="p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-200/60 rounded-lg transition-colors cursor-pointer"
              title="Rekam ulang voice note"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Delete Voice Note (if in edit mode) */}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Hapus voice note ini"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
