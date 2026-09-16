import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowRight, BookOpenText, CheckCircle2, ClipboardList, UserCheck } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const TIME_SLOTS = [
  'Weekdays after Fajr (6:00–7:00 AM)',
  'Weekdays after Asr (4:00–5:00 PM)',
  'Weekdays after Maghrib (6:30–7:30 PM)',
  'Weekend mornings (10:00–11:00 AM)',
  'Weekend evenings (5:00–6:00 PM)',
]

type Step = 'details' | 'invited' | 'complete'

const STEP_CONFIG: { key: Step; label: string; icon: typeof ClipboardList }[] = [
  { key: 'details', label: 'Account', icon: ClipboardList },
  { key: 'invited', label: 'Confirm', icon: UserCheck },
  { key: 'complete', label: 'Done', icon: CheckCircle2 },
]

const selectClass =
  'h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-700'

export function Enroll() {
  const navigate = useNavigate()
  const { submitEnrollRequest } = useAppStore()
  const [step, setStep] = useState<Step>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [teacherName] = useState('Ustaz Ahmed Rahman')
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[1])
  const [startTrack, setStartTrack] = useState<'qaida' | 'juz'>('qaida')
  const [startJuz, setStartJuz] = useState(1)
  const [experience, setExperience] = useState('')

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteCode) setStep('invited')
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitEnrollRequest({
      name,
      email,
      preferredTime,
      startTrack,
      startJuz: startTrack === 'juz' ? startJuz : null,
      experience: experience.trim(),
    })
    setStep('complete')
  }

  const stepIndex = STEP_CONFIG.findIndex((s) => s.key === step)

  return (
    <div className="flex min-h-screen">
      {/* ── Left brand panel ────────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-green-900 px-10 py-12 lg:flex lg:w-[42%]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full border border-white/10" />

        <button onClick={() => navigate('/')} className="relative flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-paper">
            <BookOpenText className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-xl font-semibold text-paper">TILP</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/50">
              Student enrollment
            </span>
          </span>
        </button>

        <div className="relative">
          <p className="font-arabic text-4xl leading-relaxed text-paper/90">
            طَلَبُ الْعِلْمِ فَرِيضَةٌ
          </p>
          <p className="mt-3 text-sm leading-6 text-paper/55">
            "Seeking knowledge is an obligation." — Hadith
          </p>
          <div className="mt-8 space-y-3 text-sm text-paper/60">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
              Track your daily recitation
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
              See your Quran completion journey
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300" />
              Receive reports from your teacher
            </div>
          </div>
        </div>

        <p className="relative text-xs text-paper/35">
          © {new Date().getFullYear()} TILP. Your journey starts here.
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-paper px-5 py-12 sm:px-10">
        {/* Mobile logo */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 lg:hidden"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-800 text-paper">
            <BookOpenText className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold text-green-900">TILP</span>
        </button>

        <div className="w-full max-w-sm">
          {/* ── Step indicator ── */}
          <div className="mb-8 flex items-center gap-2">
            {STEP_CONFIG.map((s, i) => {
              const done = i < stepIndex
              const active = i === stepIndex
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 ${
                      done
                        ? 'bg-green-600 text-paper'
                        : active
                        ? 'bg-green-800 text-paper ring-4 ring-green-800/20'
                        : 'bg-paper-dim text-ink/35'
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      active ? 'text-ink' : done ? 'text-green-700' : 'text-ink/35'
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < STEP_CONFIG.length - 1 && (
                    <div
                      className={`h-px w-6 transition-colors duration-300 ${
                        done ? 'bg-green-600' : 'bg-line'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* ── Step: Details ── */}
          {step === 'details' && (
            <>
              <h1 className="font-display text-2xl font-semibold text-ink">
                Create your student account
              </h1>
              <p className="mt-1 text-sm text-ink/55">
                You'll need an enrollment code from your teacher to get started.
              </p>

              <form onSubmit={handleSignup} className="mt-6 space-y-4">
                <Input
                  label="Full name"
                  placeholder="Ahmed Malik"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Choose a password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Input
                  label="Teacher's enrollment code"
                  placeholder="Paste the code your teacher sent"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <Button type="submit" className="group w-full" disabled={!inviteCode}>
                  Continue
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-ink/55">
                Already have an account?{' '}
                <button
                  className="font-medium text-green-700 hover:underline"
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* ── Step: Invited / Confirm ── */}
          {step === 'invited' && (
            <>
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-800">
                    Invited by {teacherName}
                  </div>
                  <div className="text-xs text-green-700/70">Tajweed specialist</div>
                </div>
              </div>

              <h1 className="font-display text-2xl font-semibold text-ink">
                Confirm your enrollment
              </h1>
              <p className="mt-1 text-sm text-ink/55">
                Tell your teacher when you're available and where you'd like to start.
              </p>

              <form onSubmit={handleInviteSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-ink">
                    Preferred class time
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className={selectClass}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-ink">
                    Where do you want to start?
                  </label>
                  <div className="space-y-2">
                    {(
                      [
                        {
                          value: 'qaida',
                          label: 'Noorani Qaida',
                          desc: "I'm a beginner and want to start from the basics",
                        },
                        {
                          value: 'juz',
                          label: 'A specific Juz',
                          desc: 'I can already read and want to start from a Juz',
                        },
                      ] as const
                    ).map(({ value, label, desc }) => (
                      <label
                        key={value}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors ${
                          startTrack === value
                            ? 'border-green-600 bg-green-50'
                            : 'border-line bg-white hover:bg-paper-dim'
                        }`}
                      >
                        <input
                          type="radio"
                          name="startTrack"
                          checked={startTrack === value}
                          onChange={() => setStartTrack(value)}
                          className="mt-0.5 accent-green-700"
                        />
                        <span className="flex-1">
                          <span className="font-medium text-ink">{label}</span>
                          <span className="mt-0.5 block text-xs text-ink/55">{desc}</span>
                          {value === 'juz' && startTrack === 'juz' && (
                            <select
                              value={startJuz}
                              onChange={(e) => setStartJuz(Number(e.target.value))}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-2 h-9 w-full rounded-xl border border-line bg-white px-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-green-700"
                            >
                              {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                                <option key={juz} value={juz}>
                                  Juz {juz}
                                </option>
                              ))}
                            </select>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-ink">
                    Anything your teacher should know?{' '}
                    <span className="text-ink/40">(optional)</span>
                  </label>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. I finished Qaida last year and revised Juz 1–2 at home"
                    rows={2}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                </div>

                <Button type="submit" className="group w-full">
                  Send enrollment request
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </form>
            </>
          )}

          {/* ── Step: Complete ── */}
          {step === 'complete' && (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
                Request sent!
              </h1>
              <p className="mt-2 text-sm leading-6 text-ink/55">
                Your enrollment request was sent to{' '}
                <span className="font-medium text-ink">{teacherName}</span>. They'll review your
                preferred time and starting point, then approve your enrollment.
              </p>

              <div className="mt-6 rounded-2xl border border-line bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                  What happens next
                </div>
                <div className="mt-3 space-y-2.5 text-sm text-ink/60">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">
                      1
                    </span>
                    Your teacher reviews your request
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">
                      2
                    </span>
                    You'll receive an approval email
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">
                      3
                    </span>
                    Your dashboard will be ready
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/student')}
                className="group mt-6 w-full"
              >
                Go to my dashboard
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
