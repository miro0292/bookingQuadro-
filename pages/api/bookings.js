import prisma from '../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

export default async function handler(req, res){
  if (req.method === 'POST'){
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Debes iniciar sesion para reservar' })
    }

    const { listingId, startDate, endDate, total } = req.body
    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Datos incompletos para reservar' })
    }

    const email = String(session.user.email).toLowerCase()
    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {
        name: session.user.name || undefined,
        image: session.user.image || undefined
      },
      create: {
        email,
        name: session.user.name || 'Guest User',
        image: session.user.image || null,
        role: 'guest'
      }
    })

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ error: 'Rango de fechas no valido' })
    }

    const overlap = await prisma.booking.findFirst({
      where: {
        listingId: Number(listingId),
        startDate: { lt: end },
        endDate: { gt: start }
      }
    })

    if (overlap) {
      return res.status(409).json({ error: 'Estas fechas ya no estan disponibles' })
    }

    const booking = await prisma.booking.create({ data: {
      listingId: Number(listingId),
      userId: dbUser.id,
      startDate: start,
      endDate: end,
      total: Number(total)
    }})
    res.json(booking)
  } else {
    res.status(405).end()
  }
}
