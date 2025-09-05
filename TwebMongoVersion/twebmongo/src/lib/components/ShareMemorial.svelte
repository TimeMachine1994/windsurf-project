<script lang="ts">
  import { browser } from '$app/environment';
  
  export let memorialName: string;
  export let memorialUrl: string;
  export let description: string = '';

  let showShareMenu = false;
  let copySuccess = false;

  $: fullUrl = browser ? `${window.location.origin}/memorial/${memorialUrl}` : '';
  $: shareText = `Remember ${memorialName} - ${description || 'A beautiful memorial tribute'}`;

  function toggleShareMenu() {
    showShareMenu = !showShareMenu;
  }

  async function copyToClipboard() {
    if (!browser) return;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 2000);
    }
  }

  function shareOnFacebook() {
    if (!browser) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }

  function shareOnTwitter() {
    if (!browser) return;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }

  function shareOnLinkedIn() {
    if (!browser) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  }

  function shareViaEmail() {
    if (!browser) return;
    const subject = encodeURIComponent(`Memorial for ${memorialName}`);
    const body = encodeURIComponent(`I wanted to share this beautiful memorial with you:\n\n${shareText}\n\n${fullUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  function shareViaSMS() {
    if (!browser) return;
    const text = encodeURIComponent(`${shareText} ${fullUrl}`);
    window.location.href = `sms:?body=${text}`;
  }

  // Close menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (showShareMenu && !event.target?.closest('.share-menu')) {
      showShareMenu = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="share-memorial">
  <div class="relative share-menu">
    <button
      on:click={toggleShareMenu}
      class="btn btn-secondary flex items-center gap-2"
      aria-label="Share memorial"
    >
      <span>🔗</span>
      <span>Share</span>
    </button>

    {#if showShareMenu}
      <div class="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div class="p-4">
          <h3 class="font-semibold text-gray-900 mb-3">Share Memorial</h3>
          
          <!-- Copy Link -->
          <div class="mb-4">
            <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={fullUrl}
                readonly
                class="flex-1 bg-transparent text-sm text-gray-600 outline-none"
              />
              <button
                on:click={copyToClipboard}
                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                {copySuccess ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <!-- Social Media Buttons -->
          <div class="space-y-2">
            <button
              on:click={shareOnFacebook}
              class="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm">
                f
              </div>
              <span class="text-sm text-gray-700">Share on Facebook</span>
            </button>

            <button
              on:click={shareOnTwitter}
              class="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div class="w-8 h-8 bg-blue-400 rounded flex items-center justify-center text-white text-sm">
                𝕏
              </div>
              <span class="text-sm text-gray-700">Share on Twitter</span>
            </button>

            <button
              on:click={shareOnLinkedIn}
              class="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div class="w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-white text-sm">
                in
              </div>
              <span class="text-sm text-gray-700">Share on LinkedIn</span>
            </button>

            <div class="border-t border-gray-100 my-2"></div>

            <button
              on:click={shareViaEmail}
              class="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div class="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white text-sm">
                ✉
              </div>
              <span class="text-sm text-gray-700">Share via Email</span>
            </button>

            <button
              on:click={shareViaSMS}
              class="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div class="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white text-sm">
                💬
              </div>
              <span class="text-sm text-gray-700">Share via SMS</span>
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .btn-secondary {
    background-color: #e5e7eb;
    color: #1f2937;
  }
  
  .btn-secondary:hover {
    background-color: #d1d5db;
  }
</style>
