"use client"

import { ChangeEvent, useEffect, useState, useRef } from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Pencil, Trash2, User } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface BlogType {
  _id: string
  title: string
  description: string
  author: string
  createdAt?: string
}

type InputField = {
  name: keyof Pick<BlogType, 'title' | 'description'>;
  type: string;
  placeholder: string;
  required?: boolean;
}

const inputFields: InputField[] = [
  { name: "title", type: "text", placeholder: "Title", required: true },
  { name: "description", type: "textarea", placeholder: "Description", required: true },
]

const dialogInputClass = "min-h-[50px] sm:text-sm md:text-md";
const dialogLabelClass = "sm:text-sm md:text-md font-medium";
const dialogDescription = "min-h-[70px] sm:text-sm md:text-md";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingBlog, setEditingBlog] = useState<BlogType | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBlog, setNewBlog] = useState<Partial<Pick<BlogType, 'title' | 'description'>>>({});
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Pick<BlogType, 'title' | 'description'>, string>>>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);
  const addDescRef = useRef<HTMLTextAreaElement>(null) as React.RefObject<HTMLTextAreaElement>;
  const editDescRef = useRef<HTMLTextAreaElement>(null) as React.RefObject<HTMLTextAreaElement>;

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/blogs?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setBlogs(data.blogs || [])
        setTotal(data.total || (data.blogs ? data.blogs.length : 0))
        setError(null)
      })
      .catch(err => {
        console.error("Error fetching blogs:", err);
        setError("Failed to fetch blogs")
        console.log(err)
      })
      .finally(() => setIsLoading(false))
  }, [page, limit])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/blogs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete blog");
      }
      setBlogs(blogs.filter(blog => blog._id !== id));
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete blog");
    }
  };

  const handleEdit = (blog: BlogType) => {
    setEditingBlog({ ...blog });
    setFormErrors({});
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!editingBlog) return;
    setEditingBlog(prev => prev ? { ...prev, [name]: value } : null);
    
    // Clear error when user starts typing
    if (formErrors[name as keyof Pick<BlogType, 'title' | 'description'>]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNewInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewBlog(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name as keyof Pick<BlogType, 'title' | 'description'>]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddBlog = async () => {
    try {
      const requiredFields = ['title', 'description'];
      const missingFields = requiredFields.filter(field => !newBlog[field as keyof typeof newBlog]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlog)
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create blog");
      }
      const data = await res.json();
      setBlogs([...blogs, data.blog]);
      setIsAddDialogOpen(false);
      setNewBlog({});
      setFormErrors({});
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add blog");
    }
  };


  const handleUpdate = async () => {
    if (!editingBlog) return;
    try {
      if (!validateForm(editingBlog)) {
        return;
      }
      const res = await fetch('/api/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingBlog._id, title: editingBlog.title, description: editingBlog.description })
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update blog");
      }
      setBlogs(blogs.map(b => (b._id === editingBlog._id ? editingBlog : b)));
      setError(null);
      setFormErrors({});
      setEditingBlog(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update blog");
    }
  };

  const validateForm = (blog: Pick<BlogType, 'title' | 'description'>): boolean => {
    const errors: Partial<Record<keyof Pick<BlogType, 'title' | 'description'>, string>> = {};
    for (const field of inputFields) {
      if (field.required && !blog[field.name]) {
        errors[field.name] = `Please fill in the ${field.name}`;
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper to apply markdown formatting
  function applyMarkdown(ref: React.RefObject<HTMLTextAreaElement>, value: string, setValue: (v: string) => void, syntax: 'bold' | 'italic' | 'underline') {
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const before = value.slice(0, start);
    const after = value.slice(end);
    let md = '';
    if (syntax === 'bold') md = `**${selected || 'bold text'}**`;
    if (syntax === 'italic') md = `*${selected || 'italic text'}*`;
    const newValue = before + md + after;
    setValue(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + (syntax === 'bold' ? 2 : 1);
    }, 0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center gap-4">
        <h1 className="sm:text-2xl md:text-3xl font-bold tracking-tight w-full text-center sm:text-left sm:w-auto">Blogs</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto text-base">
              <Plus className="mr-2 h-5 w-5" />
              Add Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[70vw] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="sm:text-sm md:text-md">Add New Blog</DialogTitle>
              <DialogDescription className="sm:text-sm md:text-md">Fill in the details for your new blog:</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {inputFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className={dialogLabelClass}>
                    {field.placeholder}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.name === "description" ? (
                    <>
                      <div className="flex gap-2 mb-1">
                        <Button type="button" size="sm" variant="outline" onClick={() => applyMarkdown(addDescRef, newBlog.description || '', v => setNewBlog(prev => ({ ...prev, description: v })), 'bold')}>B</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => applyMarkdown(addDescRef, newBlog.description || '', v => setNewBlog(prev => ({ ...prev, description: v })), 'italic')}>I</Button>
                      </div>
                      <Textarea
                        ref={addDescRef}
                        name={field.name}
                        value={(newBlog as Partial<Pick<BlogType, 'title' | 'description'>>)[field.name] || ""}
                        onChange={handleNewInputChange}
                        placeholder={field.placeholder}
                        className={`${formErrors[field.name] ? "border-red-500" : ""} ${dialogDescription}`}
                        style={{ minHeight: 100, maxHeight: 300, resize: 'vertical', overflow: 'auto' }}
                      />
                    </>
                  ) : (
                    <Input
                      type={field.type}
                      name={field.name}
                      value={(newBlog as Partial<Pick<BlogType, 'title' | 'description'>>)[field.name] || ""}
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
                setNewBlog({});
                setFormErrors({});
              }}>Cancel</Button>
              <Button className="text-sm" onClick={handleAddBlog}>Add Blog</Button>
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
                <div className="h-[200px] bg-muted rounded-t-lg" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-6 w-3/4 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full bg-muted rounded" />
              </CardFooter>
            </Card>
          ))
        ) : blogs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold">No blogs found</h3>
            <p className="mt-2 text-lg sm:text-xl md:text-2xl text-muted-foreground">Get started by creating a new blog.</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <Card key={blog._id} className="w-full">
              <CardHeader className="p-4 pb-0">
                <h3 className="sm:text-sm md:text-lg font-semibold line-clamp-1">{blog.title}</h3>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <p className="sm:text-sm md:text-lg text-muted-foreground line-clamp-2">{blog.description}</p>
                <div className="flex items-center text-base text-muted-foreground">
                  <User className="h-5 w-5 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1 sm:text-sm md:text-md">{blog.author}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {blog.createdAt && <>Created: {new Date(blog.createdAt).toLocaleString()}</>}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Dialog open={!!editingBlog} onOpenChange={open => { if (!open) setEditingBlog(null); }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(blog)}
                      className="text-base"
                    >
                      <Pencil className="h-5 w-5 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[70vw] max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="pb-2">
                      <DialogTitle className="sm:text-md md:text-lg font-semibold">Edit Blog</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-3">
                      {inputFields.map((field) => (
                        <div key={field.name} className="space-y-1.5">
                          <label className={dialogLabelClass}>
                            {field.placeholder}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.name === "description" ? (
                            <>
                              <div className="flex gap-2 mb-1">
                                <Button type="button" size="sm" variant="outline" onClick={() => applyMarkdown(editDescRef, editingBlog?.description || '', v => setEditingBlog(prev => prev ? { ...prev, description: v } : null), 'bold')}>B</Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => applyMarkdown(editDescRef, editingBlog?.description || '', v => setEditingBlog(prev => prev ? { ...prev, description: v } : null), 'italic')}>I</Button>
                              </div>
                              <Textarea
                                ref={editDescRef}
                                name={field.name}
                                value={(editingBlog as Partial<BlogType>)?.[field.name] || ""}
                                onChange={handleInputChange}
                                placeholder={field.placeholder}
                                className={`${formErrors[field.name] ? "border-red-500" : ""} ${dialogDescription}`}
                                style={{ minHeight: 100, maxHeight: 300, resize: 'vertical', overflow: 'auto' }}
                              />
                            </>
                          ) : (
                            <Input
                              type={field.type}
                              name={field.name}
                              value={(editingBlog as Partial<BlogType>)?.[field.name] || ""}
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
                        <Button variant="secondary" className="sm:text-sm md:text-md px-3 sm:px-4 w-full sm:w-auto" onClick={() => {
                          setEditingBlog(null);
                          setFormErrors({});
                        }}>Cancel</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(blog._id)}
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