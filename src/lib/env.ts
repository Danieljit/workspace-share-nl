// Environment variable helper to ensure proper loading in both server and
// client components. Values are read from process.env with safe fallbacks so
// local/dev keeps working when the variables are not yet configured.
//
// NOTE: these must use the NEXT_PUBLIC_ prefix to be available in the browser.

export const env = {
  // Cloudinary
  CLOUDINARY_CLOUD_NAME:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "dsbf4alw4",
  CLOUDINARY_UPLOAD_PRESET:
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "workspace_share",
};
