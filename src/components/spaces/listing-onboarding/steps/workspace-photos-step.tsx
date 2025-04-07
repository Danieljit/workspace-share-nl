"use client"

import { useState, useEffect, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDropzone } from "react-dropzone"
import { Image, X, Upload, GripVertical, AlertCircle, Bold, Italic, List, Link } from "lucide-react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type WorkspacePhotosStepProps = {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

type PhotoFile = {
  id: string;
  file: File;
  preview: string;
}

const MAX_PHOTOS = 5;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;

const SortablePhoto = ({ photo, onRemove }: { photo: PhotoFile; onRemove: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: photo.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group bg-background border rounded-md overflow-hidden"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 left-2 p-1 bg-black/50 rounded-md cursor-grab z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>
      
      <button
        type="button"
        onClick={() => onRemove(photo.id)}
        className="absolute top-2 right-2 p-1 bg-black/50 rounded-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4 text-white" />
      </button>
      
      <img 
        src={photo.preview} 
        alt="Workspace preview" 
        className="h-32 w-full object-cover"
      />
    </div>
  );
};

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="flex items-center space-x-1 border rounded-md p-1 mb-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-muted' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-muted' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-muted' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt('URL')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        className={editor.isActive('link') ? 'bg-muted' : ''}
      >
        <Link className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function WorkspacePhotosStep({ formData, updateFormData }: WorkspacePhotosStepProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>(formData.photos || []);
  const [title, setTitle] = useState(formData.title || "");
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure({
        limit: MAX_DESCRIPTION_LENGTH,
      }),
    ],
    content: formData.description || "",
    onUpdate: ({ editor }) => {
      updateFormData("description", editor.getHTML());
    },
  });
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  useEffect(() => {
    updateFormData("photos", photos);
  }, [photos]); 
  
  useEffect(() => {
    updateFormData("title", title);
  }, [title]); 
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (photos.length >= MAX_PHOTOS) return;
    
    const newPhotos = acceptedFiles.slice(0, MAX_PHOTOS - photos.length).map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
  }, [photos]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });
  
  const removePhoto = (id: string) => {
    setPhotos(prevPhotos => {
      const updatedPhotos = prevPhotos.filter(photo => photo.id !== id);
      return updatedPhotos;
    });
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
    };
  }, []);
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Show Us Your Space</h2>
        <p className="text-muted-foreground">Upload photos and add details about your workspace</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="title" className="text-sm font-medium mb-2 flex justify-between">
            <span>Workspace Title</span>
            <span className="text-muted-foreground text-xs">{title.length}/{MAX_TITLE_LENGTH}</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
            placeholder="Give your workspace a catchy title"
            className="mb-1"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-2 flex justify-between">
            <span>Workspace Description</span>
            <span className="text-muted-foreground text-xs">
              {editor?.storage.characterCount.characters()}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </Label>
          <MenuBar editor={editor} />
          <div className="border rounded-md p-3 min-h-[200px] focus-within:ring-1 focus-within:ring-ring">
            <EditorContent editor={editor} className="prose prose-sm max-w-none" />
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-2 block">Workspace Photos ({photos.length}/{MAX_PHOTOS})</Label>
          
          <div className="space-y-4">
            {photos.length > 0 && (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {photos.map((photo) => (
                      <SortablePhoto 
                        key={photo.id} 
                        photo={photo} 
                        onRemove={removePhoto} 
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            
            {photos.length < MAX_PHOTOS && (
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  {isDragActive ? (
                    <p>Drop the files here...</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Drag & drop photos here, or click to select</p>
                      <p className="text-xs text-muted-foreground">Upload up to {MAX_PHOTOS - photos.length} more photos (max 5MB each)</p>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {photos.length === 0 && (
              <div className="flex items-center p-4 border rounded-md bg-muted/50">
                <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
                <p className="text-sm text-muted-foreground">Add at least one photo of your workspace to continue</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
