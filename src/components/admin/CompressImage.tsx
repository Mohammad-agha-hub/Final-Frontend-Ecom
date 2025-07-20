export  const compressImage = async (
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) =>
            resolve(new File([blob!], file.name, { type: "image/jpeg" })),
          "image/jpeg",
          quality
        );
      };
    };
    reader.readAsDataURL(file);
  });
};
