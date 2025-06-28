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
import { fetchContactInfo, ContactInfo } from "../contact/fetchContact";

type Listing = {
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

type InputField = {
  name: keyof Omit<Listing, '_id' | 'contactName' | 'contactEmail' | 'contactPhone'>;
  type: string;
  placeholder: string;
  required?: boolean;
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
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  const inputFields: InputField[] = [
    { name: "title", type: "text", placeholder: "Title", required: true },
    { name: "description", type: "text", placeholder: "Description", required: true },
    { name: "price", type: "number", placeholder: "Price", required: true },
    { name: "address", type: "text", placeholder: "Address", required: true },
    { name: "city", type: "text", placeholder: "City", required: true },
    { name: "image", type: "url", placeholder: "Image URL (optional)" },
    { name: "facilities", type: "text", placeholder: "Facilities (optional)" },
  ]

  const dialogInputClass = "min-h-[50px] sm:text-sm md:text-md";
  const dialogLabelClass = "sm:text-sm md:text-md font-medium";
  const dialogDescription = "min-h-[70px] sm:text-sm md:text-md";

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

  useEffect(() => {
    const getContactInfo = async () => {
      try {
        setIsLoading(true)
        const info = await fetchContactInfo()
        setContactInfo(info)
        setError(null)
      } catch(err) {
        setError('Failed to load contact information')
        console.error('Contact fetch error', err)
      } finally {
        setIsLoading(false)
      }
    }
    getContactInfo();
  }, [])

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

    // Clear error when user starts typing
    if (formErrors[name as keyof Listing]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }

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

    // Clear error when user starts typing
    if (formErrors[name as keyof Listing]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }

    if (name === "description") {
      const textarea = e.target as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const validateNewListing = (listing: Partial<Listing>): boolean => {
    const errors: Partial<Record<keyof Listing, string>> = {};
    
    // Validate required fields
    if (!listing.title?.trim()) {
      errors.title = "Title is required";
    } else if (listing.title.length > 100) {
      errors.title = "Title is too long (max 100 characters)";
    }

    if (!listing.description?.trim()) {
      errors.description = "Description is required";
    } else if (listing.description.length > 1000) {
      errors.description = "Description is too long (max 1000 characters)";
    }

    if (!listing.price || listing.price <= 0) {
      errors.price = "Price must be a positive number";
    }

    if (!listing.address?.trim()) {
      errors.address = "Address is required";
    }

    if (!listing.city?.trim()) {
      errors.city = "City is required";
    }

    // Validate image URL if provided
    if (listing.image && listing.image.trim()) {
      try {
        new URL(listing.image);
      } catch {
        errors.image = "Please enter a valid image URL";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddListing = async () => {
    try {
      // Validate form before submission
      if (!validateNewListing(newListing)) {
        return;
      }

      // Set default values for optional fields
      const listingData = {
        ...newListing,
        image: newListing.image?.trim() || DEFAULT_IMAGE,
        facilities: newListing.facilities?.trim() || "No facilities listed",
        contactName: contactInfo?.name || "",
        contactEmail: contactInfo?.email || "",
        contactPhone: contactInfo?.phone || ""
      };

      const response = await axios.post('/api/listings', listingData);
      if (response.status === 201) {
        setListings([...listings, response.data]);
        setIsAddDialogOpen(false);
        setNewListing({});
        setFormErrors({});
        setError(null);
      } else {
        throw new Error("Failed to create listing");
      }
    } catch (error: unknown) {
      console.error("Error adding listing:", error);
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
        setError(error.response.data.error as string);
      } else {
        setError(error instanceof Error ? error.message : "Failed to add listing");
      }
    }
  };

  const handleDialogClose = () => {
    setEditingListing(null);
    setFormErrors({});
  };

  const handleUpdate = async () => {
    if(!editingListing) return;
    try {
      // Validate form before submission
      if (!validateNewListing(editingListing)) {
        return;
      }

      // Set default values for optional fields
      const updateData = {
        ...editingListing,
        image: editingListing.image?.trim() || DEFAULT_IMAGE,
        facilities: editingListing.facilities?.trim() || "No facilities listed"
      };

      await updateListing(updateData)
      setListings(listings.map(l => (l._id === editingListing._id ? updateData : l)));
      setError(null);
      handleDialogClose();
    } catch (error: unknown) {
      console.error("Error updating listing:", error);
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
        setError(error.response.data.error as string);
      } else {
        setError(error instanceof Error ? error.message : "Failed to update listing");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center gap-4">
        <h1 className="sm:text-2xl md:text-3xl font-bold tracking-tight w-full text-center sm:text-left sm:w-auto">Listings</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto text-base">
              <Plus className="mr-2 h-5 w-5" />
              Add Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[70vw] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="sm:text-sm md:text-md">Add New Listing</DialogTitle>
              <DialogDescription className="sm:text-sm md:text-md">Fill in the details for your new listing:</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {inputFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className={dialogLabelClass}>
                    {field.placeholder}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.name === "description" ? (
                    <Textarea
                      name={field.name}
                      value={(newListing as Partial<Listing>)[field.name] || ""}
                      onChange={handleNewInputChange}
                      placeholder={field.placeholder}
                      className={`${formErrors[field.name] ? "border-red-500" : ""} ${dialogDescription}`}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      name={field.name}
                      value={(newListing as Partial<Listing>)[field.name] || ""}
                      onChange={handleNewInputChange}
                      placeholder={field.placeholder}
                      className={`${formErrors[field.name] ? "border-red-500" : ""} ${dialogInputClass}`}
                    />
                  )}
                  {formErrors[field.name] && (
                    <p className="text-sm text-red-500">{formErrors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" className="text-sm" onClick={() => {
                setIsAddDialogOpen(false);
                setNewListing({});
                setFormErrors({});
              }}>Cancel</Button>
              <Button className="text-sm" onClick={handleAddListing}>Add Listing</Button>
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
            <h3 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold">No listings found</h3>
            <p className="mt-2 text-lg sm:text-xl md:text-2xl text-muted-foreground">Get started by creating a new listing.</p>
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
                <h3 className="sm:text-sm md:text-lg font-semibold line-clamp-1">{listing.title}</h3>
                <p className="sm:text-sm md:text-lg text-muted-foreground line-clamp-2">{listing.description}</p>
                <div className="flex items-center text-md sm:text-xl md:text-2xl text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1 sm:text-sm md:text-md">{listing.address}, {listing.city}</span>
                </div>
                <div className="flex items-center sm:text-sm md:text-md text-muted-foreground">
                  <Tag className="h-5 w-5 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">{listing.facilities}</span>
                </div>
                <div className="flex items-center text-base text-muted-foreground">
                  <User className="h-5 w-5 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1 sm:text-sm md:text-md">{listing.contactName}</span>
                </div>
                <p className="sm:text-md md:text-lg font-bold text-primary">${listing.price.toFixed(2)}</p>
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
                  <DialogContent className="sm:max-w-[70vw] max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="pb-2">
                      <DialogTitle className="sm:text-md md:text-lg font-semibold">Edit Listing</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-3">
                      {inputFields.map((field) => (
                        <div key={field.name} className="space-y-1.5">
                          <label className={dialogLabelClass}>
                            {field.placeholder}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.name === "description" ? (
                            <Textarea
                              name={field.name}
                              value={(editingListing as Partial<Listing>)?.[field.name] || ""}
                              onChange={handleInputChange}
                              placeholder={field.placeholder}
                              className={`${formErrors[field.name] ? "border-red-500" : ""} ${dialogDescription}`}
                            />
                          ) : (
                            <Input
                              type={field.type}
                              name={field.name}
                              value={(editingListing as Partial<Listing>)?.[field.name] || ""}
                              onChange={handleInputChange}
                              placeholder={field.placeholder}
                              className={`${formErrors[field.name] ? "border-red-500" : ""} ${dialogInputClass}`}
                            />
                          )}
                          {formErrors[field.name] && (
                            <p className="text-sm text-red-500">{formErrors[field.name]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                      <Button variant="outline" className="sm:text-sm md:text-md px-3 sm:px-4 w-full sm:w-auto" onClick={handleUpdate}>Save</Button>
                      <DialogClose asChild>
                        <Button variant="secondary" className="sm:text-sm md:text-md px-3 sm:px-4 w-full sm:w-auto" onClick={handleDialogClose}>Cancel</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(listing._id)}
                  className="text-sm"
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
        <span className="self-center sm:text-sm md:text-md">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
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