import Image from "next/image";
import md5 from "md5";

function getGravatarUrl(email: string, size: number = 40, defaultType: string = "wavatar") {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultType}`;
}

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