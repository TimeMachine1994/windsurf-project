import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import PhotoGallery from '../../lib/components/PhotoGallery.svelte';

// Mock fetch
global.fetch = vi.fn();

describe('PhotoGallery Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(PhotoGallery, {
      props: {
        memorialId: 'test-memorial-123',
        canManage: false
      }
    });

    expect(screen.getByText('Loading photos...')).toBeInTheDocument();
  });

  it('should display photos when loaded', async () => {
    const mockPhotos = [
      {
        id: 'photo-1',
        filename: 'test1.jpg',
        contentType: 'image/jpeg',
        size: 1024,
        uploadedAt: '2024-01-01T00:00:00Z',
        uploadedBy: 'user-1',
        order: 1,
        compressedSize: 512
      },
      {
        id: 'photo-2',
        filename: 'test2.png',
        contentType: 'image/png',
        size: 2048,
        uploadedAt: '2024-01-02T00:00:00Z',
        uploadedBy: 'user-2',
        order: 2,
        compressedSize: 1024
      }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        photos: mockPhotos
      })
    });

    render(PhotoGallery, {
      props: {
        memorialId: 'test-memorial-123',
        canManage: false
      }
    });

    await waitFor(() => {
      expect(screen.getByText('test1.jpg')).toBeInTheDocument();
      expect(screen.getByText('test2.png')).toBeInTheDocument();
    });

    // Check that images are rendered with correct src
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', '/api/photos/photo-1');
    expect(images[1]).toHaveAttribute('src', '/api/photos/photo-2');
  });

  it('should show empty state when no photos', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        photos: []
      })
    });

    render(PhotoGallery, {
      props: {
        memorialId: 'test-memorial-123',
        canManage: false
      }
    });

    await waitFor(() => {
      expect(screen.getByText('No Photos Yet')).toBeInTheDocument();
      expect(screen.getByText("This memorial doesn't have any photos yet.")).toBeInTheDocument();
    });
  });

  it('should show delete buttons when canManage is true', async () => {
    const mockPhotos = [
      {
        id: 'photo-1',
        filename: 'test1.jpg',
        contentType: 'image/jpeg',
        size: 1024,
        uploadedAt: '2024-01-01T00:00:00Z',
        uploadedBy: 'user-1',
        order: 1
      }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        photos: mockPhotos
      })
    });

    render(PhotoGallery, {
      props: {
        memorialId: 'test-memorial-123',
        canManage: true
      }
    });

    await waitFor(() => {
      expect(screen.getByTitle('Delete photo')).toBeInTheDocument();
    });
  });

  it('should open lightbox when photo is clicked', async () => {
    const mockPhotos = [
      {
        id: 'photo-1',
        filename: 'test1.jpg',
        contentType: 'image/jpeg',
        size: 1024,
        uploadedAt: '2024-01-01T00:00:00Z',
        uploadedBy: 'user-1',
        order: 1
      }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        photos: mockPhotos
      })
    });

    render(PhotoGallery, {
      props: {
        memorialId: 'test-memorial-123',
        canManage: false
      }
    });

    await waitFor(() => {
      const image = screen.getByRole('img');
      fireEvent.click(image);
    });

    // Should show lightbox
    await waitFor(() => {
      expect(screen.getByText('test1.jpg')).toBeInTheDocument();
    });
  });

  it('should handle photo deletion', async () => {
    const mockPhotos = [
      {
        id: 'photo-1',
        filename: 'test1.jpg',
        contentType: 'image/jpeg',
        size: 1024,
        uploadedAt: '2024-01-01T00:00:00Z',
        uploadedBy: 'user-1',
        order: 1
      }
    ];

    (global.fetch as any)
      .mockResolvedValueOnce({
        json: async () => ({
          success: true,
          photos: mockPhotos
        })
      })
      .mockResolvedValueOnce({
        json: async () => ({
          success: true
        })
      });

    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    render(PhotoGallery, {
      props: {
        memorialId: 'test-memorial-123',
        canManage: true
      }
    });

    await waitFor(() => {
      const deleteButton = screen.getByTitle('Delete photo');
      fireEvent.click(deleteButton);
    });

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "test1.jpg"?');
    expect(global.fetch).toHaveBeenCalledWith('/api/photos/photo-1', {
      method: 'DELETE'
    });
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(PhotoGallery, {
      props: {
        memorialId: 'test-memorial-123',
        canManage: false
      }
    });

    await waitFor(() => {
      expect(screen.getByText('❌ Network error loading photos')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should format file sizes correctly', async () => {
    const mockPhotos = [
      {
        id: 'photo-1',
        filename: 'small.jpg',
        contentType: 'image/jpeg',
        size: 500,
        uploadedAt: '2024-01-01T00:00:00Z',
        uploadedBy: 'user-1',
        order: 1,
        compressedSize: 500
      },
      {
        id: 'photo-2',
        filename: 'medium.jpg',
        contentType: 'image/jpeg',
        size: 1536,
        uploadedAt: '2024-01-01T00:00:00Z',
        uploadedBy: 'user-1',
        order: 2,
        compressedSize: 1536
      },
      {
        id: 'photo-3',
        filename: 'large.jpg',
        contentType: 'image/jpeg',
        size: 2097152,
        uploadedAt: '2024-01-01T00:00:00Z',
        uploadedBy: 'user-1',
        order: 3,
        compressedSize: 2097152
      }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        photos: mockPhotos
      })
    });

    render(PhotoGallery, {
      props: {
        memorialId: 'test-memorial-123',
        canManage: false
      }
    });

    await waitFor(() => {
      expect(screen.getByText(/500 B/)).toBeInTheDocument();
      expect(screen.getByText(/1.5 KB/)).toBeInTheDocument();
      expect(screen.getByText(/2.0 MB/)).toBeInTheDocument();
    });
  });
});
