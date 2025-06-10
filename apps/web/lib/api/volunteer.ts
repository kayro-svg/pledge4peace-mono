interface VolunteerApplication {
  name: string;
  email: string;
  about: string;
  skills: string;
  availability: string;
}

export async function submitVolunteerApplication(data: VolunteerApplication) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/volunteer/apply`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to submit volunteer application"
    );
  }

  return response.json();
}
