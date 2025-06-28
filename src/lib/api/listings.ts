import axios from 'axios'

interface Listing {
  _id: string,
  title: string,
  description: string,
  price: number,
  address: string,
  city: string,
  image: string,
  facilities: string,
  contactName: string,
  contactEmail: string,
  contactPhone: string,
}

export const fetchListings = (page = 1, limit = 10) => axios.get(`/api/listings?page=${page}&limit=${limit}`);
export const updateListing = (data: Listing) => axios.put('/api/listings', data);
export const deleteListing = (id: string) => axios.delete('/api/listings', { data: { id } });