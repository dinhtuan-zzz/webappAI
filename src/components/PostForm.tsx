import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiCategorySelect } from "@/components/ui/MultiCategorySelect";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import imageCompression from 'browser-image-compression';
import CommentEditor from './CommentEditor';
import Image from 'next/image';
import type { PostFormValues } from "@/types/Post";
import type { SelectOption } from '@/types';
import type { CroppedAreaPixels } from "@/types/Image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "PENDING", label: "Pending" },
];

interface PostFormProps {
  initial: PostFormValues;
  categories: SelectOption[];
  loading: boolean;
  error?: string;
  onSubmit: (data: { title: string; content: string; categoryIds: string[]; status: string; thumbnail?: string }) => void;
  onCancel: () => void;
  onCreateCategory?: (name: string) => void;
  fieldErrors?: Partial<Record<keyof PostFormValues, string>>;
  onImageUpload?: (file: File) => Promise<string>;
}

export function PostForm({ initial, categories, loading, error, onSubmit, onCancel, onCreateCategory, fieldErrors: externalFieldErrors, onImageUpload, canEdit = true }: PostFormProps & { canEdit?: boolean }) {
  const [title, setTitle] = useState(initial.title || "");
  const [content, setContent] = useState(initial.content || "");
  const [selectedCategories, setSelectedCategories] = useState<SelectOption[]>(
    (initial.categories || []).map((cat: any) => ({
      label: cat.name,
      value: cat.id,
      ...(cat.postCount && { postCount: cat.postCount }),
      ...(cat.archived && { archived: cat.archived }),
    }))
  );
  const [status, setStatus] = useState(initial.status || "DRAFT");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PostFormValues, string>>>({});
  const [dirty, setDirty] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [thumbnail, setThumbnail] = useState<string | undefined>(initial.thumbnail);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [lastCropImage, setLastCropImage] = useState<string | null>(null);
  const [lastCroppedAreaPixels, setLastCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [pendingUpload, setPendingUpload] = useState<null | { image: string; area: CroppedAreaPixels }>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Auto-focus title field on mount
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Keyboard shortcuts: Ctrl+S to save, Esc to cancel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (dirty && !loading) formRef.current?.requestSubmit();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dirty, loading]);

  // Unsaved changes warning
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  // Track dirty state
  useEffect(() => {
    setDirty(
      title !== initial.title ||
      content !== initial.content ||
      status !== initial.status ||
      thumbnail !== initial.thumbnail ||
      JSON.stringify(selectedCategories.map(c => c.value).sort()) !== JSON.stringify((initial.categories || []).map((cat: any) => cat.id).sort())
    );
  }, [title, content, status, selectedCategories, thumbnail, initial]);

  // Reset form to initial values
  useEffect(() => {
    setTitle(initial.title || "");
    setContent(initial.content || "");
    setSelectedCategories(
      (initial.categories || []).map((cat: any) => ({
        label: cat.name,
        value: cat.id,
        ...(cat.postCount && { postCount: cat.postCount }),
        ...(cat.archived && { archived: cat.archived }),
      }))
    );
    setStatus(initial.status || "DRAFT");
    setFieldErrors({});
  }, [resetCount, initial]);

  // Use external fieldErrors if provided
  useEffect(() => {
    if (externalFieldErrors) setFieldErrors(externalFieldErrors);
  }, [externalFieldErrors]);

  // Validation
  const validate = useCallback(() => {
    const errors: Partial<Record<keyof PostFormValues, string>> = {};
    if (!title.trim()) errors.title = "Title is required";
    if (!content.trim()) errors.content = "Content is required";
    if (!selectedCategories.length) errors.categories = "At least one category is required";
    if (!status) errors.status = "Status is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, content, selectedCategories, status]);

  // Handle image file select/validation
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLLabelElement>) => {
    let file: File | null = null;
    if ("dataTransfer" in e) {
      file = e.dataTransfer.files?.[0] || null;
    } else {
      file = e.target.files?.[0] || null;
    }
    if (!file) return;
    // Validate type
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setImageError("Only JPEG, PNG, or WebP images are allowed.");
      return;
    }
    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image must be less than 2MB.");
      return;
    }
    setImageError(null);
    // Show crop modal
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Crop complete handler
  const onCropComplete = (croppedArea: CroppedAreaPixels, croppedAreaPixels: CroppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    setLastCroppedAreaPixels(croppedAreaPixels);
  };

  // Get cropped image as blob
  async function getCroppedImg(imageSrc: string, crop: CroppedAreaPixels) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/jpeg");
    });
  }

  // Helper to create image
  function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (err) => reject(err));
      img.setAttribute("crossOrigin", "anonymous");
      img.src = url;
    });
  }

  // Handle crop confirm
  const handleCropConfirm = async () => {
    if (!cropImage || !croppedAreaPixels) return;
    // Save crop data for retry
    setLastCropImage(cropImage);
    setLastCroppedAreaPixels(croppedAreaPixels);
    setCropModalOpen(false);
    setCropImage(null);
    setPendingUpload({ image: cropImage, area: croppedAreaPixels });
    setUploading(true);
  };

  // Effect: when pendingUpload is set, start upload
  useEffect(() => {
    const doUpload = async () => {
      if (!pendingUpload) return;
      setImageError(null);
      try {
        const croppedBlob = await getCroppedImg(pendingUpload.image, pendingUpload.area);
        const croppedFile = new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" });
        // Compress the cropped file before upload
        const compressedFile = await imageCompression(croppedFile, {
          maxSizeMB: 0.5, // target max size in MB
          maxWidthOrHeight: 1280, // resize if needed
          useWebWorker: true,
        });
        if (onImageUpload) {
          const url = await onImageUpload(compressedFile);
          setThumbnail(url);
          setThumbnailFile(compressedFile);
        }
        setPendingUpload(null);
      } catch (err: any) {
        setImageError(err.message || "Failed to crop/upload image");
        // keep pendingUpload for retry
      } finally {
        setUploading(false);
      }
    };
    if (pendingUpload) doUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUpload]);

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleImageChange(e);
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title,
      content,
      categoryIds: selectedCategories.map(c => c.value),
      status,
      thumbnail,
    });
  };

  // Handle cancel
  const handleCancel = () => {
    if (dirty) {
      setShowConfirm(true);
    } else {
      setResetCount(c => c + 1);
      onCancel();
    }
  };

  const actuallyCancel = () => {
    setShowConfirm(false);
    setResetCount(c => c + 1);
    onCancel();
  };

  // Show toast after image upload
  useEffect(() => {
    if (thumbnail && thumbnail !== initial.thumbnail) {
      toast.success("Image uploaded successfully!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbnail]);

  // Show toast after save
  useEffect(() => {
    if (!loading && !dirty && thumbnail !== initial.thumbnail) {
      toast.success("Post saved!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, dirty]);

  // Auto-scroll to first error on validation failure
  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      const firstErrorKey = Object.keys(fieldErrors)[0];
      const el = document.getElementById(firstErrorKey);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        (el as HTMLElement).focus?.();
      }
    }
  }, [fieldErrors]);

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto bg-white rounded-lg shadow p-6" aria-label="Edit Post Form">
        <div>
          <label className="block font-semibold mb-1" htmlFor="title">Title</label>
          <Input ref={titleRef} id="title" value={title} onChange={e => setTitle(e.target.value)} aria-invalid={!!fieldErrors.title} aria-describedby="title-error" />
          {fieldErrors.title && <div id="title-error" className="text-red-500 text-sm mt-1">{fieldErrors.title}</div>}
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="content">Content</label>
          <CommentEditor
            value={content}
            onChange={setContent}
            placeholder="Write your post content..."
            readOnly={!canEdit || loading}
          />
          {fieldErrors.content && <div id="content-error" className="text-red-500 text-sm mt-1">{fieldErrors.content}</div>}
        </div>
        <div>
          <MultiCategorySelect
            value={selectedCategories}
            onChange={setSelectedCategories}
            options={categories}
            required
            error={fieldErrors.categories}
            onCreate={onCreateCategory}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Status</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="w-full justify-between">
                {STATUS_OPTIONS.find(s => s.value === status)?.label || "Select status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATUS_OPTIONS.map(opt => (
                <DropdownMenuItem key={opt.value} onSelect={() => setStatus(opt.value)}>
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {fieldErrors.status && <div className="text-red-500 text-sm mt-1">{fieldErrors.status}</div>}
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="thumbnail">Thumbnail/Cover Image</label>
          <label
            htmlFor="thumbnail"
            className={`block w-full h-32 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            tabIndex={0}
            aria-label="Upload thumbnail image"
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center text-blue-500">
                <svg className="animate-spin h-8 w-8 mb-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                <span>Uploading...</span>
              </div>
            ) : thumbnail ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={thumbnail}
                  alt="Thumbnail preview"
                  width={320}
                  height={180}
                  className="max-h-28 object-contain rounded"
                  style={{ width: "auto", height: "100%" }}
                  unoptimized
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 text-red-500 hover:bg-white"
                  onClick={e => { e.stopPropagation(); setThumbnail(undefined); setThumbnailFile(null); }}
                  aria-label="Remove image"
                >
                  ×
                </button>
                {thumbnail !== initial.thumbnail && initial.thumbnail && (
                  <button
                    type="button"
                    className="absolute bottom-2 right-2 bg-white/80 rounded-full p-1 text-blue-500 hover:bg-white border border-blue-200 text-xs px-2 py-1"
                    onClick={e => { e.stopPropagation(); setThumbnail(initial.thumbnail); setThumbnailFile(null); }}
                    aria-label="Revert to original image"
                  >
                    Revert
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <span className="text-2xl mb-1">📷</span>
                <span>Drag & drop or click to upload</span>
                <span className="text-xs mt-1">(JPEG, PNG, WebP, max 2MB, 16:9 crop)</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
              disabled={loading || uploading}
            />
          </label>
          {imageError && (
            <div className="text-red-500 text-xs mt-1 flex items-center gap-2">
              <span>{imageError}</span>
              {lastCropImage && lastCroppedAreaPixels && (
                <button
                  type="button"
                  className="underline text-blue-600 text-xs"
                  onClick={() => {
                    setCropImage(lastCropImage);
                    setCroppedAreaPixels(lastCroppedAreaPixels);
                    setCropModalOpen(true);
                    setImageError(null);
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
        {/* Crop modal */}
        {cropModalOpen && cropImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full flex flex-col items-center">
              <h2 className="font-semibold mb-2">Crop Image (16:9)</h2>
              <div className="relative w-full h-64 bg-gray-100">
                <Cropper
                  image={cropImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60" onClick={handleCropConfirm} disabled={uploading}>Crop & Upload</button>
                <button className="px-4 py-2 rounded bg-gray-200" onClick={() => { if (!uploading) { setCropModalOpen(false); setCropImage(null); }}} disabled={uploading}>Cancel</button>
              </div>
              {uploading && <div className="mt-2 text-blue-600 flex items-center gap-2"><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Uploading...</div>}
            </div>
          </div>
        )}
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading || uploading} aria-label="Cancel">
            Cancel
          </Button>
          {dirty && (
            <Button type="submit" disabled={loading || uploading} aria-label="Save">
              {(loading || uploading) ? <span className="inline-flex items-center gap-1"><span className="animate-spin h-4 w-4 border-2 border-t-transparent border-current rounded-full"></span>Saving...</span> : "Save"}
            </Button>
          )}
        </div>
      </form>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard your changes?</DialogTitle>
          </DialogHeader>
          <div className="py-2">You have unsaved changes. Are you sure you want to discard them?</div>
          <DialogFooter>
            <Button variant="destructive" onClick={actuallyCancel}>Discard</Button>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Continue Editing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 