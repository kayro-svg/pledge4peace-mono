interface MissionBoxProps {
  title: string;
  description: string;
}

export function MissionBox({ title, description }: MissionBoxProps) {
  return (
    <div className="mt-12 bg-[#CCD5AE] p-8 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-[#2F4858]">{title}</h3>
      <p className="text-[#2F4858]">{description}</p>
    </div>
  );
}
