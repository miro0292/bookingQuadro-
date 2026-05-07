import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey || !secretKey.startsWith('sk_')) {
    return res.status(400).json({ error: 'Stripe no configurado. Define STRIPE_SECRET_KEY.' })
  }

  const { listingTitle, price, nights, guests, startDate, endDate, listingId } = req.body
  if (!listingTitle || !price || !nights || !startDate || !endDate) {
    return res.status(400).json({ error: 'Datos incompletos para pago' })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' })
  const origin = req.headers.origin || process.env.NEXTAUTH_URL || 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'cop',
            unit_amount: Math.round(Number(price) * Number(nights)),
            product_data: {
              name: `Reserva - ${listingTitle}`,
              description: `${nights} noches, ${guests || 1} huesped(es)`
            }
          }
        }
      ],
      metadata: {
        listingId: String(listingId || ''),
        startDate: String(startDate),
        endDate: String(endDate),
        guests: String(guests || 1)
      },
      success_url: `${origin}/listing/${listingId}?pago=exitoso`,
      cancel_url: `${origin}/listing/${listingId}?pago=cancelado`
    })

    return res.json({ url: session.url })
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo iniciar el pago con Stripe' })
  }
}
