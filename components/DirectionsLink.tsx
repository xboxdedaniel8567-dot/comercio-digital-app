type DirectionsLinkProps = {
  address: string | null;
  city: string | null;
  className?: string;
  label?: string;
};

export function DirectionsLink({
  address,
  city,
  className = "btn btn-dark",
  label = "Como llegar",
}: DirectionsLinkProps) {
  if (!address?.trim()) {
    return null;
  }

  const destination = [address.trim(), city?.trim(), "Colombia"].filter(Boolean).join(", ");
  const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

  return (
    <a className={className} href={href} rel="noreferrer" target="_blank">
      {label}
    </a>
  );
}

