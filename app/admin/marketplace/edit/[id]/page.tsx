'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Store,
  ArrowLeft,
  Save,
  Upload,
  RefreshCw,
  Star,
  X
} from 'lucide-react';
import { apiClient, MarketplaceItem, getMarketplaceItemImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function AdminMarketplaceEdit() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const itemId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    brand: '',
    stock: '',
    unitType: 'piece',
    unitLabel: 'per piece',
    unitSize: '',
    fulfillmentTier: 'small' as 'small' | 'medium' | 'large',
    tags: '',
    images: [] as string[],
    isActive: true,
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (itemId) {
      fetchItem();
    }
  }, [user, router, itemId]);

  const fetchItem = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMarketplaceItem(itemId);
      if (response.success && response.data) {
        const item = response.data;
        const existingImages = Array.isArray((item as any).images) && (item as any).images.length
          ? (item as any).images
          : [getMarketplaceItemImageUrl(item)].filter(Boolean) as string[];
        setFormData({
          name: item.name,
          description: item.description,
          category: item.category,
          sku: (item as any).sku || '',
          brand: (item as any).brand || '',
          stock: typeof (item as any).stock === 'number' ? String((item as any).stock) : '',
          unitType: (item as any).unitType || 'piece',
          unitLabel: (item as any).unitLabel || 'per piece',
          unitSize: typeof (item as any).unitSize === 'number' ? String((item as any).unitSize) : '',
          fulfillmentTier: ((item as any).fulfillmentTier as 'small' | 'medium' | 'large') || 'small',
          tags: Array.isArray((item as any).tags) ? (item as any).tags.join(', ') : '',
          images: existingImages,
          isActive: item.isActive,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load marketplace item',
        variant: 'destructive',
      });
      router.push('/admin/marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const addImageByUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const next = [...prev.images];
      const [removed] = next.splice(index, 1);
      next.unshift(removed);
      return { ...prev, images: next };
    });
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      setUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append('files', file);
      formDataUpload.append('category', 'marketplace');
      const res = await apiClient.uploadDocuments(formDataUpload);
      const data = (res as any)?.data ?? (res as any);
      const arr = Array.isArray(data) ? data : [];
      const first = arr[0];
      const url = first?.url ?? first?.fileUrl;
      if (url) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Could not upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);

      const stockNumber = formData.stock ? parseInt(formData.stock, 10) : 0;
      if (Number.isNaN(stockNumber) || stockNumber < 0) {
        toast({
          title: 'Error',
          description: 'Please provide a valid, non-negative stock quantity',
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      const itemData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        // Quote-first model: keep pricing as quote-managed.
        price: 0,
        currency: 'GHS',
        sku: formData.sku || undefined,
        brand: formData.brand || undefined,
        stock: stockNumber,
        unitType: formData.unitType || undefined,
        unitLabel: formData.unitLabel || undefined,
        unitSize: formData.unitSize ? parseFloat(formData.unitSize) : undefined,
        fulfillmentTier: formData.fulfillmentTier || undefined,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        images: formData.images.length ? formData.images : undefined,
        image: formData.images[0] || undefined,
        isActive: formData.isActive,
      };

      const response = await apiClient.updateMarketplaceItem(itemId, itemData);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Marketplace item updated successfully',
        });
        router.push('/admin/marketplace');
      } else {
        throw new Error(response.message || 'Failed to update item');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update marketplace item',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-700 mx-auto mb-4" />
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/marketplace">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Marketplace Item</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Update item information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>
                Update the information for this marketplace item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                  required
                  className="mt-2"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter item description"
                  required
                  rows={4}
                  className="mt-2"
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cement">Cement</SelectItem>
                    <SelectItem value="steel">Steel & Iron Rods</SelectItem>
                    <SelectItem value="blocks">Blocks & Bricks</SelectItem>
                    <SelectItem value="wood">Timber & Wood</SelectItem>
                    <SelectItem value="roofing">Roofing Materials</SelectItem>
                    <SelectItem value="finishing">Finishing Materials</SelectItem>
                    <SelectItem value="tools">Tools & Equipment</SelectItem>
                    <SelectItem value="other">Other Building Materials</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                Pricing is quote-based for this item. Update quote details from order management.
              </div>

              {/* SKU / Brand / Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sku">SKU (optional)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. IRON-16MM-12M"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand / Supplier (optional)</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Dangote"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="e.g. 100"
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              {/* Pricing unit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="unitType">Pricing unit</Label>
                  <Select
                    value={formData.unitType}
                    onValueChange={(value) => {
                      let defaultLabel = 'per unit';
                      if (value === 'piece') defaultLabel = 'per piece';
                      else if (value === 'bundle') defaultLabel = 'per bundle';
                      else if (value === 'bag') defaultLabel = 'per bag';
                      else if (value === 'sheet') defaultLabel = 'per sheet';
                      else if (value === 'm3') defaultLabel = 'per cubic meter';
                      else if (value === 'meter') defaultLabel = 'per meter';
                      setFormData((prev) => ({
                        ...prev,
                        unitType: value,
                        unitLabel: prev.unitLabel === '' || prev.unitLabel === 'per unit' || prev.unitLabel.startsWith('per ')
                          ? defaultLabel
                          : prev.unitLabel,
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="bundle">Bundle</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                      <SelectItem value="sheet">Sheet</SelectItem>
                      <SelectItem value="m3">Cubic meter</SelectItem>
                      <SelectItem value="meter">Meter (length)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unitLabel">Unit label</Label>
                  <Input
                    id="unitLabel"
                    value={formData.unitLabel}
                    onChange={(e) => setFormData({ ...formData, unitLabel: e.target.value })}
                    placeholder="e.g. per bundle of 10 planks"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="unitSize">Unit size (optional)</Label>
                  <Input
                    id="unitSize"
                    type="number"
                    min="0"
                    value={formData.unitSize}
                    onChange={(e) => setFormData({ ...formData, unitSize: e.target.value })}
                    placeholder="e.g. 10 (if one bundle = 10 pieces)"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Fulfillment tier */}
              <div>
                <Label htmlFor="fulfillmentTier">Fulfillment tier</Label>
                <Select
                  value={formData.fulfillmentTier}
                  onValueChange={(value: 'small' | 'medium' | 'large') => setFormData({ ...formData, fulfillmentTier: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small — Motor bike (e.g. nails, fittings)</SelectItem>
                    <SelectItem value="medium">Medium — Mini truck</SelectItem>
                    <SelectItem value="large">Large — Truck (e.g. iron rods, lumber)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Determines delivery vehicle at checkout.</p>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags (optional)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. iron rods, reinforcement, 16mm"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate tags with commas. Used for search and filtering.
                </p>
              </div>

              {/* Images (gallery) */}
              <div>
                <Label>Images</Label>
                <p className="text-xs text-gray-500 mt-1 mb-2">
                  Add more image URLs or upload files. First image is the primary. You can reorder by setting primary.
                </p>
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {formData.images.map((url, index) => (
                      <div key={`${url}-${index}`} className="relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-brand-blue-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                          {index > 0 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8"
                              onClick={() => setPrimaryImage(index)}
                              title="Set as primary"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => removeImage(index)}
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {index === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-brand-blue-950/75 text-primary-foreground text-xs text-center py-0.5">Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageByUrl())}
                    placeholder="Image URL"
                    className="w-48"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addImageByUrl}>
                    Add URL
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {uploadingImage ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Item is active (visible to real estate companies)</Label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <Link href="/admin/marketplace">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSaving} className="bg-blue-700 hover:bg-blue-800 text-white">
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
