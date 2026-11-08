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

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#roles', label: "Who it's for" },
  { href: '#departments', label: 'For departments' },
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

const Home = () => {
  return (
    <div className='bg-white text-gray-900'>
      {/* Header */}
      <header className='sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur-sm'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
          <div className='flex items-center gap-2'>
            <Image
              src='/logo-transparent.png'
              alt='UniSync'
              width={28}
              height={28}
            />
            <span className='text-lg font-semibold tracking-tight'>
              UniSync
            </span>
          </div>
          <nav className='hidden items-center gap-8 text-sm text-gray-600 md:flex'>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className='!text-gray-600 transition-colors hover:!text-gray-900'
              >
                {link.label}
              </a>
            ))}
          </nav>
          <Link href='/auth/login'>
            <Button type='primary'>Sign in</Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className='relative overflow-hidden bg-linear-to-b from-blue-50 via-white to-white'>
          <div className='mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 md:grid-cols-2 md:py-28'>
            <div>
              <span className='inline-flex items-center gap-2 border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700'>
                Built for one university at a time
              </span>
              <h1 className='mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
                Everyone&apos;s schedule, always current.
              </h1>
              <p className='mt-5 max-w-md text-lg text-gray-600'>
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
                  >
                    Sign in to set up your department
                  </Button>
                </Link>
                <span className='inline-flex items-center gap-1.5 text-sm text-gray-500'>
                  <MobileOutlined />
                  Mobile app coming soon to iOS &amp; Android
                </span>
              </div>
            </div>

            {/* Decorative "My day" mockup. Illustrative only, not real data. */}
            <div
              aria-hidden='true'
              className='relative mx-auto w-full max-w-sm'
            >
              <div className='absolute -inset-6 -z-10 bg-linear-to-br from-blue-100 to-indigo-100 blur-2xl' />
              <div className='border border-gray-200 bg-white p-5 shadow-xl shadow-blue-950/5'>
                <div className='flex items-center justify-between border-b border-gray-100 pb-3'>
                  <span className='font-semibold text-gray-900'>My day</span>
                  <span className='text-xs text-gray-400'>Monday</span>
                </div>
                <div className='mt-4 space-y-3'>
                  <div className='border-l-4 border-blue-500 bg-blue-50/60 py-2 pl-3'>
                    <p className='text-xs font-medium text-blue-700'>
                      NOW · 10:00&ndash;11:00
                    </p>
                    <p className='mt-0.5 text-sm font-semibold text-gray-900'>
                      Database Systems
                    </p>
                    <p className='text-xs text-gray-500'>Room 204</p>
                  </div>
                  <div className='border-l-4 border-amber-400 bg-amber-50/60 py-2 pl-3'>
                    <p className='text-xs font-medium text-amber-700'>
                      MOVED · 11:30&ndash;12:30
                    </p>
                    <p className='mt-0.5 text-sm font-semibold text-gray-900'>
                      Linear Algebra
                    </p>
                    <p className='text-xs text-gray-500'>
                      Now in Room 108 &middot; projector repair
                    </p>
                  </div>
                  <div className='border-l-4 border-gray-200 py-2 pl-3 opacity-60'>
                    <p className='text-xs font-medium text-gray-400 line-through'>
                      CANCELLED · 14:00&ndash;15:00
                    </p>
                    <p className='mt-0.5 text-sm font-semibold text-gray-500 line-through'>
                      Thermodynamics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section id='roles' className='border-t border-gray-100'>
          <div className='mx-auto max-w-6xl px-6 py-20'>
            <div className='max-w-2xl'>
              <h2 className='text-sm font-semibold tracking-wide text-blue-600 uppercase'>
                One system, three roles
              </h2>
              <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900'>
                Everyone gets what they need, nothing they don&apos;t.
              </p>
            </div>
            <div className='mt-12 grid gap-6 md:grid-cols-3'>
              {ROLES.map((role) => (
                <div
                  key={role.title}
                  className='border border-gray-200 p-6 transition-shadow hover:shadow-md'
                >
                  <h3 className='font-semibold text-gray-900'>{role.title}</h3>
                  <p className='mt-2 text-sm text-gray-600'>
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id='features' className='border-t border-gray-100 bg-gray-50'>
          <div className='mx-auto max-w-6xl px-6 py-20'>
            <div className='max-w-2xl'>
              <h2 className='text-sm font-semibold tracking-wide text-blue-600 uppercase'>
                Features
              </h2>
              <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900'>
                Everything a department needs to stay in sync.
              </p>
            </div>
            <div className='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title}>
                  <div className='flex h-10 w-10 items-center justify-center bg-blue-600 text-lg text-white'>
                    <Icon />
                  </div>
                  <h3 className='mt-4 font-semibold text-gray-900'>{title}</h3>
                  <p className='mt-1.5 text-sm text-gray-600'>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For departments / CTA */}
        <section id='departments' className='border-t border-gray-100'>
          <div className='mx-auto max-w-6xl px-6 py-20'>
            <div className='flex flex-col items-start justify-between gap-10 border border-gray-200 bg-linear-to-br from-blue-600 to-blue-700 p-10 text-white md:flex-row md:items-center md:p-14'>
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

      <footer className='border-t border-gray-100'>
        <div className='mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-gray-500 sm:flex-row'>
          <div className='flex items-center gap-2'>
            <Image src='/logo-transparent.png' alt='' width={18} height={18} />
            <span>&copy; {new Date().getFullYear()} UniSync</span>
          </div>
          <Link
            href='/delete-account'
            className='!text-gray-500 hover:!text-gray-700'
          >
            Delete your account
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default Home
