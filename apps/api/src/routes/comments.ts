import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { comments } from "../db/schema/comments";

const commentsRoutes = new Hono();

// Get all comments for a solution
commentsRoutes.get("/:solutionId", async (c) => {
  const { solutionId } = c.req.param();
  const db = drizzle(c.env.DB);

  const solutionComments = await db.query.comments.findMany({
    where: (comments, { eq }) => eq(comments.solutionId, solutionId),
    orderBy: (comments, { desc }) => [desc(comments.createdAt)],
  });

  return c.json(solutionComments);
});

// Create a new comment
commentsRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const db = drizzle(c.env.DB);

  const newComment = await db.insert(comments).values({
    id: crypto.randomUUID(),
    ...body,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return c.json(newComment);
});

// Update a comment
commentsRoutes.patch("/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const db = drizzle(c.env.DB);

  const updatedComment = await db
    .update(comments)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where((comments, { eq }) => eq(comments.id, id));

  return c.json(updatedComment);
});

// Delete a comment (soft delete)
commentsRoutes.delete("/:id", async (c) => {
  const { id } = c.req.param();
  const db = drizzle(c.env.DB);

  await db
    .update(comments)
    .set({
      status: "deleted",
      updatedAt: new Date(),
    })
    .where((comments, { eq }) => eq(comments.id, id));

  return c.json({ success: true });
});

export { commentsRoutes };
