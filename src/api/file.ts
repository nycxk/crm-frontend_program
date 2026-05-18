import request from '@/utils/request'

export interface FileInfo {
  id: number
  originalName: string
  storedName: string
  relativePath: string
  mimeType: string
  sizeBytes: number
  fileKind: string
  bizType: string
  url: string
  createdAt: string
}

export function uploadFile(file: File, bizType?: string): Promise<FileInfo> {
  const formData = new FormData()
  formData.append('file', file)
  if (bizType) {
    formData.append('bizType', bizType)
  }
  return request.post('/api/file/upload', formData) as any
}
