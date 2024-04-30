import type { ApiDefinition } from '../../analyzer';

export type OpenApiOutputGenerator = {
  generate: (definition: ApiDefinition, out: string) => void;
};
