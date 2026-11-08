import { Plus_Jakarta_Sans } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from 'antd'
import {
  ArrowRightOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  LockOutlined,
  MobileOutlined,
  SwapOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons'

// Scoped to this page only: a distinct, considered type voice instead of the
// rest of the app's default Geist, without touching the shared root layout.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-jakarta',
})

const NAV_LINKS = [
  { href: '#tour', label: 'See it in action' },
  { href: '#roles', label: "Who it's for" },
  { href: '#features', label: 'Features' },
]

const FEATURES = [
  {
    icon: CalendarOutlined,
    title: 'My day',
    description:
      "Students and teachers open the app to today's classes, with what's happening now and what's next, not a static printed routine.",
  },
  {
    icon: SwapOutlined,
    title: 'Instant change alerts',
    description:
      'Cancel a class, move it, or swap the room, and the whole section is notified immediately, with the reason attached.',
  },
  {
    icon: BellOutlined,
    title: 'One inbox',
    description:
      'Announcements from teachers and the department land in a single notification inbox, not scattered across group chats.',
  },
  {
    icon: TeamOutlined,
    title: 'Department setup',
    description:
      'Batches, sections, courses, teachers and the weekly routine, all managed from this dashboard, with clashes caught before they happen.',
  },
  {
    icon: UserAddOutlined,
    title: 'Roster-based access',
    description:
      "Only numbers on a department's roster can sign in. Anyone else can ask to join, and an admin approves it in one click.",
  },
  {
    icon: LockOutlined,
    title: 'No passwords',
    description:
      'Sign in with a text code sent to your phone. Nothing to remember, nothing to reset.',
  },
]

const ROLES = [
  {
    title: 'Students',
    description:
      "See your section's schedule, get notified the moment a class changes, and ask your department for access if you're new.",
  },
  {
    title: 'Teachers',
    description:
      'Cancel or move your own classes in a tap, and send a notice to everyone in the section at once.',
  },
  {
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
    <div className='relative rounded-[2.1rem] bg-slate-900 p-2 shadow-xl shadow-slate-900/15 ring-1 ring-black/5'>
      <div
        aria-hidden='true'
        className='absolute top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-900'
      />
      <div className='relative aspect-[1170/1992] overflow-hidden rounded-[1.6rem] bg-white'>
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
  <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5'>
    <div
      aria-hidden='true'
      className='flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2.5'
    >
      <span className='h-2.5 w-2.5 rounded-full bg-slate-300' />
      <span className='h-2.5 w-2.5 rounded-full bg-slate-300' />
      <span className='h-2.5 w-2.5 rounded-full bg-slate-300' />
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

/** A large, pale ordinal sitting behind a section's eyebrow label. Purely decorative. */
const SectionNumber = ({ n, label }: { n: string; label: string }) => (
  <div className='flex items-center gap-4'>
    <span
      aria-hidden='true'
      className='text-6xl leading-none font-extrabold text-slate-100 select-none sm:text-7xl'
    >
      {n}
    </span>
    <span className='text-sm font-semibold tracking-wide text-blue-600 uppercase'>
      {label}
    </span>
  </div>
)

const Home = () => {
  return (
    <div className={`${jakarta.className} bg-white text-slate-900 antialiased`}>
      {/* Header */}
      <header className='sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-sm'>
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
          <nav className='hidden items-center gap-8 text-sm text-slate-600 md:flex'>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className='!text-slate-600 transition-colors hover:!text-slate-900'
              >
                {link.label}
              </a>
            ))}
          </nav>
          <Link href='/auth/login'>
            <Button
              type='primary'
              className='!border-none !bg-linear-to-r !from-blue-600 !to-blue-500'
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
            className='absolute inset-0 -z-20 bg-[radial-gradient(circle,#CBD5E1_1px,transparent_1px)] bg-[length:28px_28px] opacity-60 [mask-image:radial-gradient(ellipse_60%_55%_at_30%_20%,black,transparent)]'
          />
          <div
            aria-hidden='true'
            className='absolute -top-40 -right-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-linear-to-br from-blue-400/25 to-indigo-400/10 blur-3xl'
          />
          <div className='mx-auto grid max-w-6xl items-center gap-16 px-6 pt-16 pb-24 md:grid-cols-[1.05fr_0.95fr] md:pt-24 md:pb-32'>
            <div>
              <span className='inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700'>
                Built for one university at a time
              </span>
              <h1 className='mt-6 text-4xl leading-[1.05] font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]'>
                Everyone&apos;s schedule,{' '}
                <span className='bg-linear-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent'>
                  always current.
                </span>
              </h1>
              <p className='mt-5 max-w-md text-lg text-slate-600'>
                UniSync keeps students, teachers and department admins in sync:
                real-time class schedules, instant alerts when a class is
                cancelled, moved or changes room, and one inbox for everything
                else.
              </p>
              <div className='mt-8 flex flex-wrap items-center gap-4'>
                <Link href='/auth/login'>
                  <Button
                    type='primary'
                    size='large'
                    icon={<ArrowRightOutlined />}
                    iconPosition='end'
                    className='!border-none !bg-linear-to-r !from-blue-600 !to-blue-500 !shadow-lg !shadow-blue-600/25'
                  >
                    Sign in to set up your department
                  </Button>
                </Link>
                <span className='inline-flex items-center gap-1.5 text-sm text-slate-500'>
                  <MobileOutlined />
                  Mobile app coming soon to iOS &amp; Android
                </span>
              </div>
            </div>

            {/* Two real screens from the app, not mockups. */}
            <div className='relative mx-auto h-[340px] w-full max-w-sm sm:h-[400px]'>
              <div className='absolute top-6 right-2 w-[190px] rotate-6 sm:w-[210px]'>
                <PhoneFrame
                  src='/screenshots/mobile-inbox.png'
                  alt='The notifications inbox with several unread announcements'
                />
              </div>
              <div className='absolute top-0 left-0 w-[200px] -rotate-3 sm:w-[230px]'>
                <PhoneFrame
                  src='/screenshots/mobile-my-day.png'
                  alt="A student's My day screen, showing the current class, a cancelled class and a room change"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Product tour: real screenshots */}
        <section id='tour' className='border-t border-slate-100 bg-slate-50'>
          <div className='mx-auto max-w-6xl px-6 py-20 sm:py-24'>
            <SectionNumber n='01' label='See it in action' />
            <p className='mt-4 max-w-2xl text-3xl font-bold tracking-tight text-slate-900'>
              Real screens. Nothing staged.
            </p>

            <h3 className='mt-14 text-lg font-bold text-slate-900'>
              For students, teachers and CRs
            </h3>
            <p className='mt-1 text-sm text-slate-600'>
              Day-of-class, on the phone.
            </p>
            <div className='mt-8 flex gap-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:gap-8 sm:overflow-visible lg:grid-cols-5'>
              {MOBILE_SHOTS.map((shot) => (
                <div
                  key={shot.caption}
                  className='w-[220px] shrink-0 sm:w-auto'
                >
                  <PhoneFrame src={shot.src} alt={shot.alt} />
                  <p className='mt-4 text-center font-semibold text-slate-900'>
                    {shot.caption}
                  </p>
                  <p className='mt-1 text-center text-sm text-slate-600'>
                    {shot.detail}
                  </p>
                </div>
              ))}
            </div>

            <h3 className='mt-20 text-lg font-bold text-slate-900'>
              For department admins
            </h3>
            <p className='mt-1 text-sm text-slate-600'>Setup, on the web.</p>
            <div className='mt-8 grid gap-8 sm:grid-cols-2'>
              {DASHBOARD_SHOTS.map((shot) => (
                <div key={shot.caption}>
                  <BrowserFrame src={shot.src} alt={shot.alt} />
                  <p className='mt-4 font-semibold text-slate-900'>
                    {shot.caption}
                  </p>
                  <p className='mt-1 text-sm text-slate-600'>{shot.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section id='roles' className='border-t border-slate-100'>
          <div className='mx-auto max-w-6xl px-6 py-20 sm:py-24'>
            <SectionNumber n='02' label="Who it's for" />
            <p className='mt-4 max-w-2xl text-3xl font-bold tracking-tight text-slate-900'>
              Everyone gets what they need, nothing they don&apos;t.
            </p>
            <div className='mt-12 grid gap-6 md:grid-cols-3'>
              {ROLES.map((role) => (
                <div
                  key={role.title}
                  className='relative overflow-hidden rounded-xl border border-slate-200 p-6 transition-shadow hover:shadow-lg hover:shadow-slate-900/5'
                >
                  <div className='absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 to-sky-400' />
                  <h3 className='font-bold text-slate-900'>{role.title}</h3>
                  <p className='mt-2 text-sm text-slate-600'>
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id='features'
          className='border-t border-slate-100 bg-slate-50'
        >
          <div className='mx-auto max-w-6xl px-6 py-20 sm:py-24'>
            <SectionNumber n='03' label='Features' />
            <p className='mt-4 max-w-2xl text-3xl font-bold tracking-tight text-slate-900'>
              Everything a department needs to stay in sync.
            </p>
            <div className='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title}>
                  <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-sky-500 text-lg text-white shadow-md shadow-blue-600/20'>
                    <Icon />
                  </div>
                  <h3 className='mt-4 font-bold text-slate-900'>{title}</h3>
                  <p className='mt-1.5 text-sm text-slate-600'>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For departments / CTA */}
        <section id='departments' className='border-t border-slate-100'>
          <div className='mx-auto max-w-6xl px-6 py-20 sm:py-24'>
            <div className='relative flex flex-col items-start justify-between gap-10 overflow-hidden rounded-2xl bg-linear-to-br from-blue-700 via-blue-600 to-sky-500 p-10 text-white md:flex-row md:items-center md:p-14'>
              <div
                aria-hidden='true'
                className='absolute inset-0 -z-10 bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-[length:24px_24px] opacity-10'
              />
              <div>
                <p className='text-2xl font-bold tracking-tight sm:text-3xl'>
                  Setting up a department takes minutes.
                </p>
                <ul className='mt-5 space-y-2 text-sm text-blue-50'>
                  {[
                    'Add batches, sections and courses',
                    'Import your roster from a spreadsheet',
                    'Build the weekly routine, clash-free',
                  ].map((item) => (
                    <li key={item} className='flex items-center gap-2'>
                      <CheckCircleFilled className='text-blue-200' />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href='/auth/login' className='shrink-0'>
                <Button
                  size='large'
                  className='!border-white !bg-white !text-blue-700 hover:!bg-blue-50'
                >
                  Sign in as a department admin
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className='border-t border-slate-100'>
        <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-slate-500 sm:flex-row'>
          <div className='flex items-center gap-2'>
            <Image src='/logo-transparent.png' alt='' width={18} height={18} />
            <span>&copy; {new Date().getFullYear()} UniSync</span>
          </div>
          <Link
            href='/delete-account'
            className='!text-slate-500 hover:!text-slate-700'
          >
            Delete your account
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default Home
