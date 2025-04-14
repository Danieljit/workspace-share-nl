"use client"

import { useState, useEffect, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle, Bold, Italic, List, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import { ImageUpload } from "@/components/ui/image-upload"

type WorkspacePhotosStepProps = {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

const MAX_PHOTOS = 5;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;

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
  // Initialize state safely with default values
  const [title, setTitle] = useState(formData?.title || "");
  const [photos, setPhotos] = useState<string[]>(formData?.photos || []);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure({
        limit: MAX_DESCRIPTION_LENGTH,
      }),
    ],
    content: formData?.description || "",
    onUpdate: ({ editor }) => {
      if (editor) {
        updateFormData("description", editor.getHTML());
      }
    },
  });
  
  // Memoize the update functions to prevent unnecessary re-renders
  const updateTitle = useCallback((value: string) => {
    setTitle(value);
    updateFormData("title", value);
  }, [updateFormData]);
  
  const updatePhotos = useCallback((urls: string[]) => {
    setPhotos(urls);
    updateFormData("photos", urls);
  }, [updateFormData]);
  
  // Update editor content if formData changes externally
  useEffect(() => {
    if (editor && formData?.description && editor.getHTML() !== formData.description) {
      editor.commands.setContent(formData.description);
    }
  }, [editor, formData?.description]);
  
  // Get character count safely
  const getCharacterCount = () => {
    try {
      return editor?.storage?.characterCount?.characters?.() || 0;
    } catch (error) {
      console.error("Error getting character count:", error);
      return 0;
    }
  };
  
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
            onChange={(e) => updateTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
            placeholder="Give your workspace a catchy title"
            className="mb-1"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-2 flex justify-between">
            <span>Workspace Description</span>
            <span className="text-muted-foreground text-xs">
              {getCharacterCount()}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </Label>
          <MenuBar editor={editor} />
          <div className="border rounded-md p-3 min-h-[200px] focus-within:ring-1 focus-within:ring-ring">
            <EditorContent editor={editor} className="prose prose-sm max-w-none" />
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-2 block">Workspace Photos ({photos.length || 0}/{MAX_PHOTOS})</Label>
          
          <div className="space-y-4">
            <ImageUpload
              value={photos}
              onChange={updatePhotos}
              maxImages={MAX_PHOTOS}
            />
            
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
