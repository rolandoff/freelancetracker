import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTestQueryClient } from '@/test/testUtils'
import {
  useActivityAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  useDownloadAttachment,
  useGetAttachmentUrl,
} from './useActivityAttachments'
import { FILE_UPLOAD } from '@/lib/constants'
import type { QueryClient } from '@tanstack/react-query'

const {
  mockSupabaseFrom,
  mockAuthGetUser,
  mockStorageFrom,
  mockStorageUpload,
  mockStorageRemove,
  mockStorageDownload,
  mockStorageGetPublicUrl,
} = vi.hoisted(() => ({
  mockSupabaseFrom: vi.fn(),
  mockAuthGetUser: vi.fn(),
  mockStorageFrom: vi.fn(),
  mockStorageUpload: vi.fn(),
  mockStorageRemove: vi.fn(),
  mockStorageDownload: vi.fn(),
  mockStorageGetPublicUrl: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockSupabaseFrom,
    auth: {
      getUser: mockAuthGetUser,
    },
    storage: {
      from: mockStorageFrom,
    },
  },
}))

const createWrapper = (client?: QueryClient) => {
  const queryClient = client ?? createTestQueryClient()
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { Wrapper, queryClient }
}

describe('useActivityAttachments hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStorageFrom.mockReturnValue({
      upload: mockStorageUpload,
      remove: mockStorageRemove,
      download: mockStorageDownload,
      getPublicUrl: mockStorageGetPublicUrl,
    })
  })

  describe('useActivityAttachments', () => {
    it('fetches attachments for an activity', async () => {
      const attachments = [{ id: 'file-1' }]
      const mockOrder = vi.fn().mockResolvedValue({ data: attachments, error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ select: mockSelect })

      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useActivityAttachments('activity-1'), { wrapper: Wrapper })

      await waitFor(() => {
        expect(result.current.data).toEqual(attachments)
      })

      expect(mockSupabaseFrom).toHaveBeenCalledWith('activity_attachments')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('activity_id', 'activity-1')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('skips query when no activity id provided', () => {
      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useActivityAttachments(null), { wrapper: Wrapper })

      expect(result.current.data).toBeUndefined()
      expect(mockSupabaseFrom).not.toHaveBeenCalled()
    })
  })

  describe('useUploadAttachment', () => {
    const createFile = (overrides: Partial<File> = {}) =>
      ({
        name: 'doc.pdf',
        size: 1024,
        type: 'application/pdf',
        ...overrides,
      }) as File

    it('validates authentication, uploads file, and invalidates cache', async () => {
      const created = { id: 'att-1', activity_id: 'activity-1' }
      const mockSingle = vi.fn().mockResolvedValue({ data: created, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      mockSupabaseFrom.mockReturnValue({ insert: mockInsert })
      mockAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
      mockStorageUpload.mockResolvedValue({ data: { path: 'user-1/activity-1/file.pdf' }, error: null })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useUploadAttachment(), { wrapper: Wrapper })
      const file = createFile()

      await act(async () => {
        await result.current.mutateAsync({ activityId: 'activity-1', file })
      })

      expect(mockStorageUpload).toHaveBeenCalledWith(expect.stringContaining('activity-1'), file)
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-1',
        activity_id: 'activity-1',
        file_name: 'doc.pdf',
        file_path: 'user-1/activity-1/file.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
      })
      expect(mockSelect).toHaveBeenCalled()
      expect(mockSingle).toHaveBeenCalled()
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['attachments', 'activity-1'] })
    })

    it('throws when user is not authenticated', async () => {
      mockAuthGetUser.mockResolvedValue({ data: { user: null } })

      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useUploadAttachment(), { wrapper: Wrapper })

      await expect(
        result.current.mutateAsync({ activityId: 'activity-1', file: createFile() })
      ).rejects.toThrow('Not authenticated')
    })

    it('validates file size', async () => {
      mockAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
      const oversized = createFile({ size: FILE_UPLOAD.MAX_SIZE_BYTES + 1 })
      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useUploadAttachment(), { wrapper: Wrapper })

      await expect(
        result.current.mutateAsync({ activityId: 'activity-1', file: oversized })
      ).rejects.toThrow(`File size exceeds ${FILE_UPLOAD.MAX_SIZE_MB}MB limit`)
    })

    it('validates file type', async () => {
      mockAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
      const invalidTypeFile = createFile({ type: 'application/zip' })
      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useUploadAttachment(), { wrapper: Wrapper })

      await expect(
        result.current.mutateAsync({ activityId: 'activity-1', file: invalidTypeFile })
      ).rejects.toThrow('File type not allowed')
    })
  })

  describe('useDeleteAttachment', () => {
    it('removes file from storage and database, then invalidates cache', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      mockSupabaseFrom.mockReturnValue({ delete: mockDelete })
      mockStorageRemove.mockResolvedValue({ data: null, error: null })

      const { Wrapper, queryClient } = createWrapper()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
      const { result } = renderHook(() => useDeleteAttachment(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          id: 'att-1',
          filePath: 'user/file.pdf',
          activityId: 'activity-1',
        })
      })

      expect(mockStorageRemove).toHaveBeenCalledWith(['user/file.pdf'])
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'att-1')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['attachments', 'activity-1'] })
    })
  })

  describe('useDownloadAttachment', () => {
    it('downloads file and triggers browser save flow', async () => {
      const blob = new Blob(['file'])
      mockStorageDownload.mockResolvedValue({ data: blob, error: null })
      const originalCreateObjectURL = URL.createObjectURL
      const originalRevokeObjectURL = URL.revokeObjectURL

      if (!originalCreateObjectURL) {
        Object.defineProperty(URL, 'createObjectURL', {
          configurable: true,
          writable: true,
          value: vi.fn(),
        })
      }

      if (!originalRevokeObjectURL) {
        Object.defineProperty(URL, 'revokeObjectURL', {
          configurable: true,
          writable: true,
          value: vi.fn(),
        })
      }

      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url')
      const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')
      const originalCreateElement = document.createElement.bind(document)
      const clickSpy = vi.fn()
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName)
        if (tagName === 'a') {
          element.click = clickSpy
        }
        return element
      })

      const appendSpy = vi.spyOn(document.body, 'appendChild')
      const removeSpy = vi.spyOn(document.body, 'removeChild')

      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useDownloadAttachment(), { wrapper: Wrapper })

      await act(async () => {
        await result.current.mutateAsync({ filePath: 'user/file.pdf', fileName: 'file.pdf' })
      })

      expect(mockStorageDownload).toHaveBeenCalledWith('user/file.pdf')
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob)
      expect(appendSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
      expect(removeSpy).toHaveBeenCalled()
      expect(revokeSpy).toHaveBeenCalledWith('blob:url')

      createElementSpy.mockRestore()
      createObjectURLSpy.mockRestore()
      revokeSpy.mockRestore()

      if (!originalCreateObjectURL) {
        // Remove temporary polyfill when environment lacked implementation
        delete (URL as Partial<typeof URL>).createObjectURL
      }

      if (!originalRevokeObjectURL) {
        delete (URL as Partial<typeof URL>).revokeObjectURL
      }
    })
  })

  describe('useGetAttachmentUrl', () => {
    it('retrieves public url for attachment path', async () => {
      mockStorageGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://files/test.pdf' } })

      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useGetAttachmentUrl('user/file.pdf'), { wrapper: Wrapper })

      await waitFor(() => {
        expect(result.current.data).toBe('https://files/test.pdf')
      })

      expect(mockStorageGetPublicUrl).toHaveBeenCalledWith('user/file.pdf')
    })

    it('skips query when file path is null', () => {
      const { Wrapper } = createWrapper()
      const { result } = renderHook(() => useGetAttachmentUrl(null), { wrapper: Wrapper })

      expect(result.current.data).toBeUndefined()
      expect(mockStorageGetPublicUrl).not.toHaveBeenCalled()
    })
  })
})
