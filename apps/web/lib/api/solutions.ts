import { Solution, Comment, CreateCommentDto } from "@/lib/types/index";
import { getSession } from "next-auth/react";
import { API_ENDPOINTS } from "@/lib/config";
import { API_URL } from "@/lib/config";

export async function getSolutions(campaignId: string): Promise<Solution[]> {
  const response = await fetch(
    API_ENDPOINTS.solutions.getByCampaign(campaignId)
  );

  if (!response.ok) {
    throw new Error("Failed to fetch solutions");
  }

  return response.json();
}

export async function likeSolution(solutionId: string) {
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

  return response.json();
}

export async function dislikeSolution(solutionId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_URL}/solutions/${solutionId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to dislike solution");
  }

  return response.json();
}

export async function shareSolution(solutionId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_URL}/solutions/${solutionId}/share`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to share solution");
  }

  return response.json();
}

export async function getSolutionStats(solutionId: string) {
  const session = await getSession();
  const response = await fetch(`${API_URL}/solutions/${solutionId}/stats`, {
    headers: session?.accessToken
      ? { Authorization: `Bearer ${session.accessToken}` }
      : {},
  });

  if (!response.ok) {
    throw new Error("Failed to get solution stats");
  }

  return response.json();
}

export async function getUserInteractions(solutionId: string) {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(
    `${API_URL}/solutions/${solutionId}/user-interactions`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get user interactions");
  }

  return response.json();
}

// export async function unlikeSolution(solutionId: string): Promise<void> {
//   const session = await getSession();
//   if (!session?.accessToken) {
//     throw new Error("Authentication required");
//   }

//   const response = await fetch(API_ENDPOINTS.solutions.like(solutionId), {
//     method: "DELETE",
//     headers: {
//       Authorization: `Bearer ${session.accessToken}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Failed to unlike solution");
//   }
// }

export async function getComments(solutionId: string): Promise<Comment[]> {
  const session = await getSession();
  const response = await fetch(
    API_ENDPOINTS.comments.getBySolution(solutionId),
    {
      headers: session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {},
    }
  );

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

  const response = await fetch(API_ENDPOINTS.comments.create(data.solutionId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return response.json();
}
