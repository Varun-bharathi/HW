import { api } from './client'

export interface GenerateDescriptionPayload {
  title: string
  skills?: string[]
}

export interface GenerateDescriptionResponse {
  description: string
}

export const aiApi = {
  generateDescription: (payload: GenerateDescriptionPayload) =>
    api.post<GenerateDescriptionResponse>('/ai/generate-description', payload),
}
