// Public Cloudinary photos are stored at full upload size (up to 5 MB). For small displays
// (avatars, icons) ask Cloudinary for a cropped, resized, auto-format (WebP/AVIF) copy instead.
// Other URLs (and private files, which never reach the browser) are returned unchanged.
const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?!c_|w_|h_|f_|q_)(.+)$/;

export const cloudinaryResized = (url: string | undefined | null, sizePx: number) => {
  if (!url) return url ?? undefined;
  const match = url.match(CLOUDINARY_UPLOAD);
  if (!match) return url;
  return `${match[1]}c_fill,g_face,w_${sizePx},h_${sizePx},f_auto,q_auto/${match[2]}`;
};
