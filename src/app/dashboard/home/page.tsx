'use client'

import { use, useEffect, useState } from "react"
import axios from 'axios'

type Listing = {
  _id: string,
  title: string,
  description: string,
  price: number,
  address: string,
  city: string,
  country: string,
  image: string,
  facilities: string, // Or [String] if you parse it as an array
  userEmail: string,
}

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get('/api/listings')
      .then((res) => {
        setListings(res.data)
        console.log(res.data)
      })
      .catch((err) => {
        console.error(err)
        setError(err.response?.data?.error || "Failed to fetch listings")
      })
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All listings</h1>
      {error && <p className="text-red-600">{error}</p>}
      {!error && listings.length === 0 && <p>Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing._id} className="border p-4 rounded-lg shadow">
            <img
              src={listing.image}
              alt={listing.title}
             className="w-full h-48 object-cover rounded mb-3"
            />
            <h2 className="text-lg font-semibold">{listing.title}</h2>
            <p className="text-sm text-gray-600 mb-1">{listing.description}</p>
            <p className="text-sm">📍 {listing.address}, {listing.city}, {listing.country}</p>
            <p className="text-sm">🏷️ Facilities: {listing.facilities}</p>
            <p className="text-sm">👤 Posted by: {listing.userEmail}</p>
            <p className="text-blue-600 font-bold mt-2">${listing.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}