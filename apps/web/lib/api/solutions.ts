import { Solution, Comment, CreateCommentDto } from "@/lib/types/index";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not defined");
}

export async function getSolutions(campaignId: string): Promise<Solution[]> {
  const session = await getSession();
  const response = await fetch(`${API_URL}/campaigns/${campaignId}/solutions`, {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  if (!response.ok) {
    throw new Error("Failed to fetch solutions");
  }

  return response.json();
}

export async function likeSolution(solutionId: string): Promise<void> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_URL}/solutions/${solutionId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to like solution");
  }
}

export async function unlikeSolution(solutionId: string): Promise<void> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_URL}/solutions/${solutionId}/unlike`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to unlike solution");
  }
}

export async function getComments(solutionId: string): Promise<Comment[]> {
  const session = await getSession();
  const response = await fetch(`${API_URL}/solutions/${solutionId}/comments`, {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }

  return response.json();
}

export async function createComment(data: CreateCommentDto): Promise<Comment> {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${API_URL}/solutions/${data.solutionId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return response.json();
}
