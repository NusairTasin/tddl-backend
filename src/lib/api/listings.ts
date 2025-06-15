import axios from 'axios'

interface Listing {
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  country: string;
  image: string;
  facilities: string;
  userEmail: string;
}

export const fetchListings = () => axios.get('/api/listings');
export const updateListing = (data: Listing) => axios.put('/api/listings', data);
export const deleteListing = (id: string) => axios.delete('/api/listings', { data: { id } });