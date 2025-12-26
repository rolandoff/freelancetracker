import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { STORAGE_BUCKETS, FILE_UPLOAD } from '@/lib/constants'
import type { ActivityAttachment, Database } from '@/types/database.types'

export const useActivityAttachments = (activityId: string | null) => {
  return useQuery({
    queryKey: ['attachments', activityId],
    queryFn: async () => {
      if (!activityId) return []

      const { data, error } = await supabase
        .from('activity_attachments')
        .select('*')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as ActivityAttachment[]
    },
    enabled: !!activityId,
  })
}

export const useUploadAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      activityId,
      file,
    }: {
      activityId: string
      file: File
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Validate file size
      if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
        throw new Error(`File size exceeds ${FILE_UPLOAD.MAX_SIZE_MB}MB limit`)
      }

      // Validate file type
      if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
        throw new Error('File type not allowed')
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${activityId}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.ACTIVITY_ATTACHMENTS)
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Create database record
      const { data, error } = await supabase
        .from('activity_attachments')
        // @ts-expect-error - Supabase type inference issue
        .insert({
          user_id: user.id,
          activity_id: activityId,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type,
        } as Database['public']['Tables']['activity_attachments']['Insert'])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', variables.activityId] })
    },
  })
}

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      filePath,
      activityId,
    }: {
      id: string
      filePath: string
      activityId: string
    }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKETS.ACTIVITY_ATTACHMENTS)
        .remove([filePath])

      if (storageError) throw storageError

      // Delete from database
      const { error } = await supabase.from('activity_attachments').delete().eq('id', id)

      if (error) throw error
      return { activityId }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', result.activityId] })
    },
  })
}

export const useDownloadAttachment = () => {
  return useMutation({
    mutationFn: async ({ filePath, fileName }: { filePath: string; fileName: string }) => {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.ACTIVITY_ATTACHMENTS)
        .download(filePath)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}

export const useGetAttachmentUrl = (filePath: string | null) => {
  return useQuery({
    queryKey: ['attachment-url', filePath],
    queryFn: async () => {
      if (!filePath) return null

      const { data } = supabase.storage
        .from(STORAGE_BUCKETS.ACTIVITY_ATTACHMENTS)
        .getPublicUrl(filePath)

      return data.publicUrl
    },
    enabled: !!filePath,
  })
}
