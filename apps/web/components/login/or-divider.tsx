interface OrDividerProps {
  text: string;
}

export function OrDivider({ text }: OrDividerProps) {
  return (
    <div className="mt-6 relative flex items-center">
      <div className="flex-grow border-t border-gray-300"></div>
      <span className="flex-shrink mx-4 text-sm text-gray-500">{text}</span>
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );
}
