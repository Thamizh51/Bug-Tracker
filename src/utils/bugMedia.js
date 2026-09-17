export function getBugImageUrl(bug, apiUrl) {
  const imagePath =
    bug?.image ||
    bug?.image_url ||
    bug?.screenshot_url ||
    bug?.screenshot ||
    "";

  if (!imagePath || typeof imagePath !== "string") {
    return "";
  }

  const cleanApiUrl = String(apiUrl || "").replace(/\/$/, "");

  if (
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    try {
      const parsedUrl = new URL(imagePath);

      if (
        parsedUrl.hostname !== "localhost" &&
        parsedUrl.hostname !== "127.0.0.1" &&
        parsedUrl.hostname !== "::1"
      ) {
        if (
          typeof window !== "undefined" &&
          window.location.hostname === "localhost" &&
          parsedUrl.hostname.includes("ngrok-free.dev")
        ) {
          return `/backend-assets${parsedUrl.pathname}${parsedUrl.search}`;
        }

        return imagePath;
      }

      return `${cleanApiUrl}${parsedUrl.pathname}${parsedUrl.search}`;
    } catch {
      return imagePath;
    }
  }

  const cleanPath = imagePath
    .replace(/^\/+/, "")
    .replace(/^public\//, "");

  if (cleanPath.startsWith("storage/")) {
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "localhost"
    ) {
      return `/backend-assets/${cleanPath}`;
    }

    return `${cleanApiUrl}/${cleanPath}`;
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    return `/backend-assets/storage/${cleanPath}`;
  }

  return `${cleanApiUrl}/storage/${cleanPath}`;
}
