import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getEmbedVideoUrl, isValidVideoUrl } from "../src/lib/video.ts";

describe("exercise video URL helpers", () => {
  it("validates http and https URLs and rejects unsafe schemes", () => {
    assert.equal(isValidVideoUrl("https://www.youtube.com/watch?v=abc123"), true);
    assert.equal(isValidVideoUrl("http://example.com/demo.mp4"), true);
    assert.equal(isValidVideoUrl("javascript:alert(1)"), false);
    assert.equal(isValidVideoUrl(""), false);
    assert.equal(isValidVideoUrl(null), false);
  });

  it("converts YouTube and Vimeo URLs to embeddable URLs", () => {
    assert.equal(
      getEmbedVideoUrl("https://www.youtube.com/watch?v=2SHsk9AzdjA"),
      "https://www.youtube.com/embed/2SHsk9AzdjA"
    );
    assert.equal(
      getEmbedVideoUrl("https://youtu.be/2SHsk9AzdjA"),
      "https://www.youtube.com/embed/2SHsk9AzdjA"
    );
    assert.equal(
      getEmbedVideoUrl("https://vimeo.com/123456789"),
      "https://player.vimeo.com/video/123456789"
    );
    assert.equal(getEmbedVideoUrl("javascript:alert(1)"), null);
  });
});
