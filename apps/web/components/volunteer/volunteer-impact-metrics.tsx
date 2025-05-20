type VolunteerImpactMetric = {
  value: string;
  description: string;
};

export default function VolunteerImpactMetrics({
  impactMetrics,
}: {
  impactMetrics: VolunteerImpactMetric[];
}) {
  return (
    <section className="bg-[#2F4858] py-16 px-4 text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Our Volunteer Impact
          </h2>
          <p className="text-lg mt-4 max-w-3xl mx-auto opacity-90">
            Together, our volunteers are creating measurable change in
            communities around the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {impactMetrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {metric.value}
              </div>
              <p className="text-white/90">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
