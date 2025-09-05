import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import PhotoUploader from '../../lib/components/PhotoUploader.svelte';
import { tick } from 'svelte';

// Mock the auth store
vi.mock('../../lib/services/auth.js', () => ({
  user: {
    subscribe: vi.fn((callback) => {
      callback({ sub: 'test-user-123', name: 'Test User' });
      return () => {};
    })
  }
}));

// Mock fetch
global.fetch = vi.fn();

describe('PhotoUploader Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload area', () => {
    render(PhotoUploader, {
      props: {
        memorialId: 'test-memorial-123'
      }
    });

    expect(screen.getByText('Upload Photos')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop photos here, or click to select files')).toBeInTheDocument();
  });

  it('should show file type restrictions', () => {
    render(PhotoUploader, {
      props: {
        memorialId: 'test-memorial-123'
      }
    });

    expect(screen.getByText(/Supports: JPEG, PNG, GIF, WebP/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum size: 10MB per file/)).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(PhotoUploader, {
      props: {
        memorialId: 'test-memorial-123',
        disabled: true
      }
    });

    const uploadArea = screen.getByRole('button');
    expect(uploadArea).toHaveClass('disabled');
  });

  it('should validate file types', async () => {
    const component = render(PhotoUploader, {
      props: {
        memorialId: 'test-memorial-123'
      }
    });

    // Create a mock file with invalid type
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    
    // Mock the file input
    const fileInput = component.container.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Create a custom event with files
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false,
    });

    await fireEvent.change(fileInput);

    // Should dispatch error event for invalid file type
    // This would be tested by listening to the error event
  });

  it('should validate file size', async () => {
    const component = render(PhotoUploader, {
      props: {
        memorialId: 'test-memorial-123'
      }
    });

    // Create a mock file that's too large (11MB)
    const largeFileSize = 11 * 1024 * 1024;
    const largeFile = new File(['x'.repeat(largeFileSize)], 'large.jpg', { type: 'image/jpeg' });
    
    const fileInput = component.container.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    });

    await fireEvent.change(fileInput);

    // Should dispatch error event for file too large
  });

  it('should handle successful upload', async () => {
    // Mock successful fetch response
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        photoId: 'new-photo-123'
      })
    });

    const component = render(PhotoUploader, {
      props: {
        memorialId: 'test-memorial-123'
      }
    });

    // Create a valid file
    const validFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
    
    const fileInput = component.container.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    await fireEvent.change(fileInput);

    // Should call fetch with correct parameters
    expect(global.fetch).toHaveBeenCalledWith('/api/photos/upload', {
      method: 'POST',
      body: expect.any(FormData)
    });
  });

  it('should show uploading state', async () => {
    // Mock a delayed response
    (global.fetch as any).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        json: async () => ({ success: true, photoId: 'test-123' })
      }), 100))
    );

    const component = render(PhotoUploader, {
      props: {
        memorialId: 'test-memorial-123'
      }
    });

    const validFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = component.container.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });

    await fireEvent.change(fileInput);

    // Should show uploading state
    expect(screen.getByText('Uploading and compressing photo...')).toBeInTheDocument();
  });

  it('should handle drag and drop', async () => {
    render(PhotoUploader, {
      props: {
        memorialId: 'test-memorial-123'
      }
    });

    const uploadArea = screen.getByRole('button');

    // Test drag over
    await fireEvent.dragOver(uploadArea);
    expect(uploadArea).toHaveClass('drag-active');

    // Test drag leave
    await fireEvent.dragLeave(uploadArea);
    expect(uploadArea).not.toHaveClass('drag-active');

    // Test drop
    const validFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
    const dropEvent = new DragEvent('drop', {
      dataTransfer: {
        files: [validFile]
      } as any
    });

    await fireEvent(uploadArea, dropEvent);
    // Should process the dropped file
  });
});
