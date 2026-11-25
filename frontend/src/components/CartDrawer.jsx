import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { formatPrice } from '../lib/api'

const FREE_SHIPPING_THRESHOLD_CENTS = 10000
const SHIPPING_CENTS = 699

export default function CartDrawer({ open, items, onClose, onQuantityChange, onRemove, onCheckout }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0,
  )
  const shippingCents = items.length === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_CENTS
  const totalCents = subtotalCents + shippingCents
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents)

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close bag"
        onClick={onClose}
        className="absolute inset-0 animate-[fade_.2s_ease-out] bg-ink/40 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute right-0 top-0 z-10 flex h-full w-full max-w-md animate-[drawer_.3s_cubic-bezier(0.22,1,0.36,1)] flex-col bg-canvas shadow-lift"
      >
        <header className="flex items-center justify-between border-b border-black/[0.06] bg-white px-5 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ember-600">Your bag</p>
            <h2 id="cart-title" className="mt-1 font-display text-2xl font-bold text-ink">Shopping cart</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-purple-50"
          >
            <X size={20} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-50 text-purple-600">
              <ShoppingBag size={28} />
            </span>
            <h3 className="mt-6 font-display text-xl font-bold text-ink">Your bag is empty</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              Add something you love and it will show up here.
            </p>
            <Link to="/shop" onClick={onClose} className="btn-primary mt-7">
              Browse products <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <p className="mb-4 text-xs font-medium text-muted">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag
              </p>

              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.slug}
                    className="flex gap-4 rounded-3xl border border-black/[0.06] bg-white p-3.5 shadow-soft"
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      onClick={onClose}
                      className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-purple-50"
                      aria-label={`View ${item.name}`}
                    >
                      {item.image ? (
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ShoppingBag size={24} className="text-purple-500" />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-purple-500">
                            {item.category}
                          </p>
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={onClose}
                            className="mt-1 block truncate font-display text-sm font-bold text-ink transition hover:text-purple-600"
                          >
                            {item.name}
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(item.slug)}
                          aria-label={`Remove ${item.name} from bag`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-ember-50 hover:text-ember-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center rounded-full border border-black/10 bg-canvas">
                          <button
                            type="button"
                            onClick={() => onQuantityChange(item.slug, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition hover:bg-purple-50 disabled:opacity-30"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-7 text-center font-accent text-xs font-bold text-ink">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onQuantityChange(item.slug, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition hover:bg-purple-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-accent text-sm font-bold text-ink">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      <p className="mt-1 text-[11px] text-muted">{formatPrice(item.price)} each</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-black/[0.06] bg-white px-5 py-5 sm:px-6">
              <div className="mb-4 rounded-2xl bg-purple-50 px-4 py-3 text-xs font-medium text-purple-800">
                {remainingForFreeShipping > 0
                  ? `Add ${formatPrice(remainingForFreeShipping / 100)} more for free shipping.`
                  : 'You have unlocked free shipping.'}
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="font-medium text-ink">{formatPrice(subtotalCents / 100)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Shipping</dt>
                  <dd className="font-medium text-ink">{shippingCents ? formatPrice(shippingCents / 100) : 'Free'}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-black/[0.07] pt-3 text-base font-bold text-ink">
                  <dt>Total</dt>
                  <dd className="font-accent" aria-live="polite">{formatPrice(totalCents / 100)}</dd>
                </div>
              </dl>
              <p className="mt-1 text-right text-[11px] text-muted">Taxes calculated at checkout.</p>

              <button type="button" onClick={onCheckout} className="btn-primary mt-5 w-full">
                Checkout <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full py-2 text-xs font-semibold text-muted transition hover:text-ink"
              >
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
