import axios from 'axios';
import type { Listing } from '../types/interfaces';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}

export const fetchListings = async (status?: string): Promise<ApiResponse<Listing[]>> => {
  const params = status ? { status } : {};
  const response = await api.get<ApiResponse<Listing[]>>('/listings', { params });
  return response.data;
};

export const updateListingStatus = async (
  id: string, 
  status: Listing['status']
): Promise<ApiResponse<Listing>> => {
  const response = await api.patch<ApiResponse<Listing>>(`/listings/${id}/status`, { status });
  return response.data;
};

export const triggerScrape = async (): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.post<ApiResponse<{ message: string }>>('/listings/scrape');
  return response.data;
};

export const getStats = async (): Promise<ApiResponse<{
  total: number;
  byStatus: Record<string, number>;
  recent24h: number;
}>> => {
  const response = await api.get<ApiResponse<{
    total: number;
    byStatus: Record<string, number>;
    recent24h: number;
  }>>('/listings/stats');
  return response.data;
};
