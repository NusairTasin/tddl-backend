"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert } from "@/components/ui/alert"

// Contact type for state
interface ContactType {
  _id: string
  name: string
  email: string
  phone: string
}

export default function Contact() {
  const [contact, setContact] = useState<ContactType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "" })
  const [submitting, setSubmitting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "" })
  const [addError, setAddError] = useState("")
  const [addSubmitting, setAddSubmitting] = useState(false)

  useEffect(() => {
    fetchContact()
  }, [])

  async function fetchContact() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/contact")
      const data = await res.json()
      if (res.ok && data.contacts && data.contacts.length > 0) {
        setContact(data.contacts[0])
      } else {
        setContact(null)
      }
    } catch (e) {
      setError("Failed to load contact.")
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  function handleEditOpen() {
    if (contact) {
      setForm({ name: contact.name, email: contact.email, phone: contact.phone })
      setShowEdit(true)
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!contact) return
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contact._id, ...form })
      })
      if (!res.ok) throw new Error("Failed to update contact.")
      await fetchContact()
      setShowEdit(false)
    } catch (e) {
      setError("Failed to update contact.")
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!contact) return
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/contact", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contact._id })
      })
      if (!res.ok) throw new Error("Failed to delete contact.")
      setContact(null)
      setShowDelete(false)
    } catch (e) {
      setError("Failed to delete contact.")
      console.log(e)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddSubmitting(true)
    setAddError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to add contact.")
      }
      await fetchContact()
      setAddForm({ name: "", email: "", phone: "" })
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An error occured";
      setAddError(errorMessage)
    } finally {
      setAddSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-8">
      <div className="w-full max-w-md">
        {loading ? (
          <Card className="mb-4"><CardContent>Loading...</CardContent></Card>
        ) : contact ? (
          <Card>
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2"><b>Name:</b> {contact?.name}</div>
              <div className="mb-2"><b>Email:</b> {contact?.email}</div>
              <div className="mb-2"><b>Phone:</b> {contact?.phone}</div>
              {error && <Alert variant="destructive" className="mt-2">{error}</Alert>}
            </CardContent>
            <CardFooter className="gap-2">
              <Dialog open={showEdit} onOpenChange={setShowEdit}>
                <DialogTrigger asChild>
                  <Button onClick={handleEditOpen} variant="outline">Edit</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Contact</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <Input
                      placeholder="Name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                    />
                    <Input
                      placeholder="Phone"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      required
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogTrigger asChild>
                  <Button variant="destructive" onClick={() => setShowDelete(true)}>Delete</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Contact</DialogTitle>
                  </DialogHeader>
                  <div>Are you sure you want to delete this contact?</div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={submitting}>{submitting ? "Deleting..." : "Delete"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Add Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <Input
                  placeholder="Name"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={addForm.email}
                  onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Phone"
                  value={addForm.phone}
                  onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
                  required
                />
                {addError && <Alert variant="destructive">{addError}</Alert>}
                <Button type="submit" disabled={addSubmitting}>{addSubmitting ? "Adding..." : "Add Contact"}</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}