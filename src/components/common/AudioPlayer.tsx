import { useEffect, useRef, useState } from 'react'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { AudioSegment } from '@/lib/curriculumData'

const SPEEDS = [0.75, 1, 1.25, 1.5]

interface AudioPlayerProps {
  segments: AudioSegment[]
  emptyHint?: string
}

// Lightweight Quran audio player: plays segments (ayahs) in sequence with
// play/pause, prev/next and speed controls. Degrades gracefully when offline.
export function AudioPlayer({ segments, emptyHint }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState(false)

  const current = segments[index] ?? null

  // Reset when the segment list changes (e.g. qari switch)
  useEffect(() => {
    setIndex(0)
    setPlaying(false)
    setProgress(0)
    setFailed(false)
  }, [segments])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.playbackRate = speed
  }, [speed, index, current?.url])

  if (segments.length === 0) {
    return (
      <p className="rounded-md border border-line bg-paper-dim/50 p-3 text-xs text-ink/55">
        {emptyHint ?? 'No pre-recorded audio for this unit — the teacher recites live.'}
      </p>
    )
  }

  const toggle = () => {
    const audio = audioRef.current
    if (!audio || !current) return
    setFailed(false)
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().catch(() => setFailed(true))
      setPlaying(true)
    }
  }

  const jump = (delta: number) => {
    setIndex((i) => Math.min(segments.length - 1, Math.max(0, i + delta)))
    setProgress(0)
  }

  return (
    <div className="space-y-2">
      <audio
        ref={audioRef}
        src={current?.url}
        onEnded={() => {
          if (index < segments.length - 1) {
            setIndex(index + 1)
            setProgress(0)
            // Auto-advance keeps playing
            window.setTimeout(() => audioRef.current?.play().catch(() => setPlaying(false)), 60)
          } else {
            setPlaying(false)
          }
        }}
        onTimeUpdate={(e) => {
          const a = e.currentTarget
          setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0)
        }}
        onError={() => {
          setPlaying(false)
          setFailed(true)
        }}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-paper-dim/40 px-3 py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => jump(-1)}
            disabled={index === 0}
            className="rounded-md p-1.5 text-ink/60 hover:bg-paper-dim disabled:opacity-30"
            aria-label="Previous ayah"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={toggle}
            className="rounded-full bg-green-600 p-2 text-paper hover:bg-green-700"
            aria-label={playing ? 'Pause audio' : 'Play audio'}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => jump(1)}
            disabled={index >= segments.length - 1}
            className="rounded-md p-1.5 text-ink/60 hover:bg-paper-dim disabled:opacity-30"
            aria-label="Next ayah"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between text-[11px] text-ink/50">
            <span>
              Ayah {current?.label} • {index + 1}/{segments.length}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${
                speed === s ? 'bg-green-600 text-paper' : 'text-ink/55 hover:bg-paper-dim'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {failed && (
        <p className="rounded-md bg-clay-100/60 px-3 py-2 text-xs text-clay-700">
          Audio could not be loaded (offline or reciter unavailable). Try another Qari.
        </p>
      )}
    </div>
  )
}
