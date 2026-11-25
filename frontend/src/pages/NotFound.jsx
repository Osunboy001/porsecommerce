import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="font-display text-5xl font-extrabold text-ink">404</h1>
      <p className="mt-3 text-sm text-muted">That page doesn&apos;t exist.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">Back to home</Link>
        <Link to="/shop" className="btn-ghost">Browse the shop</Link>
      </div>
    </main>
  )
}
