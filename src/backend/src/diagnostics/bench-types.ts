export type BenchCtx = {
  organization: { organizationId: string };
  adminUser: { userId: string };
  memberUser: { userId: string };
};

export type BenchSpec<TInputs> = {
  name: string;
  tags: string[];
  warmups?: number;
  runs?: number;
  prepare: (ctx: BenchCtx) => Promise<{ inputs: TInputs } | { skip: string }>;
  run: (inputs: TInputs, ctx: BenchCtx) => Promise<void>;
};
