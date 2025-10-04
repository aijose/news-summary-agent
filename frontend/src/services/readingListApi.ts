/**
 * Reading List API client functions
 */

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface ReadingListItem {
  id: number
  article_id: number
  notes: string | null
  added_at: string
  article: {
    id: number
    title: string
    content: string
    source: string
    published_date: string
    url: string
    metadata: Record<string, any>
  }
}

export interface AddToReadingListRequest {
  article_id: number
  notes?: string
}

/**
 * Get all articles in the reading list
 */
export async function getReadingList(): Promise<ReadingListItem[]> {
  const response = await axios.get(`${API_URL}/api/v1/reading-list`)
  return response.data
}

/**
 * Add an article to the reading list
 */
export async function addToReadingList(data: AddToReadingListRequest) {
  const response = await axios.post(`${API_URL}/api/v1/reading-list`, data)
  return response.data
}

/**
 * Remove an article from the reading list
 */
export async function removeFromReadingList(articleId: number) {
  const response = await axios.delete(`${API_URL}/api/v1/reading-list/${articleId}`)
  return response.data
}

/**
 * Check if an article is in the reading list
 */
export async function checkInReadingList(articleId: number): Promise<boolean> {
  const response = await axios.get(`${API_URL}/api/v1/reading-list/check/${articleId}`)
  return response.data.in_reading_list
}

/**
 * Update notes for a reading list item
 */
export async function updateReadingListNotes(articleId: number, notes: string | null) {
  const response = await axios.put(`${API_URL}/api/v1/reading-list/${articleId}`, { notes })
  return response.data
}
