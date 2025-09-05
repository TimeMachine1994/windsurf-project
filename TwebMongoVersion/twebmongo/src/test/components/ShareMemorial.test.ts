import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import ShareMemorial from '../../lib/components/ShareMemorial.svelte';

// Mock browser environment
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://tributestream.com'
  },
  writable: true
});

// Mock window.open
window.open = vi.fn();

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn()
  },
  writable: true
});

describe('ShareMemorial Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render share button', () => {
    render(ShareMemorial, {
      props: {
        memorialName: 'John Doe',
        memorialUrl: 'john-doe-memorial',
        description: 'A loving father and husband'
      }
    });

    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByLabelText('Share memorial')).toBeInTheDocument();
  });

  it('should show share menu when clicked', async () => {
    render(ShareMemorial, {
      props: {
        memorialName: 'John Doe',
        memorialUrl: 'john-doe-memorial',
        description: 'A loving father and husband'
      }
    });

    const shareButton = screen.getByText('Share');
    await fireEvent.click(shareButton);

    expect(screen.getByText('Share Memorial')).toBeInTheDocument();
    expect(screen.getByText('Share on Facebook')).toBeInTheDocument();
    expect(screen.getByText('Share on Twitter')).toBeInTheDocument();
    expect(screen.getByText('Share on LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Share via Email')).toBeInTheDocument();
    expect(screen.getByText('Share via SMS')).toBeInTheDocument();
  });

  it('should display correct URL in copy field', async () => {
    render(ShareMemorial, {
      props: {
        memorialName: 'John Doe',
        memorialUrl: 'john-doe-memorial',
        description: 'A loving father and husband'
      }
    });

    const shareButton = screen.getByText('Share');
    await fireEvent.click(shareButton);

    const urlInput = screen.getByDisplayValue('https://tributestream.com/memorial/john-doe-memorial');
    expect(urlInput).toBeInTheDocument();
  });

  it('should copy URL to clipboard', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    navigator.clipboard.writeText = mockWriteText;

    render(ShareMemorial, {
      props: {
        memorialName: 'John Doe',
        memorialUrl: 'john-doe-memorial',
        description: 'A loving father and husband'
      }
    });

    const shareButton = screen.getByText('Share');
    await fireEvent.click(shareButton);

    const copyButton = screen.getByText('Copy');
    await fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith('https://tributestream.com/memorial/john-doe-memorial');
    expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
  });

  it('should open Facebook share window', async () => {
    const mockOpen = vi.fn();
    window.open = mockOpen;

    render(ShareMemorial, {
      props: {
        memorialName: 'John Doe',
        memorialUrl: 'john-doe-memorial',
        description: 'A loving father and husband'
      }
    });

    const shareButton = screen.getByText('Share');
    await fireEvent.click(shareButton);

    const facebookButton = screen.getByText('Share on Facebook');
    await fireEvent.click(facebookButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer/sharer.php'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('should open Twitter share window with correct text', async () => {
    const mockOpen = vi.fn();
    window.open = mockOpen;

    render(ShareMemorial, {
      props: {
        memorialName: 'John Doe',
        memorialUrl: 'john-doe-memorial',
        description: 'A loving father and husband'
      }
    });

    const shareButton = screen.getByText('Share');
    await fireEvent.click(shareButton);

    const twitterButton = screen.getByText('Share on Twitter');
    await fireEvent.click(twitterButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'width=600,height=400'
    );

    const call = mockOpen.mock.calls[0][0];
    expect(call).toContain(encodeURIComponent('Remember John Doe - A loving father and husband'));
  });

  it('should open LinkedIn share window', async () => {
    const mockOpen = vi.fn();
    window.open = mockOpen;

    render(ShareMemorial, {
      props: {
        memorialName: 'John Doe',
        memorialUrl: 'john-doe-memorial',
        description: 'A loving father and husband'
      }
    });

    const shareButton = screen.getByText('Share');
    await fireEvent.click(shareButton);

    const linkedinButton = screen.getByText('Share on LinkedIn');
    await fireEvent.click(linkedinButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('linkedin.com/sharing/share-offsite'),
      '_blank',
      'width=600,height=400'
    );
  });

  it('should create email with correct content', async () => {
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(ShareMemorial, {
      props: {
        memorialName: 'John Doe',
        memorialUrl: 'john-doe-memorial',
        description: 'A loving father and husband'
      }
    });

    const shareButton = screen.getByText('Share');
    await fireEvent.click(shareButton);

    const emailButton = screen.getByText('Share via Email');
    await fireEvent.click(emailButton);

    expect(window.location.href).toContain('mailto:');
    expect(window.location.href).toContain(encodeURIComponent('Memorial for John Doe'));
  });

  it('should create SMS with correct content', async () => {
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(ShareMemorial, {
      props: {
        memorialName: 'John Doe',
        memorialUrl: 'john-doe-memorial',
        description: 'A loving father and husband'
      }
    });

    const shareButton = screen.getByText('Share');
    await fireEvent.click(shareButton);

    const smsButton = screen.getByText('Share via SMS');
    await fireEvent.click(smsButton);

    expect(window.location.href).toContain('sms:');
    expect(window.location.href).toContain(encodeURIComponent('Remember John Doe'));
  });

  it('should close menu when clicking outside', async () => {
    render(ShareMemorial, {
      props: {
        memorialName: 'John Doe',
        memorialUrl: 'john-doe-memorial',
        description: 'A loving father and husband'
      }
    });

    const shareButton = screen.getByText('Share');
    await fireEvent.click(shareButton);

    expect(screen.getByText('Share Memorial')).toBeInTheDocument();

    // Click outside the menu
    await fireEvent.click(document.body);

    // Menu should be closed (not visible)
    expect(screen.queryByText('Share Memorial')).not.toBeInTheDocument();
  });

  it('should handle clipboard API failure gracefully', async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard not available'));
    navigator.clipboard.writeText = mockWriteText;

    // Mock document.execCommand for fallback
    document.execCommand = vi.fn().mockReturnValue(true);

    render(ShareMemorial, {
      props: {
        memorialName: 'John Doe',
        memorialUrl: 'john-doe-memorial',
        description: 'A loving father and husband'
      }
    });

    const shareButton = screen.getByText('Share');
    await fireEvent.click(shareButton);

    const copyButton = screen.getByText('Copy');
    await fireEvent.click(copyButton);

    // Should still show success even with fallback
    expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
  });
});
