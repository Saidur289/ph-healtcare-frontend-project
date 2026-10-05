// plan.md 12.5: avatars ask Cloudinary for a small copy instead of the full upload.
import { describe, expect, it } from "vitest";
import { cloudinaryResized } from "@/lib/cloudinaryImage";

describe("cloudinaryResized", () => {
  it("adds a crop / resize / auto-format step to public Cloudinary uploads", () => {
    expect(cloudinaryResized("https://res.cloudinary.com/demo/image/upload/v1700000000/ph/photo.jpg", 192)).toBe(
      "https://res.cloudinary.com/demo/image/upload/c_fill,g_face,w_192,h_192,f_auto,q_auto/v1700000000/ph/photo.jpg",
    );
  });

  it("leaves other URLs alone", () => {
    for (const url of [
      "https://example.com/photo.jpg",
      "https://res.cloudinary.com/demo/raw/upload/v1/file.pdf",
      "https://res.cloudinary.com/demo/image/authenticated/s--x--/v1/private.jpg",
      // already transformed
      "https://res.cloudinary.com/demo/image/upload/w_100/v1/photo.jpg",
    ]) {
      expect(cloudinaryResized(url, 192)).toBe(url);
    }
  });

  it("passes empty values through", () => {
    expect(cloudinaryResized(undefined, 192)).toBeUndefined();
    expect(cloudinaryResized(null, 192)).toBeUndefined();
    expect(cloudinaryResized("", 192)).toBe("");
  });
});
