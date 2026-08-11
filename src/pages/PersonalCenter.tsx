import { Link } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

export default function PersonalCenter(){
  const { user, profile } = useAuth()
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Member Account'
  const email = user?.email || 'Signed in account'

  return <main className="min-h-[calc(100vh-64px)] overflow-x-hidden bg-[#090909] px-5 py-10 sm:px-8">
    <div className="mx-auto w-full max-w-[1152px]">
      <header className="mb-8 flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-primary">Personal Center</p>
          <h1 className="font-['Unbounded'] text-[32px] font-medium leading-tight text-white">Account Overview</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Manage credits, billing, saved work, and account details from one place.</p>
        </div>
        <Link to="/plans" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-black">Upgrade for more</Link>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-lg font-bold text-black">
                {displayName[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{displayName}</h2>
                <p className="text-sm text-muted">{email}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary/10 px-5 py-3 text-sm text-primary">Member Account</div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-[#101010] p-5">
              <p className="text-xs uppercase tracking-[.18em] text-muted">Credit Balance</p>
              <p className="mt-4 text-3xl font-semibold text-white">✦ —</p>
            </div>
            <div className="rounded-2xl border border-border bg-[#101010] p-5">
              <p className="text-xs uppercase tracking-[.18em] text-muted">Total Credits</p>
              <p className="mt-4 text-3xl font-semibold text-white">—</p>
            </div>
            <div className="rounded-2xl border border-border bg-[#101010] p-5">
              <p className="text-xs uppercase tracking-[.18em] text-muted">Renewal Date</p>
              <p className="mt-4 text-base font-semibold text-white">—</p>
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[.18em] text-muted">Quick Actions</p>
          <div className="mt-5 grid gap-3">
            <Link to="/dashboard" className="rounded-xl border border-border px-4 py-3 text-sm text-gray-300 transition-colors hover:border-primary/50 hover:text-white">Go to Dashboard</Link>
            <Link to="/hardware-gallery" className="rounded-xl border border-border px-4 py-3 text-sm text-gray-300 transition-colors hover:border-primary/50 hover:text-white">Browse Hardware</Link>
            <button onClick={() => window.dispatchEvent(new Event('open-sales-chat'))} className="rounded-xl border border-border px-4 py-3 text-left text-sm text-gray-300 transition-colors hover:border-primary/50 hover:text-white">Talk to Sales</button>
          </div>
        </aside>
      </section>

      <section className="mt-6 w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card" data-credits-record>
        <div className="flex flex-col gap-2 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-2xl font-semibold text-white">Credits Record</h2>
            <p className="mt-1 text-sm text-muted">Last 12 months</p>
          </div>
        </div>
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-muted">
              <tr className="border-b border-border">
                <th className="px-8 py-5 font-medium">Date</th>
                <th className="px-8 py-5 font-medium">Event</th>
                <th className="px-8 py-5 font-medium">Credit</th>
                <th className="px-8 py-5 font-medium">Expire Date</th>
                <th className="px-8 py-5 font-medium">Credit Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-gray-300">
                <td className="px-8 py-6" colSpan={5}>No credit activity yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
}
