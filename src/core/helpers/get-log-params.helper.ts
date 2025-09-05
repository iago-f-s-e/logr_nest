import type { CatchExceptionOptions } from '../../types';

export function getLogParams(
  args: any[],
  options: CatchExceptionOptions,
): any[] {
  if (!options) return args;

  if (options.hideParams) return ['WAS HIDDEN'];

  if (!options.pipeParams) return args;

  const pipped = options.pipeParams(...args);

  return Array.isArray(pipped) ? pipped : [pipped];
}
