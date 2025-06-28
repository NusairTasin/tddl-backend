'use client'
import axios from 'axios'

export type ContactInfo = {
    name: string,
    email: string,
    phone: string
}

export const fetchContactInfo = async (): Promise<ContactInfo | null> => {
    try {
      const response = await axios.get('/api/contact');
      const contacts = response.data.contacts;
      
      if (contacts && contacts.length > 0) {
        return {
          name: contacts[0].name,
          email: contacts[0].email,
          phone: contacts[0].phone,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching contact info:', error);
      throw error;
    }
  };