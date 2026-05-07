import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res){
  const { id } = req.query
  if (req.method === 'GET'){
    const listing = await prisma.listing.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        bookings: {
          orderBy: { startDate: 'asc' }
        }
      }
    })
    if (!listing) return res.status(404).json({ error: 'Not found' })
    res.json(listing)
  } else if (req.method === 'PUT') {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user || session.user.role !== 'host') {
      return res.status(401).json({ error: 'No autorizado' })
    }

    const { title, description, address, city, price, images } = req.body
    if (!title || !description || !address || !city || !price) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }

    const listingId = Number(id)
    await prisma.image.deleteMany({ where: { listingId } })

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        title,
        description,
        address,
        city,
        price: Number(price),
        images: {
          create: (images || []).map((path) => ({ path }))
        }
      },
      include: { images: true, bookings: true }
    })

    res.json(updated)
  } else {
    res.status(405).end()
  }
}
