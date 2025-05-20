interface ContactMapProps {
  placeholder?: string;
}

export function ContactMap({
  placeholder = "Map will be integrated here",
}: ContactMapProps) {
  return (
    <div className="mt-16 rounded-lg overflow-hidden h-[400px] relative bg-gray-200 flex items-center justify-center">
      <p className="text-gray-500">{placeholder}</p>
    </div>
  );
}
