import { relations } from "drizzle-orm";
import { solutions } from "./solutions";
import { comments } from "./comments";
import { solutionInteractions } from "./interactions";
import { pledges } from "./pledges";

// Relaciones para la tabla solutions
export const solutionsRelations = relations(solutions, ({ many }) => ({
  comments: many(comments),
  interactions: many(solutionInteractions),
}));

// Relaciones para la tabla comments
export const commentsRelations = relations(comments, ({ one, many }) => ({
  solution: one(solutions, {
    fields: [comments.solutionId],
    references: [solutions.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

// Relaciones para la tabla solutionInteractions
export const solutionInteractionsRelations = relations(
  solutionInteractions,
  ({ one }) => ({
    solution: one(solutions, {
      fields: [solutionInteractions.solutionId],
      references: [solutions.id],
    }),
  })
);

// Relaciones para la tabla pledges (si es necesario)
export const pledgesRelations = relations(pledges, ({ one }) => ({}));
