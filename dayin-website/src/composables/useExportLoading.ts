import { ref } from 'vue';

export const useExportLoading = () => {
  const isPdfLoading = ref(false);
  const isImageLoading = ref(false);

  const runExport = async (
    type: 'pdf' | 'image',
    task: () => Promise<unknown>,
  ) => {
    const loading = type === 'pdf' ? isPdfLoading : isImageLoading;
    if (loading.value) return;

    loading.value = true;
    try {
      await task();
    } finally {
      loading.value = false;
    }
  };

  return { isPdfLoading, isImageLoading, runExport };
};
