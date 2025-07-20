export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
}

export interface ChatResponse {
  answer: string
}

export interface DashboardResponse {
  total_money_saved: number
  total_days_smoke_free: number
  streak_days_smoke_free: number
}

export interface CalendarDay {
  date: string
  status: "SMOKE_FREE" | "SLIP" | "UNKNOWN"
}

export interface CalendarResponse {
  data: CalendarDay[]
}

export interface SlipRequest {
  date?: string
  notes?: string
}

export interface SlipResponse {
  message: string
}

export interface DocumentContent {
  content_id: string
  content: string
}

export interface Document {
  document_id: string
  document_name: string
  document_extension: string
  extracted_content: DocumentContent[]
  uploaded_at: string
}

export interface DocumentsResponse {
  documents: Document[]
  page: number
  pageSize: number
  total: number
}

export interface UploadRequest {
  file: string
}

export interface UploadResponse {
  document_id: string
  document_name: string
  status: string
  message?: string
}

export interface HealthResponse {
  status: string
}

export interface Response<T> {
  data: T
  message: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getLanguageHeader(): string {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language")
      return savedLanguage === "ar" ? "ar" : "en"
    }
    return "en"
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<Response<T>> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": this.getLanguageHeader(),
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return (await response.json()) as Response<T>
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  private async uploadRequest<T>(endpoint: string, formData: FormData): Promise<Response<T>> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Accept-Language": this.getLanguageHeader(),
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Upload request failed: ${endpoint}`, error)
      throw error
    }
  }

  async healthCheck(): Promise<{ data: HealthResponse; message: string }> {
    return await this.request<HealthResponse>("/api/v1/health")
  }

  async getDashboard(): Promise<{ data: DashboardResponse; message: string }> {
    return await this.request<DashboardResponse>("/api/v1/dashboard")
  }

  async getCalendar(date?: string): Promise<{ data: CalendarDay[]; message: string }> {
    const dateParam = date ? `?date=${date}` : `?date=${new Date().toISOString().split("T")[0]}`
    const response = await this.request<CalendarDay[]>(`/api/v1/dashboard/calendar${dateParam}`)
    return response
  }

  async reportSlip(slipData: SlipRequest = {}): Promise<{ message: string }> {
    const response = await this.request<void>("/api/v1/dashboard/slip", {
      method: "POST",
      body: JSON.stringify(slipData),
    })
    return { message: response.message }
  }

  async chat(messages: ChatMessage[]): Promise<{ data: ChatResponse; message: string }> {
    const chatRequest: ChatRequest = { messages }

    return await this.request<ChatResponse>("/api/v1/chat", {
      method: "POST",
      body: JSON.stringify(chatRequest),
    })
  }

  async upload(file: File, orgId = "000"): Promise<{ data: UploadResponse; message: string }> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("org_id", orgId)

    return await this.uploadRequest("/api/v1/upload", formData)
  }

  async getDocuments(page = 1, pageSize = 10): Promise<{ data: DocumentsResponse; message: string }> {
    return await this.request<DocumentsResponse>(`/api/v1/documents?page=${page}&pageSize=${pageSize}`)
  }

  async deleteDocument(documentId: string): Promise<{ message: string }> {
    const response = await this.request<void>(`/api/v1/document/${documentId}`, {
      method: "DELETE",
    })
    return { message: response.message }
  }

  async deleteContent(contentId: string): Promise<{ message: string }> {
    const response = await this.request<void>(`/api/v1/content/${contentId}`, {
      method: "DELETE",
    })
    return { message: response.message }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
