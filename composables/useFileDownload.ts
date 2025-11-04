export const useFileDownload = () => {
    const progress = ref(0);
    const isDownloading = ref(false);
    const toast = useToast();
  
    const downloadFile = async (fileName: string, fileExt: string) => {
      try {
        isDownloading.value = true;
        progress.value = 0;
  
        // Show initial toast
        toast.add({
          id: 'download',
          title: 'Downloading...',
          description: 'Please wait',
          timeout: 0,
          icon: 'i-heroicons-arrow-down-tray',
        });
  
        // Get presigned URL
        const { url, fileName: correctFileName } = await $fetch('/api/datasets/download', {
          query: { file: fileName, ext: fileExt },
        });
  
        // Fetch with progress tracking
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Download failed');
        }
  
        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength || '0', 10);
        
        if (!response.body) {
          throw new Error('No response body');
        }
  
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let loaded = 0;
  
        // Read stream with progress
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
  
          chunks.push(value);
          loaded += value.length;
  
          if (total > 0) {
            progress.value = Math.round((loaded / total) * 100);
          }
        }
  
        // Create blob and download
        const blob = new Blob(chunks);
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = correctFileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
  
        progress.value = 100;
  
        // Success toast
        toast.remove('download');
        toast.add({
          title: 'Download complete!',
          description: `${correctFileName} has been downloaded`,
          color: 'green',
          icon: 'i-heroicons-check-circle',
        });
      } catch (error) {
        console.error('Download error:', error);
        
        toast.remove('download');
        toast.add({
          title: 'Download failed',
          description: 'Please try again',
          color: 'red',
          icon: 'i-heroicons-x-circle',
        });
        
        throw error;
      } finally {
        isDownloading.value = false;
        setTimeout(() => {
          progress.value = 0;
        }, 1000);
      }
    };
  
    return {
      downloadFile,
      progress,
      isDownloading,
    };
  };