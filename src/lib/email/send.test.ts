import { test } from "node:test";
import assert from "node:assert/strict";
import { sendTransactionalEmail } from "./send";

const ORIGINAL_KEY = process.env.RESEND_API_KEY;
const ORIGINAL_FROM = process.env.RESEND_FROM_EMAIL;

test("falls back to preview_only when Resend is not configured", async () => {
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM_EMAIL;

  const result = await sendTransactionalEmail("patient@example.com", {
    subject: "Test subject",
    html: "<p>Hello</p>",
    text: "Hello",
  });

  assert.equal(result.status, "preview_only");
  assert.equal(result.providerId, null);
  assert.ok(result.preview);
  assert.equal(result.preview?.to, "patient@example.com");
  assert.equal(result.preview?.subject, "Test subject");
  assert.equal(result.preview?.html, "<p>Hello</p>");
  assert.match(result.preview?.generatedAt ?? "", /^\d{4}-\d{2}-\d{2}T/);

  if (ORIGINAL_KEY) process.env.RESEND_API_KEY = ORIGINAL_KEY;
  if (ORIGINAL_FROM) process.env.RESEND_FROM_EMAIL = ORIGINAL_FROM;
});

test("falls back to preview_only when only the API key is missing", async () => {
  delete process.env.RESEND_API_KEY;
  process.env.RESEND_FROM_EMAIL = "clinic@example.com";

  const result = await sendTransactionalEmail("patient@example.com", {
    subject: "Test subject",
    html: "<p>Hello</p>",
    text: "Hello",
  });

  assert.equal(result.status, "preview_only");

  delete process.env.RESEND_FROM_EMAIL;
  if (ORIGINAL_KEY) process.env.RESEND_API_KEY = ORIGINAL_KEY;
  if (ORIGINAL_FROM) process.env.RESEND_FROM_EMAIL = ORIGINAL_FROM;
});
