import { Download, Trash2, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  useActivityAttachments,
  useDeleteAttachment,
  useDownloadAttachment,
} from '../hooks/useActivityAttachments'

interface AttachmentsListProps {
  activityId: string
}

export function AttachmentsList({ activityId }: AttachmentsListProps) {
  const { data: attachments, isLoading } = useActivityAttachments(activityId)
  const deleteAttachment = useDeleteAttachment()
  const downloadAttachment = useDownloadAttachment()

  const handleDelete = async (id: string, filePath: string) => {
    if (confirm('¿Eliminar este archivo?')) {
      await deleteAttachment.mutateAsync({ id, filePath, activityId })
    }
  }

  const handleDownload = (filePath: string, fileName: string) => {
    downloadAttachment.mutate({ filePath, fileName })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando archivos...</div>
  }

  if (!attachments || attachments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Paperclip className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No hay archivos adjuntos</p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <Card key={attachment.id} className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{attachment.file_name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.file_size)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDownload(attachment.file_path, attachment.file_name)}
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(attachment.id, attachment.file_path)}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
