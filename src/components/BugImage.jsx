import { useState } from "react";

import { getBugImageUrl } from "../utils/bugMedia";

function BugImage({ bug, apiUrl, alt, className }) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = getBugImageUrl(bug, apiUrl);
  const imageUrlWithNgrokBypass = imageUrl
    ? `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}ngrok-skip-browser-warning=true`
    : "";

  if (!imageUrl || hasError) {
    return <span className={`${className} bug-image-fallback`}>No image</span>;
  }

  return (
    <img
      src={imageUrlWithNgrokBypass}
      alt={alt || "Bug screenshot"}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

export default BugImage;
