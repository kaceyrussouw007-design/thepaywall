'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

const baseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  priceUSD: z.number({ invalid_type_error: 'Enter a valid price' }).min(0.5, 'Minimum price is $0.50'),
  linkUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})

type FormData = z.infer<typeof baseSchema>

interface BundleLink {
  url: string
  label: string
}

type ItemType = 'LINK' | 'BUNDLE' | 'FILE'

export function CreateItemForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [itemType, setItemType] = useState<ItemType>('LINK')
  const [bundleLinks, setBundleLinks] = useState<BundleLink[]>([
    { url: '', label: '' },
    { url: '', label: '' },
  ])
  const [fileUpload, setFileUpload] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(baseSchema),
    defaultValues: { priceUSD: 5 },
  })

  function addBundleLink() {
    setBundleLinks((prev) => [...prev, { url: '', label: '' }])
  }

  function removeBundleLink(index: number) {
    setBundleLinks((prev) => prev.filter((_, i) => i !== index))
  }

  function updateBundleLink(index: number, field: keyof BundleLink, value: string) {
    setBundleLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)))
  }

  async function onSubmit(data: FormData) {
    let fileUrl: string | undefined

    if (itemType === 'LINK' && !data.linkUrl) {
      toast({ title: 'Enter a URL to lock', variant: 'destructive' })
      return
    }

    if (itemType === 'BUNDLE') {
      const valid = bundleLinks.filter((l) => l.url && l.label)
      if (valid.length < 2) {
        toast({ title: 'Add at least 2 links to the bundle', variant: 'destructive' })
        return
      }
    }

    if (itemType === 'FILE') {
      if (!fileUpload) {
        toast({ title: 'Select a file to upload', variant: 'destructive' })
        return
      }

      setUploading(true)
      const formData = new FormData()
      formData.append('file', fileUpload)

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        toast({ title: err.error || 'Upload failed', variant: 'destructive' })
        setUploading(false)
        return
      }
      const { url } = await uploadRes.json()
      fileUrl = url
      setUploading(false)
    }

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: itemType,
        title: data.title,
        description: data.description,
        priceUSD: data.priceUSD,
        linkUrl: itemType === 'LINK' ? data.linkUrl : undefined,
        fileUrl,
        bundleLinks: itemType === 'BUNDLE' ? bundleLinks.filter((l) => l.url && l.label) : undefined,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      toast({ title: err.error || 'Failed to create item', variant: 'destructive' })
      return
    }

    toast({ title: 'Paywall created!', description: 'Share your link to start earning.' })
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="e.g. My Trading Strategy Guide" {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
        <Textarea
          id="description"
          placeholder="What will buyers get access to?"
          rows={3}
          {...register('description')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="priceUSD">Price (USD)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="priceUSD"
            type="number"
            step="0.01"
            min="0.50"
            className="pl-7"
            {...register('priceUSD', { valueAsNumber: true })}
          />
        </div>
        {errors.priceUSD && <p className="text-xs text-destructive">{errors.priceUSD.message}</p>}
        <p className="text-xs text-muted-foreground">Displayed as crypto equivalent at checkout</p>
      </div>

      <div className="space-y-3">
        <Label>Content type</Label>
        <Tabs value={itemType} onValueChange={(v) => setItemType(v as ItemType)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="LINK">Single link</TabsTrigger>
            <TabsTrigger value="BUNDLE">Bundle</TabsTrigger>
            <TabsTrigger value="FILE">File</TabsTrigger>
          </TabsList>

          <TabsContent value="LINK" className="mt-4">
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="linkUrl">URL to lock</Label>
                  <Input
                    id="linkUrl"
                    type="url"
                    placeholder="https://..."
                    {...register('linkUrl')}
                  />
                  <p className="text-xs text-muted-foreground">Only buyers who pay will see this link</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="BUNDLE" className="mt-4">
            <Card>
              <CardContent className="pt-4 space-y-3">
                {bundleLinks.map((link, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Label (e.g. Chapter 1)"
                        value={link.label}
                        onChange={(e) => updateBundleLink(i, 'label', e.target.value)}
                      />
                      <Input
                        placeholder="https://..."
                        type="url"
                        value={link.url}
                        onChange={(e) => updateBundleLink(i, 'url', e.target.value)}
                      />
                    </div>
                    {bundleLinks.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-1 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeBundleLink(i)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 mt-2"
                  onClick={addBundleLink}
                >
                  <Plus className="w-4 h-4" />
                  Add link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="FILE" className="mt-4">
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-1.5">
                  <Label>File to sell</Label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-violet-600/50 hover:bg-violet-600/5 transition-colors">
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Upload className="w-6 h-6" />
                      {fileUpload ? (
                        <span className="text-sm text-foreground font-medium">{fileUpload.name}</span>
                      ) : (
                        <>
                          <span className="text-sm">Click to upload</span>
                          <span className="text-xs">PDF, ZIP, video, or any file (max 50MB)</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => setFileUpload(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Button
        type="submit"
        variant="violet"
        size="lg"
        className="w-full"
        disabled={isSubmitting || uploading}
      >
        {(isSubmitting || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
        {uploading ? 'Uploading file...' : 'Create paywall'}
      </Button>
    </form>
  )
}
