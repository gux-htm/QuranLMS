import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpenText, CalendarDays, CheckCircle2, GraduationCap, Sparkles, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const highlights = [
  { icon: CalendarDays, title: 'A plan you can see', text: 'Turn long-term Quran goals into a clear weekly journey.' },
  { icon: GraduationCap, title: 'Teaching with clarity', text: 'Keep lessons, attendance, feedback, and progress in one calm workspace.' },
  { icon: Sparkles, title: 'Progress with purpose', text: 'Give every learner an honest picture of what comes next.' },
]

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen overflow-hidden bg-paper text-ink">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-800 text-paper shadow-card">
            <BookOpenText className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-xl font-semibold leading-none text-green-900">TILP</span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-ink/40">Quran learning</span>
          </span>
        </button>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Button variant="ghost" onClick={() => navigate('/login')}>Sign in</Button>
          <Button onClick={() => navigate('/signup')} className="hidden sm:inline-flex">Get started</Button>
        </div>
      </nav>

      <main>
        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-16">
          <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-green-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-gold-100/70 blur-3xl" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-green-800 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Built for meaningful Quran education
              </div>
              <div className="font-arabic text-3xl leading-relaxed text-green-700 sm:text-4xl">اِقْرَأْ وَرَبُّكَ الْأَكْرَمُ</div>
              <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                A clearer path from today's lesson to a finished Quran journey.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-ink/60 sm:text-lg">
                TILP brings teachers and students into the same learning rhythm—planned lessons, thoughtful feedback, and progress everyone can understand.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate('/signup')} className="group w-full sm:w-auto">
                  Start teaching with TILP
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/enroll')} className="w-full sm:w-auto">
                  I'm joining as a student
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/55">
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-700" /> Lessons and scheduling</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-700" /> Progress you can trust</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute -inset-5 rounded-[2rem] bg-green-100/70 blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-white p-5 shadow-[0_24px_70px_rgba(28,38,32,0.12)] sm:p-7">
                <div className="flex items-center justify-between border-b border-line pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/40">Your learning journey</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold">This week, at a glance</h2>
                  </div>
                  <div className="rounded-2xl bg-green-50 p-3 text-green-700"><BookOpenText className="h-6 w-6" /></div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-paper p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-ink/60"><CalendarDays className="h-4 w-4 text-green-700" /> Next lesson</div>
                    <div className="mt-4 font-display text-xl font-semibold">Tuesday · 6:00 PM</div>
                    <p className="mt-1 text-sm text-ink/50">Review and recitation practice</p>
                  </div>
                  <div className="rounded-2xl bg-green-800 p-5 text-paper">
                    <div className="text-sm font-medium text-paper/70">Journey progress</div>
                    <div className="mt-3 flex items-end gap-2"><span className="font-display text-4xl font-semibold">62%</span><span className="mb-1 text-sm text-paper/60">complete</span></div>
                    <div className="mt-4 h-2 rounded-full bg-white/15"><div className="h-2 w-[62%] rounded-full bg-gold-300" /></div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-line p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 text-gold-700"><UsersRound className="h-5 w-5" /></span>
                    <div className="flex-1"><div className="text-sm font-semibold">A shared learning rhythm</div><div className="mt-0.5 text-xs text-ink/50">Teachers guide. Students see the path forward.</div></div>
                    <span className="text-xs font-semibold text-green-700">On track</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-white/70">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-14 sm:grid-cols-3 sm:px-8">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-line bg-white p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/55">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <p className="font-arabic text-2xl text-green-700">وَقُل رَّبِّ زِدْنِي عِلْمًا</p>
          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Make the next lesson feel possible.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-ink/60">Whether you are guiding a class or beginning your own journey, TILP helps keep the focus on learning, consistency, and growth.</p>
          <Button size="lg" onClick={() => navigate('/signup')} className="mt-7">Begin with TILP <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </section>
      </main>

      <footer className="border-t border-line px-5 py-8 text-center text-sm text-ink/45">TILP makes Quranic learning collaborative, transparent, and achievable.</footer>
    </div>
  )
}
