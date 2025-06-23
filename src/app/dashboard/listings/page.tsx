'use client'

import { ChangeEvent, useEffect, useState } from "react"
import axios from 'axios'
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogTrigger, DialogClose, DialogDescription, DialogTitle, DialogHeader, DialogFooter, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Building2, MapPin, Tag, User } from "lucide-react"
import { deleteListing, fetchListings, updateListing } from "@/lib/api/listings"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Listing = {
  _id: string,
  title: string,
  description: string,
  price: number,
  address: string,
  city: string,
  country: string,
  image: string,
  facilities: string,
  userEmail: string,
}

type InputField = {
  name: keyof Listing;
  type: string;
  placeholder: string;
}

const DEFAULT_IMAGE = "https://dummyimage.com/600x400/000/fff&text=No+Image"

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newListing, setNewListing] = useState<Partial<Listing>>({});
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Listing, string>>>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // 6 per page for grid
  const [total, setTotal] = useState(0);

  const inputFields: InputField[] = [
    { name: "title", type: "text", placeholder: "Title" },
    { name: "description", type: "text", placeholder: "Description" },
    { name: "price", type: "number", placeholder: "Price" },
    { name: "address", type: "text", placeholder: "Address" },
    { name: "city", type: "text", placeholder: "City" },
    { name: "country", type: "text", placeholder: "Country" },
  ]

  useEffect(() => {
    setIsLoading(true)
    fetchListings(page, limit)
      .then((res) => {
        setListings(res.data.listings)
        setTotal(res.data.total)
      })
      .catch((err) => {
        console.error("API error:", err)
        const errorMessage = err.response?.data?.errorMessage || 
                            err.response?.data?.error || 
                            "Failed to fetch listings"
        setError(errorMessage)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [page, limit])

  const getValidImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return DEFAULT_IMAGE
    try {
      new URL(imageUrl)
      return imageUrl
    } catch {
      return DEFAULT_IMAGE
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteListing(id)
      setListings(listings.filter(listing => listing._id !== id));
      setError(null);
    } catch (error) {
      console.error("Error deleting listing:", error);
      setError(error instanceof Error ? error.message : "Failed to delete listing");
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditingListing({...listing});
    setFormErrors({});
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if(!editingListing) return;

    const updatedValue = name === "price" ? parseFloat(value) : value;
    setEditingListing(prev => prev ? {...prev, [name]: updatedValue} : null);

    if (name === "description") {
      const textarea = e.target as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleNewInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedValue = name === "price" ? parseFloat(value) : value;
    setNewListing(prev => ({...prev, [name]: updatedValue}));

    if (name === "description") {
      const textarea = e.target as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleAddListing = async () => {
    try {
      const requiredFields = ['title', 'description', 'price', 'address', 'city', 'country'];
      const missingFields = requiredFields.filter(field => !newListing[field as keyof typeof newListing]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const userEmail = listings[0]?.userEmail;
      if (!userEmail) {
        throw new Error("User email not found");
      }

      const listingData = {
        ...newListing,
        userEmail,
        image: "https://dummyimage.com/600x400/000/fff&text=No+Image",
        facilities: "Basic amenities"
      };

      const response = await axios.post('/api/listings', listingData);
      if (response.status === 201) {
        setListings([...listings, response.data]);
        setIsAddDialogOpen(false);
        setNewListing({});
        setError(null);
      } else {
        throw new Error("Failed to create listing");
      }
    } catch (error) {
      console.error("Error adding listing:", error);
      setError(error instanceof Error ? error.message : "Failed to add listing");
    }
  };

  const handleDialogClose = () => {
    setEditingListing(null);
    setFormErrors({});
  };

  const handleUpdate = async () => {
    if(!editingListing) return;
    try {
      if (!validateForm(editingListing)) {
        return;
      }

      await updateListing(editingListing)
      setListings(listings.map(l => (l._id === editingListing._id ? editingListing : l)));
      setError(null);
      handleDialogClose();
    } catch (error) {
      console.error("Error updating listing:", error);
      setError(error instanceof Error ? error.message : "Failed to update listing");
    }
  };

  const validateForm = (listing: Listing): boolean => {
    const errors: Partial<Record<keyof Listing, string>> = {};
    for (const field of inputFields) {
      if (!listing[field.name]) {
        errors[field.name] = `Please fill in the ${field.name}`;
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Listings</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto text-base">
              <Plus className="mr-2 h-5 w-5" />
              Add Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Listing</DialogTitle>
              <DialogDescription className="text-base">Fill in the details for your new listing:</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {inputFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  {field.name === "description" ? (
                    <Textarea
                      name={field.name}
                      value={(newListing as Partial<Listing>)[field.name] || ""}
                      onChange={handleNewInputChange}
                      placeholder={field.placeholder}
                      className={`${formErrors[field.name] ? "border-red-500" : ""} min-h-[150px] text-base`}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      name={field.name}
                      value={(newListing as Partial<Listing>)[field.name] || ""}
                      onChange={handleNewInputChange}
                      placeholder={field.placeholder}
                      className={`${formErrors[field.name] ? "border-red-500" : ""} text-base`}
                    />
                  )}
                  {formErrors[field.name] && (
                    <p className="text-sm text-red-500">{formErrors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" className="text-base" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button className="text-base" onClick={handleAddListing}>Add Listing</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-base">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {isLoading ? (
          Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <Skeleton className="w-full h-[200px] rounded-t-lg" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : listings.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No listings found</h3>
            <p className="mt-2 text-base text-muted-foreground">Get started by creating a new listing.</p>
          </div>
        ) : (
          listings.map((listing) => (
            <Card key={listing._id} className="w-full">
              <CardHeader className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={getValidImageUrl(listing.image)}
                    alt={listing.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-xl font-semibold line-clamp-1">{listing.title}</h3>
                <p className="text-base text-muted-foreground line-clamp-2">{listing.description}</p>
                <div className="flex items-center text-base text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{listing.address}, {listing.city}, {listing.country}</span>
                </div>
                <div className="flex items-center text-base text-muted-foreground">
                  <Tag className="h-5 w-5 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{listing.facilities}</span>
                </div>
                <div className="flex items-center text-base text-muted-foreground">
                  <User className="h-5 w-5 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{listing.userEmail}</span>
                </div>
                <p className="text-xl font-bold text-primary">${listing.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(listing)}
                      className="text-base"
                    >
                      <Pencil className="h-5 w-5 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[90vw] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-2">
                      <DialogTitle className="text-xl sm:text-2xl font-semibold">Edit</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-3">
                      {inputFields.map((field) => (
                        <div key={field.name} className="space-y-1.5">
                          <label className="text-sm sm:text-base font-medium">{field.placeholder}</label>
                          {field.name === "description" ? (
                            <Textarea
                              name={field.name}
                              value={(editingListing as Partial<Listing>)?.[field.name] || ""}
                              onChange={handleInputChange}
                              placeholder={field.placeholder}
                              className={`${formErrors[field.name] ? "border-red-500" : ""} min-h-[80px] sm:min-h-[100px] text-sm sm:text-base`}
                            />
                          ) : (
                            <Input
                              type={field.type}
                              name={field.name}
                              value={(editingListing as Partial<Listing>)?.[field.name] || ""}
                              onChange={handleInputChange}
                              placeholder={field.placeholder}
                              className={`${formErrors[field.name] ? "border-red-500" : ""} text-sm sm:text-base h-9 sm:h-10`}
                            />
                          )}
                          {formErrors[field.name] && (
                            <p className="text-xs sm:text-sm text-red-500">{formErrors[field.name]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                      <Button variant="outline" className="text-sm sm:text-base px-3 sm:px-4 w-full sm:w-auto" onClick={handleUpdate}>Save</Button>
                      <DialogClose asChild>
                        <Button variant="secondary" className="text-sm sm:text-base px-3 sm:px-4 w-full sm:w-auto">Cancel</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(listing._id)}
                  className="text-base"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="self-center">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= Math.ceil(total / limit)}
        >
          Next
        </Button>
      </div>
    </div>
  )
} 