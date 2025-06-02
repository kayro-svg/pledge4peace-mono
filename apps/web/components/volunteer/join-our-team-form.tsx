import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function JoinOurTeamForm() {
  return (
    <section className="py-16 px-4 bg-[#FDFDF0]" id="volunteer-form">
      <div className="  mx-auto max-w-3xl">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#2F4858] mb-4">
              Join Our Volunteer Team
            </h2>
            <p className="text-gray-600">
              Ready to transform your passion into action? Fill out the form
              below to join our global network of peace advocates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <Input id="name" placeholder="Your full name" />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <Input id="email" type="email" placeholder="Your email address" />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="about"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                A Little About Yourself
              </label>
              <textarea
                id="about"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us about yourself and why you want to volunteer"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Skills & Availability
              </label>
              <textarea
                id="skills"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Please let us know your availability and skills you can offer"
              />
            </div>

            <div className="md:col-span-2">
              <Button
                type="submit"
                className="w-full bg-[#2f4858] hover:bg-[#1e2f38] text-white py-3"
              >
                Submit Application
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
