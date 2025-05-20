import { Heart, Globe, Users, Shield } from "lucide-react";

interface ValueCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function ValueCard({ title, description, icon }: ValueCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function ValuesSection() {
  const values = [
    {
      title: "Compassion",
      description:
        "Extending empathy and understanding to all, recognizing our shared humanity.",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: "Inclusion",
      description:
        "Embracing diverse perspectives and ensuring all voices are heard and valued.",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Global Perspective",
      description:
        "Addressing issues with awareness of our interconnected world and diverse cultures.",
      icon: <Globe className="w-6 h-6" />,
    },
    {
      title: "Integrity",
      description:
        "Maintaining honesty, transparency, and ethical principles in all our actions.",
      icon: <Shield className="w-6 h-6" />,
    },
  ];

  return (
    <div className="my-16">
      <h2 className="text-3xl font-bold text-center mb-10">Our Core Values</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value, index) => (
          <ValueCard
            key={index}
            title={value.title}
            description={value.description}
            icon={value.icon}
          />
        ))}
      </div>
    </div>
  );
}
