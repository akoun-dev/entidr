/**
 * Simple placeholder encryption utilities.
 * In a real implementation, replace with strong cryptography.
 */
export const encrypt = (value: string): string => {
  return btoa(value);
};

export const encryptFile = (file: File): Promise<{ name: string; content: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const encoded = btoa(result);
      resolve({ name: file.name, content: encoded });
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};
