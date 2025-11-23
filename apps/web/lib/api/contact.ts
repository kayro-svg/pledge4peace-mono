interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function submitContactForm(data: ContactForm, turnstileToken?: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/contact/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, turnstileToken }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to submit contact form");
  }

  return response.json();
}
