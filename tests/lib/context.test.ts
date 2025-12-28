import { describe, it, expect } from "bun:test";
import { parseRemoteUrl } from "../../src/lib/context.js";

describe("parseRemoteUrl", () => {
  describe("SSH URLs", () => {
    it("should parse standard SSH URL", () => {
      const result = parseRemoteUrl("git@bitbucket.org:myworkspace/myrepo.git");
      expect(result).toEqual({
        workspace: "myworkspace",
        repoSlug: "myrepo",
      });
    });

    it("should parse SSH URL without .git suffix", () => {
      const result = parseRemoteUrl("git@bitbucket.org:myworkspace/myrepo");
      expect(result).toEqual({
        workspace: "myworkspace",
        repoSlug: "myrepo",
      });
    });
  });

  describe("HTTPS URLs", () => {
    it("should parse standard HTTPS URL", () => {
      const result = parseRemoteUrl("https://bitbucket.org/myworkspace/myrepo.git");
      expect(result).toEqual({
        workspace: "myworkspace",
        repoSlug: "myrepo",
      });
    });

    it("should parse HTTPS URL without .git suffix", () => {
      const result = parseRemoteUrl("https://bitbucket.org/myworkspace/myrepo");
      expect(result).toEqual({
        workspace: "myworkspace",
        repoSlug: "myrepo",
      });
    });

    it("should parse HTTPS URL with username", () => {
      const result = parseRemoteUrl("https://user@bitbucket.org/myworkspace/myrepo.git");
      expect(result).toEqual({
        workspace: "myworkspace",
        repoSlug: "myrepo",
      });
    });
  });

  describe("Invalid URLs", () => {
    it("should return null for GitHub URLs", () => {
      const result = parseRemoteUrl("git@github.com:user/repo.git");
      expect(result).toBeNull();
    });

    it("should return null for invalid URLs", () => {
      const result = parseRemoteUrl("not-a-url");
      expect(result).toBeNull();
    });
  });
});
