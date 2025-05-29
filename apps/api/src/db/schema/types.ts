import { comments } from './comments';
import { solutions } from './solutions';
import { users } from './users';
import { solutionInteractions } from './interactions';
import { pledges } from './pledges';

export type DatabaseSchema = {
  comments: typeof comments;
  solutions: typeof solutions;
  users: typeof users;
  solutionInteractions: typeof solutionInteractions;
  pledges: typeof pledges;
};
