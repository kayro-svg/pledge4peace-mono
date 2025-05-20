import { MessageCircle, Award } from "lucide-react";

export default function ContactInformation() {
  return (
    <div className="my-20 grid md:grid-cols-2 gap-12">
      <div className="bg-white p-8 rounded-3xl shadow-lg">
        <div className="w-12 h-12 rounded-full bg-white border-[3px] border-[#548281] flex items-center justify-center mb-4">
          <MessageCircle className="h-6 w-6 text-[#548281]" />
        </div>
        <h3 className="text-2xl font-bold mb-6 text-[#2F4858]">Get in touch</h3>
        <div className="space-y-4 text-lg">
          <p className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Address:</span>
            <span>3393 NY-6, South New Berlin, NY 13843</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Phone:</span>
            <span>+1 862-666-1636</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Email:</span>
            <span>info@pledge4peace.org</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-lg">
        <div className="w-12 h-12 rounded-full bg-white border-[3px] border-[#548281] flex items-center justify-center mb-4">
          <Award className="h-6 w-6 text-[#548281]" />
        </div>
        <h3 className="text-2xl font-bold mb-6 text-[#2F4858]">
          Our Commitment
        </h3>
        <p className="text-lg text-gray-700">
          Pledge4Peace.org advocates for peace, democracy, and equal rights for
          all, regardless of religion, color, ethnicity, gender etc. Our mission
          is to strengthen global democracy by inspiring the peace-loving silent
          majority. Operated entirely by peace volunteers, we do not accept
          donations for ourselves but encourage pledges and contributions to
          political parties ranked high on the Peace and Democracy Index.
        </p>
      </div>
    </div>
  );
}
