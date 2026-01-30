import { GitError } from './errors.js';

export interface GitResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function git(args: string[], cwd?: string): Promise<GitResult> {
  const proc = Bun.spawn(['git', ...args], {
    cwd: cwd || process.cwd(),
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode };
}

export async function gitOrThrow(
  args: string[],
  cwd?: string
): Promise<string> {
  const result = await git(args, cwd);
  if (result.exitCode !== 0) {
    throw new GitError(
      result.stderr || `Git command failed: git ${args.join(' ')}`,
      `git ${args.join(' ')}`,
      result.exitCode
    );
  }
  return result.stdout;
}

export async function clone(url: string, destination?: string): Promise<void> {
  const args = ['clone', url];
  if (destination) {
    args.push(destination);
  }
  await gitOrThrow(args);
}

export async function fetch(remote: string = 'origin'): Promise<void> {
  await gitOrThrow(['fetch', remote]);
}

export async function checkout(branch: string): Promise<void> {
  await gitOrThrow(['checkout', branch]);
}

export async function checkoutNewBranch(
  branch: string,
  startPoint?: string
): Promise<void> {
  const args = ['checkout', '-b', branch];
  if (startPoint) {
    args.push(startPoint);
  }
  await gitOrThrow(args);
}

export async function getCurrentBranch(): Promise<string> {
  return gitOrThrow(['rev-parse', '--abbrev-ref', 'HEAD']);
}

export async function getRemoteUrl(remote: string = 'origin'): Promise<string> {
  return gitOrThrow(['remote', 'get-url', remote]);
}

export async function isGitRepository(): Promise<boolean> {
  const result = await git(['rev-parse', '--is-inside-work-tree']);
  return result.exitCode === 0 && result.stdout === 'true';
}
