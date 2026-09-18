import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Award, BarChart3, BookOpen,
  CalendarDays, CheckCircle2, Flame, GraduationCap,
  Sparkles, UsersRound,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LogoLink } from '@/components/ui/Logo'
import { useScrollY, useInView } from '@/lib/utils'

/* ── data ──────────────────────────────────────────────────────── */
const FLOAT_CARDS = [
  { id: 1, icon: CalendarDays, tone: 'bg-green-800',  label: 'Next lesson',    value: 'Tue · 6:00 PM',    sub: 'Juz 1 · Pages 4–6',       pos: 'top-[6%]  right-[0%]',   floatClass: 'float-a', delay: '0ms'   },
  { id: 2, icon: Flame,        tone: 'bg-clay-600',   label: 'Day streak',     value: '12',               sub: '640 pts earned',           pos: 'top-[40%] right-[7%]',   floatClass: 'float-b', delay: '150ms' },
  { id: 3, icon: BarChart3,    tone: 'bg-sky-600',    label: 'Your average',   value: '84%',              sub: 'Class avg 79%',            pos: 'bottom-[20%] right-[0%]',floatClass: 'float-c', delay: '300ms' },
  { id: 4, icon: Award,        tone: 'bg-gold-700',   label: 'Latest badge',   value: 'Juz 1',            sub: 'First para complete',      pos: 'bottom-[5%] right-[9%]', floatClass: 'float-d', delay: '450ms' },
] as const

const FEATURES = [
  { icon: CalendarDays, title: 'Daily lesson planning',  text: 'Turn long-term Quran goals into a clear daily rhythm. Targets are set, tracked, and adjusted automatically.', accent: 'bg-green-50 text-green-700' },
  { icon: GraduationCap, title: 'Teacher workspace',    text: 'Lessons, attendance, scoring, and student reports — all in one calm, focused workspace built for Quran teachers.', accent: 'bg-sky-100 text-sky-700' },
  { icon: Sparkles, title: 'Progress with purpose',     text: "Students see exactly where they are, what comes next, and how far they've come on their Quran journey.", accent: 'bg-gold-100 text-gold-700' },
]

const STEPS = [
  { step: '01', title: 'Teacher sets the pace',     desc: 'Create a class, assign daily targets, and invite students with a single link.' },
  { step: '02', title: 'Student follows the path',  desc: 'Each day has a clear lesson. Students complete, record, and the system tracks it all.' },
  { step: '03', title: 'Progress is visible to all',desc: 'Reports are sent automatically. Teachers and parents see real progress, not estimates.' },
]

/* ── component ─────────────────────────────────────────────────── */
export function Landing() {
  const navigate  = useNavigate()
  const scrollY   = useScrollY()

  const featRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<HTMLElement>(null)
  const ctaRef  = useRef<HTMLElement>(null)
  const featVisible  = useInView(featRef)
  const stepsVisible = useInView(stepsRef)
  const ctaVisible   = useInView(ctaRef)

  // stagger hero elements in on mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

  const blobY  = scrollY * 0.18   // subtle parallax on blobs
  const cardY  = scrollY * 0.07   // cards lift slower than page

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper text-ink">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrollY > 8
          ? 'border-b border-line/70 bg-paper/90 shadow-[0_1px_0_rgba(28,38,32,0.06)] backdrop-blur-xl'
          : 'bg-transparent'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <LogoLink />
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button>
            <Button onClick={() => navigate('/signup')} className="hidden sm:inline-flex">
              Get started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] overflow-hidden">

        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-24 h-[560px] w-[560px] rounded-full bg-green-100/55 blur-[90px]"
               style={{ transform: `translateY(${blobY}px)` }} />
          <div className="absolute -left-32 bottom-0 h-[480px] w-[480px] rounded-full bg-gold-100/65 blur-[90px]"
               style={{ transform: `translateY(${-blobY * 0.6}px)` }} />
          {/* Dot grid */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.025]">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#1C2620" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_480px]">

            {/* ── Left: copy ────────────────────────────────── */}
            <div>
              {/* Badge */}
              <div className={`mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-green-800 shadow-sm backdrop-blur-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                   style={{ transitionDelay: '0ms' }}>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                Built for meaningful Quran education
              </div>

              {/* Arabic */}
              <p className={`font-arabic text-3xl leading-relaxed text-green-700 transition-all duration-700 sm:text-4xl ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                 style={{ transitionDelay: '80ms' }}>
                اِقْرَأْ وَرَبُّكَ الْأَكْرَمُ
              </p>

              {/* Headline */}
              <h1 className={`mt-5 font-display text-5xl font-semibold leading-[1.04] tracking-tight text-ink transition-all duration-700 sm:text-6xl lg:text-[4.25rem] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ transitionDelay: '160ms' }}>
                A clearer path from today's lesson{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-green-700">to a finished</span>
                  <span className="absolute bottom-1 left-0 -z-0 h-[6px] w-full rounded-full bg-gold-300/70" />
                </span>{' '}
                Quran journey.
              </h1>

              {/* Sub */}
              <p className={`mt-6 max-w-xl text-base leading-7 text-ink/60 transition-all duration-700 sm:text-lg ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                 style={{ transitionDelay: '240ms' }}>
                TILP brings teachers and students into the same learning rhythm — planned lessons,
                thoughtful feedback, and progress everyone can understand.
              </p>

              {/* CTAs */}
              <div className={`mt-8 flex flex-col gap-3 transition-all duration-700 sm:flex-row ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                   style={{ transitionDelay: '320ms' }}>
                <Button size="lg" onClick={() => navigate('/signup')} className="group w-full sm:w-auto">
                  Start teaching with TILP
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/enroll')} className="w-full sm:w-auto">
                  I'm joining as a student
                </Button>
              </div>

              {/* Trust */}
              <div className={`mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/50 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                   style={{ transitionDelay: '400ms' }}>
                {['Lessons & scheduling', 'Progress you can trust', 'Free to start'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-700" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: floating cards ──────────────────────── */}
            <div
              className="relative hidden h-[560px] lg:block"
              style={{ transform: `translateY(${-cardY}px)`, transition: 'transform 0.08s linear' }}
            >
              {/* Central dashboard card */}
              <div className={`absolute left-0 top-[8%] w-[340px] overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[0_32px_80px_rgba(28,38,32,0.14)] float-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                   style={{ transitionDelay: '200ms' }}>
                {/* card header */}
                <div className="border-b border-line bg-green-900 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-paper">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-paper/50">Student workspace</p>
                      <p className="font-display text-sm font-semibold text-paper">Ahmed Malik</p>
                    </div>
                    <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-paper/70">Rank #2</span>
                  </div>
                </div>
                {/* card body */}
                <div className="space-y-3 p-5">
                  {/* progress */}
                  <div className="rounded-2xl bg-paper p-4">
                    <div className="flex items-center justify-between text-xs text-ink/50">
                      <span className="font-semibold uppercase tracking-wide">Quran journey</span>
                      <span className="font-semibold text-green-700">62%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-line">
                      <div className="h-2 rounded-full bg-green-600 transition-all duration-[1600ms] ease-out"
                           style={{ width: mounted ? '62%' : '0%', transitionDelay: '800ms' }} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-ink/40">Est. completion: Mar 2026</p>
                  </div>
                  {/* today target */}
                  <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50/60 p-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-green-800">Today's target</p>
                      <p className="text-xs text-ink/55">Juz 1 · Pages 4–6 · 1 page</p>
                    </div>
                    <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">On track</span>
                  </div>
                  {/* score + streak */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-paper p-3 text-center">
                      <div className="font-display text-xl font-semibold text-ink">84%</div>
                      <div className="text-[10px] text-ink/45">Your average</div>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl bg-clay-100/60 p-3">
                      <Flame className="h-4 w-4 shrink-0 text-clay-600" />
                      <div>
                        <div className="font-display text-xl font-semibold text-ink">12</div>
                        <div className="text-[10px] text-ink/45">Day streak</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stat chips */}
              {FLOAT_CARDS.map((card) => {
                const Icon = card.icon
                return (
                  <div
                    key={card.id}
                    className={`absolute flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-[0_8px_28px_rgba(28,38,32,0.09)] ${card.pos} ${card.floatClass} transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    style={{ transitionDelay: `${500 + parseInt(card.delay)}ms` }}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-paper ${card.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">{card.label}</div>
                      <div className="font-display text-base font-semibold text-ink">{card.value}</div>
                      <div className="text-[10px] text-ink/45">{card.sub}</div>
                    </div>
                  </div>
                )
              })}

              {/* Teacher chip */}
              <div className={`absolute bottom-[4%] left-0 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 shadow-[0_8px_28px_rgba(28,38,32,0.09)] float-b transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                   style={{ transitionDelay: '700ms' }}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 font-display text-sm font-semibold text-green-800">AR</div>
                <div>
                  <div className="text-xs font-semibold text-ink">Ustaz Ahmed Rahman</div>
                  <div className="text-[10px] text-ink/45">Tajweed Expert · 7 students</div>
                </div>
                <UsersRound className="ml-1 h-4 w-4 shrink-0 text-ink/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Pulse scroll hint */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-700 ${mounted ? 'opacity-30' : 'opacity-0'}`}
             style={{ transitionDelay: '900ms' }}>
          <div className="h-8 w-px animate-pulse bg-ink/50" />
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────── */}
      <section ref={stepsRef} className="border-y border-line bg-white/80">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: '30+', label: 'Juz tracked',         sub: 'Full Quran coverage' },
              { value: '84%', label: 'Avg session score',   sub: 'Across active students' },
              { value: '12×', label: 'Faster reporting',    sub: 'vs manual tracking' },
            ].map((s, i) => (
              <div key={s.label}
                   className={`transition-all duration-700 ${stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                   style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="font-display text-3xl font-semibold tracking-tight text-green-800 sm:text-4xl">{s.value}</div>
                <div className="mt-1 text-sm font-semibold text-ink">{s.label}</div>
                <div className="mt-0.5 text-xs text-ink/45">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section ref={featRef} className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className={`mb-12 text-center transition-all duration-700 ${featVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/35">What TILP gives you</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Everything a Quran teacher needs, in one place.
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={f.title}
                   className={`group rounded-2xl border border-line bg-white p-7 transition-all duration-700 hover:-translate-y-1.5 hover:border-green-200 hover:shadow-[0_12px_40px_rgba(28,38,32,0.10)] ${featVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                   style={{ transitionDelay: `${100 + i * 100}ms` }}>
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${f.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/55">{f.text}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="border-y border-line bg-green-900 text-paper">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="mb-14 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/40">Simple by design</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">A rhythm that works for everyone.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ step, title, desc }, i) => (
              <div key={step} className="flex gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 font-display text-sm font-semibold text-paper/70">
                  {step}
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-paper">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-paper/55">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section ref={ctaRef} className="relative mx-auto max-w-4xl overflow-hidden px-5 py-24 text-center sm:px-8 sm:py-32">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100/80 blur-3xl" />
        <div className={`relative transition-all duration-700 ${ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="font-arabic text-4xl leading-relaxed text-green-700">وَقُل رَّبِّ زِدْنِي عِلْمًا</p>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-ink/35">
            "My Lord, increase me in knowledge" — Surah Ta-Ha 20:114
          </p>
          <h2 className="mt-10 font-display text-3xl font-semibold text-ink sm:text-4xl">Make the next lesson feel possible.</h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-ink/60">
            Whether you guide a class or are beginning your own journey, TILP keeps the focus on learning, consistency, and growth.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={() => navigate('/signup')} className="group w-full sm:w-auto">
              Begin with TILP <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full sm:w-auto">
              Sign in
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-line bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-8 sm:flex-row sm:px-8">
          <LogoLink size="sm" />
          <p className="text-center text-sm text-ink/40">Making Quranic learning collaborative, transparent, and achievable.</p>
          <div className="flex items-center gap-4 text-sm text-ink/45">
            {([['Sign in', '/login'], ['Get started', '/signup'], ['Enroll', '/enroll']] as const).map(([label, path]) => (
              <button key={label} onClick={() => navigate(path)} className="transition-colors hover:text-green-700">{label}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
