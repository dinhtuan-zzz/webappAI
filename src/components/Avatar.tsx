import Image from "next/image";
import md5 from "md5";

function getGravatarUrl(email: string, size: number = 40, defaultType: string = "wavatar") {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultType}`;
}

/**
 * Avatar - Displays a user's avatar image, fallback, and name.
 *
 * @param {Object} props
 * @param {string} [props.avatarUrl] - URL of the avatar image.
 * @param {string} [props.email] - User's email (for fallback).
 * @param {string} [props.name] - User's display name (for fallback/alt).
 * @param {number} [props.size] - Size of the avatar in pixels.
 * @returns {JSX.Element}
 */
export function Avatar({
  avatarUrl,
  email,
  name,
  size = 40,
}: {
  avatarUrl?: string | null;
  email?: string | null;
  name?: string | null;
  size?: number;
}) {
  let src = getGravatarUrl(email || "unknown@example.com", size);
  if (avatarUrl) {
    src = avatarUrl;
  }
  return (
    <Image
      src={src}
      alt={name || "User avatar"}
      width={size}
      height={size}
      className="rounded-full border border-[#e6e6e6] object-cover"
      style={{ width: size, height: size }}
    />
  );
} 