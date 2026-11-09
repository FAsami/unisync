import Image from 'next/image'
import Link from 'next/link'
import { Button } from 'antd'
import {
  Apple,
  Smartphone,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Lock,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  ArrowLeftRight,
  Users,
  UserPlus,
} from 'lucide-react'
import { Reveal } from './reveal'

const NAV_LINKS = [
  { href: '#tour', label: 'See it in action' },
  { href: '#roles', label: "Who it's for" },
  { href: '#features', label: 'Features' },
]

const FEATURES = [
  {
    icon: Calendar,
    title: 'My day',
    description:
      "Students and teachers open the app to today's classes, with what's happening now and what's next, not a static printed routine.",
  },
  {
    icon: ArrowLeftRight,
    title: 'Instant change alerts',
    description:
      'Cancel a class, move it, or swap the room, and the whole section is notified immediately, with the reason attached.',
  },
  {
    icon: Bell,
    title: 'One inbox',
    description:
      'Announcements from teachers and the department land in a single notification inbox, not scattered across group chats.',
  },
  {
    icon: Users,
    title: 'Department setup',
    description:
      'Batches, sections, courses, teachers and the weekly routine, all managed from this dashboard, with clashes caught before they happen.',
  },
  {
    icon: UserPlus,
    title: 'Roster-based access',
    description:
      "Only numbers on a department's roster can sign in. Anyone else can ask to join, and an admin approves it in one click.",
  },
  {
    icon: Lock,
    title: 'No passwords',
    description:
      'Sign in with a text code sent to your phone. Nothing to remember, nothing to reset.',
  },
]

const ROLES = [
  {
    icon: GraduationCap,
    title: 'Students',
    description:
      "See your section's schedule, get notified the moment a class changes, and ask your department for access if you're new.",
  },
  {
    icon: BookOpen,
    title: 'Teachers',
    description:
      'Cancel or move your own classes in a tap, and send a notice to everyone in the section at once.',
  },
  {
    icon: ShieldCheck,
    title: 'Department admins',
    description:
      'Set up batches, courses and the weekly routine here on the web, then hand the day-to-day over to the app.',
  },
]

const MOBILE_SHOTS = [
  {
    src: '/screenshots/mobile-my-day.png',
    alt: "A student's My day screen, showing the current class, a cancelled class and a room change",
    caption: 'My day',
    detail: 'Now, next, and anything that changed, first thing.',
  },
  {
    src: '/screenshots/mobile-class-sheet.png',
    alt: 'The class actions sheet, with options to cancel, move or change the room of a class',
    caption: 'Change a class',
    detail: 'Cancel, move or swap the room in a tap.',
  },
  {
    src: '/screenshots/mobile-schedule.png',
    alt: 'The weekly schedule screen with a day picker across the top',
    caption: 'Schedule',
    detail: 'The whole week, one day at a time.',
  },
  {
    src: '/screenshots/mobile-inbox.png',
    alt: 'The notifications inbox with several unread announcements',
    caption: 'Inbox',
    detail: 'Every notice, from every class, in one place.',
  },
  {
    src: '/screenshots/mobile-send.png',
    alt: 'The Send screen for composing a notice to a section, batch or department',
    caption: 'Send',
    detail: 'Reach a section, a batch or the department.',
  },
]

const DASHBOARD_SHOTS = [
  {
    src: '/screenshots/dashboard-overview.png',
    alt: "A department's overview page, with setup progress and a pending access request",
    caption: 'Overview',
    detail: 'Everything set up, and what still needs you.',
  },
  {
    src: '/screenshots/dashboard-students.png',
    alt: 'The students roster, with a CR toggle and per-student edit and deactivate actions',
    caption: 'Students',
    detail: 'The roster, CR marks and all, in one table.',
  },
  {
    src: '/screenshots/dashboard-routine.png',
    alt: "A section's weekly routine laid out by day of week",
    caption: 'Weekly routine',
    detail: 'Built clash-free, by section and by day.',
  },
  {
    src: '/screenshots/dashboard-access-requests.png',
    alt: 'A pending access request with approve and reject actions',
    caption: 'Access requests',
    detail: 'Review and approve in one click.',
  },
]

/** A phone bezel around a real screenshot. Decorative chrome; the image carries the real alt text. */
const PhoneFrame = ({
  src,
  alt,
  priority,
}: {
  src: string
  alt: string
  priority?: boolean
}) => (
  <div className='relative mx-auto w-full max-w-[220px] shrink-0'>
    <div
      aria-hidden='true'
      className='absolute inset-4 -z-10 rounded-full bg-[var(--color-brand)]/15 blur-2xl'
    />
    <div className='relative rounded-[2.1rem] bg-black p-2 shadow-xl shadow-black/50 ring-1 ring-white/15'>
      <div
        aria-hidden='true'
        className='absolute top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black'
      />
      <div className='relative aspect-[1170/1992] overflow-hidden rounded-[1.6rem] bg-[var(--color-surface)]'>
        <Image
          src={src}
          alt={alt}
          fill
          sizes='220px'
          className='object-cover object-top'
          priority={priority}
        />
      </div>
    </div>
  </div>
)

/** A browser-window chrome around a real dashboard screenshot. */
const BrowserFrame = ({
  src,
  alt,
  priority,
}: {
  src: string
  alt: string
  priority?: boolean
}) => (
  <div className='overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] shadow-lg shadow-black/20'>
    <div
      aria-hidden='true'
      className='flex items-center gap-1.5 border-b border-[var(--color-line)] bg-[var(--color-surface-sunken)] px-3 py-2.5'
    >
      <span className='h-2.5 w-2.5 rounded-full bg-[var(--color-line-strong)]' />
      <span className='h-2.5 w-2.5 rounded-full bg-[var(--color-line-strong)]' />
      <span className='h-2.5 w-2.5 rounded-full bg-[var(--color-line-strong)]' />
    </div>
    <div className='relative aspect-[2880/1800]'>
      <Image
        src={src}
        alt={alt}
        fill
        sizes='(min-width: 1024px) 560px, 100vw'
        className='object-cover object-top'
        priority={priority}
      />
    </div>
  </div>
)

/**
 * An app-store-style badge. Not a link: the apps aren't published yet, so
 * there's nowhere real to send a tap, and a dead link would be worse than
 * none (see AUDIT.md). The "Coming soon" tag next to it says why.
 */
const StoreBadge = ({
  icon,
  line1,
  line2,
}: {
  icon: React.ReactNode
  line1: string
  line2: string
}) => (
  <span className='inline-flex items-center gap-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-line)] px-3 py-1.5 text-[var(--color-ink)] opacity-90 transition-opacity hover:opacity-100'>
    <span className='text-xl'>{icon}</span>
    <span className='leading-tight'>
      <span className='block text-[0.6rem] tracking-wide text-[var(--color-ink-muted)] uppercase'>
        {line1}
      </span>
      <span className='block text-sm font-bold'>{line2}</span>
    </span>
  </span>
)

/** A large, pale ordinal sitting behind a section's eyebrow label. Purely decorative. */
const SectionNumber = ({ n, label }: { n: string; label: string }) => (
  <div className='flex items-center gap-4'>
    <span
      aria-hidden='true'
      className='text-6xl leading-none font-extrabold text-[var(--color-ink-faint)] select-none sm:text-7xl'
    >
      {n}
    </span>
    <span className='text-sm font-semibold tracking-wide text-[var(--color-brand)] uppercase'>
      {label}
    </span>
  </div>
)

const Home = () => {
  return (
    <div className='bg-[var(--color-surface)] text-[var(--color-ink)] antialiased'>
      {/* Scroll-reveal degrades to fully visible without JS. */}
      <noscript>
        <style>
          {'.reveal-target{opacity:1!important;transform:none!important}'}
        </style>
      </noscript>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Header */}
      <header className='sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-surface)]/90 backdrop-blur-sm'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
          <div className='flex items-center gap-2'>
            <Image
              src='/logo-transparent.png'
              alt='UniSync'
              width={28}
              height={28}
            />
            <span className='text-lg font-bold tracking-tight'>UniSync</span>
          </div>
          <nav className='hidden items-center gap-8 text-sm text-[var(--color-ink-muted)] md:flex'>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className='!text-[var(--color-ink-muted)] transition-colors hover:!text-[var(--color-ink)]'
              >
                {link.label}
              </a>
            ))}
          </nav>
          <Link href='/auth/login'>
            <Button
              type='primary'
              className='!border-none !bg-[var(--color-brand)]'
            >
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className='relative overflow-hidden'>
          <div
            aria-hidden='true'
            className='absolute inset-0 -z-20 bg-[radial-gradient(circle,rgba(24,24,27,0.08)_1px,transparent_1px)] bg-[length:28px_28px] opacity-60 [mask-image:radial-gradient(ellipse_60%_55%_at_30%_20%,black,transparent)]'
          />
          <div
            aria-hidden='true'
            className='absolute -top-40 -right-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-[var(--color-brand)]/10 blur-3xl'
          />
          <div className='mx-auto grid max-w-6xl items-center gap-16 px-6 pt-16 pb-24 md:grid-cols-[1.05fr_0.95fr] md:pt-24 md:pb-32'>
            <div>
              <Reveal>
                <span className='inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-brand)]'>
                  Built for one university at a time
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h1 className='mt-6 text-4xl leading-[1.05] font-extrabold tracking-tight text-[var(--color-ink)] sm:text-5xl lg:text-[3.4rem]'>
                  Everyone&apos;s schedule,{' '}
                  <span className='text-[var(--color-brand)]'>
                    always current.
                  </span>
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className='mt-5 max-w-md text-lg text-[var(--color-ink-muted)]'>
                  UniSync keeps students, teachers and department admins in
                  sync: real-time class schedules, instant alerts when a class
                  is cancelled, moved or changes room, and one inbox for
                  everything else.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className='mt-8 flex flex-wrap items-center gap-4'>
                  <Link href='/auth/login'>
                    <Button
                      type='primary'
                      size='large'
                      icon={<ArrowRight size={16} />}
                      iconPosition='end'
                      className='!border-none !bg-[var(--color-brand)]'
                    >
                      Sign in to set up your department
                    </Button>
                  </Link>
                </div>
                <div className='mt-5 flex flex-wrap items-center gap-3'>
                  <StoreBadge
                    icon={<Apple size={20} />}
                    line1='Download on the'
                    line2='App Store'
                  />
                  <StoreBadge
                    icon={<Smartphone size={20} />}
                    line1='GET IT ON'
                    line2='Google Play'
                  />
                  <span className='text-xs font-medium text-[var(--color-ink-faint)]'>
                    Coming soon
                  </span>
                </div>
              </Reveal>
            </div>

            {/* Two real screens from the app, not mockups. */}
            <Reveal
              delay={200}
              className='relative mx-auto h-[340px] w-full max-w-sm sm:h-[400px]'
            >
              <div
                className='absolute top-6 right-2 w-[190px] rotate-6 motion-reduce:[animation:none!important] sm:w-[210px] [animation:float_7s_ease-in-out_infinite]'
                style={{ animationDelay: '0.4s' }}
              >
                <PhoneFrame
                  src='/screenshots/mobile-inbox.png'
                  alt='The notifications inbox with several unread announcements'
                />
              </div>
              <div className='absolute top-0 left-0 w-[200px] -rotate-3 motion-reduce:[animation:none!important] sm:w-[230px] [animation:float_7s_ease-in-out_infinite]'>
                <PhoneFrame
                  src='/screenshots/mobile-my-day.png'
                  alt="A student's My day screen, showing the current class, a cancelled class and a room change"
                  priority
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Product tour: real screenshots */}
        <section
          id='tour'
          className='border-t border-[var(--color-line)] bg-[var(--color-surface-sunken)]'
        >
          <div className='mx-auto max-w-6xl px-6 py-20 sm:py-24'>
            <Reveal>
              <SectionNumber n='01' label='See it in action' />
            </Reveal>
            <Reveal delay={80}>
              <p className='mt-4 max-w-2xl text-3xl font-bold tracking-tight text-[var(--color-ink)]'>
                Real screens. Nothing staged.
              </p>
            </Reveal>

            <Reveal>
              <h3 className='mt-14 text-lg font-bold text-[var(--color-ink)]'>
                For students, teachers and CRs
              </h3>
              <p className='mt-1 text-sm text-[var(--color-ink-muted)]'>
                Day-of-class, on the phone.
              </p>
            </Reveal>
            <div className='mt-8 flex gap-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:gap-8 sm:overflow-visible lg:grid-cols-5'>
              {MOBILE_SHOTS.map((shot, i) => (
                <Reveal
                  key={shot.caption}
                  delay={i * 90}
                  className='w-[220px] shrink-0 sm:w-auto'
                >
                  <div className='group rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-5 transition-transform duration-300 hover:-translate-y-1.5'>
                    <PhoneFrame src={shot.src} alt={shot.alt} />
                    <p className='mt-4 text-center font-semibold text-[var(--color-ink)]'>
                      {shot.caption}
                    </p>
                    <p className='mt-1 text-center text-sm text-[var(--color-ink-muted)]'>
                      {shot.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <h3 className='mt-20 text-lg font-bold text-[var(--color-ink)]'>
                For department admins
              </h3>
              <p className='mt-1 text-sm text-[var(--color-ink-muted)]'>
                Setup, on the web.
              </p>
            </Reveal>
            <div className='mt-8 grid gap-8 sm:grid-cols-2'>
              {DASHBOARD_SHOTS.map((shot, i) => (
                <Reveal key={shot.caption} delay={i * 90}>
                  <div className='transition-transform duration-300 hover:-translate-y-1.5'>
                    <BrowserFrame src={shot.src} alt={shot.alt} />
                    <p className='mt-4 font-semibold text-[var(--color-ink)]'>
                      {shot.caption}
                    </p>
                    <p className='mt-1 text-sm text-[var(--color-ink-muted)]'>
                      {shot.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section id='roles' className='border-t border-[var(--color-line)]'>
          <div className='mx-auto max-w-6xl px-6 py-20 sm:py-24'>
            <Reveal>
              <SectionNumber n='02' label="Who it's for" />
            </Reveal>
            <Reveal delay={80}>
              <p className='mt-4 max-w-2xl text-3xl font-bold tracking-tight text-[var(--color-ink)]'>
                Everyone gets what they need, nothing they don&apos;t.
              </p>
            </Reveal>
            <div className='mt-12 grid gap-6 md:grid-cols-3'>
              {ROLES.map(({ icon: Icon, title, description }, i) => (
                <Reveal key={title} delay={i * 100}>
                  <div className='group relative h-full overflow-hidden rounded-xl border border-[var(--color-line)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20'>
                    <div className='absolute inset-x-0 top-0 h-1 bg-[var(--color-brand)]' />
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-brand)] transition-transform duration-300 group-hover:scale-110'>
                      <Icon size={20} />
                    </div>
                    <h3 className='mt-4 font-bold text-[var(--color-ink)]'>
                      {title}
                    </h3>
                    <p className='mt-2 text-sm text-[var(--color-ink-muted)]'>
                      {description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id='features'
          className='border-t border-[var(--color-line)] bg-[var(--color-surface-sunken)]'
        >
          <div className='mx-auto max-w-6xl px-6 py-20 sm:py-24'>
            <Reveal>
              <SectionNumber n='03' label='Features' />
            </Reveal>
            <Reveal delay={80}>
              <p className='mt-4 max-w-2xl text-3xl font-bold tracking-tight text-[var(--color-ink)]'>
                Everything a department needs to stay in sync.
              </p>
            </Reveal>
            <div className='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
              {FEATURES.map(({ icon: Icon, title, description }, i) => (
                <Reveal key={title} delay={(i % 3) * 90}>
                  <div className='group'>
                    <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)] shadow-md shadow-black/20 transition-transform duration-300 group-hover:scale-110'>
                      <Icon size={22} />
                    </div>
                    <h3 className='mt-4 font-bold text-[var(--color-ink)]'>
                      {title}
                    </h3>
                    <p className='mt-1.5 text-sm text-[var(--color-ink-muted)]'>
                      {description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* For departments / CTA */}
        <section
          id='departments'
          className='border-t border-[var(--color-line)]'
        >
          <div className='mx-auto max-w-6xl px-6 py-20 sm:py-24'>
            <Reveal>
              <div className='relative flex flex-col items-start justify-between gap-10 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-10 text-[var(--color-ink)] md:flex-row md:items-center md:p-14'>
                <div
                  aria-hidden='true'
                  className='absolute inset-x-0 top-0 h-1 bg-[var(--color-brand)]'
                />
                <div>
                  <p className='text-2xl font-bold tracking-tight sm:text-3xl'>
                    Setting up a department takes minutes.
                  </p>
                  <ul className='mt-5 space-y-2 text-sm text-[var(--color-ink-muted)]'>
                    {[
                      'Add batches, sections and courses',
                      'Import your roster from a spreadsheet',
                      'Build the weekly routine, clash-free',
                    ].map((item) => (
                      <li key={item} className='flex items-center gap-2'>
                        <CheckCircle2
                          size={16}
                          className='text-[var(--color-brand)]'
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href='/auth/login' className='shrink-0'>
                  <Button
                    type='primary'
                    size='large'
                    className='!border-none !bg-[var(--color-brand)]'
                  >
                    Sign in as a department admin
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className='border-t border-[var(--color-line)]'>
        <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-[var(--color-ink-faint)] sm:flex-row'>
          <div className='flex items-center gap-2'>
            <Image src='/logo-transparent.png' alt='' width={18} height={18} />
            <span>&copy; {new Date().getFullYear()} UniSync</span>
          </div>
          <Link
            href='/delete-account'
            className='!text-[var(--color-ink-faint)] hover:!text-[var(--color-ink-muted)]'
          >
            Delete your account
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default Home
