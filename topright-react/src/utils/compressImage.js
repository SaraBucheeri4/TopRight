export function compressImage(file, { maxWidth = 1400, maxHeight = 1400, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        blob => blob ? resolve(new File([blob], file.name, { type: 'image/webp' })) : reject(new Error('Compression failed')),
        'image/webp',
        quality,
      )
    }
    img.onerror = reject
    img.src = url
  })
}
