import { Skeleton } from "@/components/ui/skeleton";

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFDF0] w-full">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Hero Title Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-16 w-3/4 mx-auto bg-gray-200/80" />
              <Skeleton className="h-16 w-1/2 mx-auto bg-gray-200/80" />
            </div>

            {/* Hero Description Skeleton */}
            <div className="space-y-3 max-w-2xl mx-auto">
              <Skeleton className="h-6 w-full bg-gray-200/60" />
              <Skeleton className="h-6 w-5/6 mx-auto bg-gray-200/60" />
              <Skeleton className="h-6 w-4/5 mx-auto bg-gray-200/60" />
            </div>

            {/* Hero Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Skeleton className="h-14 w-48 bg-gray-200/70 rounded-lg" />
              <Skeleton className="h-14 w-40 bg-gray-200/70 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Background decoration skeleton */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-gray-200/20 rounded-full animate-pulse delay-75" />
          <div className="absolute top-40 right-20 w-16 h-16 bg-gray-200/20 rounded-full animate-pulse delay-150" />
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-gray-200/20 rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-20 right-10 w-18 h-18 bg-gray-200/20 rounded-full animate-pulse delay-500" />
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto bg-gray-200/80 mb-4" />
            <Skeleton className="h-6 w-96 mx-auto bg-gray-200/60" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3].map((item) => (
              <div key={item} className="text-center space-y-4">
                <Skeleton className="h-16 w-16 mx-auto bg-gray-200/70 rounded-full" />
                <Skeleton className="h-12 w-24 mx-auto bg-gray-200/80" />
                <Skeleton className="h-5 w-32 mx-auto bg-gray-200/60" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section Skeleton */}
      <section className="py-16 bg-[#FDFDF0]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-80 mx-auto bg-gray-200/80 mb-4" />
            <Skeleton className="h-6 w-96 mx-auto bg-gray-200/60" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-xl overflow-hidden shadow-lg"
              >
                <Skeleton className="h-48 w-full bg-gray-200/80" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4 bg-gray-200/70" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-gray-200/50" />
                    <Skeleton className="h-4 w-5/6 bg-gray-200/50" />
                    <Skeleton className="h-4 w-4/5 bg-gray-200/50" />
                  </div>
                  <div className="pt-4">
                    <Skeleton className="h-10 w-full bg-gray-200/60 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section Skeleton */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-12 w-2/3 mx-auto bg-gray-200/80" />
            <Skeleton className="h-6 w-4/5 mx-auto bg-gray-200/60" />
            <Skeleton className="h-6 w-3/4 mx-auto bg-gray-200/60" />
            <div className="pt-6">
              <Skeleton className="h-14 w-56 mx-auto bg-gray-200/70 rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function SimplePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFDF0] w-full">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <Skeleton className="h-12 w-1/2 mx-auto" />
          <div className="space-y-4 max-w-2xl mx-auto">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-5/6 mx-auto" />
          </div>
          <Skeleton className="h-12 w-40 mx-auto rounded-lg" />
        </div>
      </div>
    </div>
  );
}
