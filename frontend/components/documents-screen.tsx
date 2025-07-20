"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, FileText, ImageIcon, CheckCircle, Clock, MessageCircle, Trash2, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { apiClient, type Document, type DocumentContent } from "@/lib/api"
import { useTranslations } from "@/components/language-switcher"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UIDocument extends Document {
  status: "processing" | "completed" | "error"
  type: "pdf" | "image" | "text"
}

export function DocumentsScreen() {
  const [documents, setDocuments] = useState<UIDocument[]>([])
  const [selectedDocument, setSelectedDocument] = useState<UIDocument | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<UIDocument | null>(null)
  const [contentToDelete, setContentToDelete] = useState<DocumentContent | null>(null)
  const { toast } = useToast()
  const { t } = useTranslations()
  const hasLoadedRef = useRef<boolean>(false)

  // Load documents on component mount - prevent duplicate calls
  const loadDocuments = useCallback(async () => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    try {
      setIsLoading(true)
      const response = await apiClient.getDocuments(1, 50)

      const uiDocuments: UIDocument[] = response.data.documents.map((doc) => ({
        ...doc,
        status: "completed" as const,
        type: getFileType(doc.document_extension),
      }))

      setDocuments(uiDocuments)
      if (uiDocuments.length > 0 && !selectedDocument) {
        setSelectedDocument(uiDocuments[0])
      }
    } catch (error) {
      console.error("Failed to load documents:", error)
      toast({
        title: t("uploadError"),
        description: "Failed to load documents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [t, toast, selectedDocument])

  useEffect(() => {
    loadDocuments()
  }, [])

  const getFileType = (extension: string): "pdf" | "image" | "text" => {
    const ext = extension.toLowerCase()
    if (ext === ".pdf") return "pdf"
    if ([".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(ext)) return "image"
    return "text"
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || isUploading) return

    // Filter out PDF files
    const allowedFiles = Array.from(files).filter((file) => {
      const extension = file.name.toLowerCase()
      if (extension.endsWith(".pdf")) {
        toast({
          title: "File not supported",
          description: `PDF files are not allowed. ${file.name} was skipped.`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    if (allowedFiles.length === 0) {
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = allowedFiles.map(async (file) => {
        try {
          const response = await apiClient.upload(file, "000")

          toast({
            title: t("uploadSuccessful"),
            description: response.message || `${file.name} ${t("uploadSuccessfulDescription")}`,
          })

          return response
        } catch (error) {
          console.error("Upload failed:", error)
          toast({
            title: t("uploadFailed"),
            description: `${t("uploadFailedDescription")} ${file.name}`,
            variant: "destructive",
          })
          throw error
        }
      })

      await Promise.all(uploadPromises)

      // Reset the ref to allow reloading
      hasLoadedRef.current = false
      // Reload documents after successful upload
      await loadDocuments()
    } catch (error) {
      console.error("Upload process failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = async (document: UIDocument) => {
    try {
      const response = await apiClient.deleteDocument(document.document_id)

      // Remove from local state
      setDocuments((prev) => prev.filter((doc) => doc.document_id !== document.document_id))

      // Clear selection if deleted document was selected
      if (selectedDocument?.document_id === document.document_id) {
        const remainingDocs = documents.filter((doc) => doc.document_id !== document.document_id)
        setSelectedDocument(remainingDocs.length > 0 ? remainingDocs[0] : null)
      }

      toast({
        title: "Document deleted",
        description: response.message || `${document.document_name} has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Failed to delete document:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteContent = async (contentItem: DocumentContent) => {
    try {
      const response = await apiClient.deleteContent(contentItem.content_id)

      // Remove content from selected document
      if (selectedDocument) {
        const updatedDocument = {
          ...selectedDocument,
          extracted_content: selectedDocument.extracted_content.filter(
            (content) => content.content_id !== contentItem.content_id,
          ),
        }
        setSelectedDocument(updatedDocument)

        // Update in documents list
        setDocuments((prev) =>
          prev.map((doc) => (doc.document_id === selectedDocument.document_id ? updatedDocument : doc)),
        )
      }

      toast({
        title: "Content deleted",
        description: response.message || "Content has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete content:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete content. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const getTypeIcon = (type: UIDocument["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />
      case "image":
        return <ImageIcon className="w-4 h-4 text-blue-500" />
      case "text":
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Clock className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-slate-600">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50">
      {/* Left Panel - Document List */}
      <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-semibold text-slate-900 mb-4">{t("documentsTitle")}</h1>

          {/* Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 lg:p-6 text-center transition-colors",
              isDragging
                ? "border-blue-400 bg-blue-50"
                : isUploading
                  ? "border-blue-300 bg-blue-25"
                  : "border-slate-300 hover:border-slate-400",
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload
              className={cn("w-8 h-8 mx-auto mb-2", isUploading ? "text-blue-500 animate-pulse" : "text-slate-400")}
            />
            <p className="text-sm text-slate-600 mb-2">
              {isUploading ? t("uploadingFiles") : t("dragDropFiles")}
              {!isUploading && (
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                  {t("browse")}
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    accept=".jpg,.jpeg,.png,.txt"
                    disabled={isUploading}
                  />
                </label>
              )}
            </p>
            <p className="text-xs text-slate-500">{t("supportedFiles")}</p>
          </div>
        </div>

        {/* Document List */}
        <ScrollArea className="flex-1 max-h-96 lg:max-h-none">
          <div className="p-4 space-y-2">
            {documents.map((doc) => (
              <Card
                key={doc.document_id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-slate-50",
                  selectedDocument?.document_id === doc.document_id && "ring-2 ring-blue-500 bg-blue-50",
                )}
                onClick={() => {
                  // Only update if it's a different document
                  if (selectedDocument?.document_id !== doc.document_id) {
                    setSelectedDocument(doc)
                  }
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getTypeIcon(doc.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-slate-900 truncate">{doc.document_name}</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setDocumentToDelete(doc)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Document
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <Badge variant="default" className="text-xs">
                          {t("completed")}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {documents.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No documents uploaded</p>
                <p className="text-sm text-slate-500 mt-1">Upload your first document to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Document Preview */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedDocument ? (
          <>
            <div className="p-4 lg:p-6 border-b border-slate-200 bg-white">
              <h2 className="text-xl lg:text-2xl font-semibold text-slate-900">{selectedDocument.document_name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-slate-600 capitalize">{t("completed")}</span>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-slate-900 mb-4">{t("extractedContent")}</h3>
                {selectedDocument.extracted_content.map((contentItem) => (
                  <Card key={contentItem.content_id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-sm text-slate-700 leading-relaxed flex-1">{contentItem.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setContentToDelete(contentItem)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {t("useInChat")}
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {selectedDocument.extracted_content.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">{t("noContentAvailable")}</p>
                    <p className="text-sm text-slate-500 mt-1">{t("noContentDescription")}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">{t("selectDocument")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{documentToDelete ? "Delete Document" : "Delete Content"}</AlertDialogTitle>
            <AlertDialogDescription>
              {documentToDelete
                ? `Are you sure you want to delete "${documentToDelete.document_name}"? This action cannot be undone.`
                : "Are you sure you want to delete this content? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDocumentToDelete(null)
                setContentToDelete(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (documentToDelete) {
                  handleDeleteDocument(documentToDelete)
                  setDocumentToDelete(null)
                } else if (contentToDelete) {
                  handleDeleteContent(contentToDelete)
                  setContentToDelete(null)
                }
                setDeleteDialogOpen(false)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
