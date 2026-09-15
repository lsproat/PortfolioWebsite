import assert from "node:assert/strict";
import test from "node:test";
import { createContactHandler } from "../server/contact.js";
import endpoint from "../api/contact.js";

const env = {
  RESEND_API_KEY: "test-secret",
  CLOUDFLARE_TURNSTILE_SECRET_KEY: "test-turnstile-secret",
  RESEND_FROM_EMAIL: "contact@example.com",
  CONTACT_TO_EMAIL: "inbox@example.com",
};
const valid = { name: " Visitor ", email: " visitor@example.com ", message: " Hello from the contact form. ", website: "", turnstileToken: "test-token" };
function setup(overrides = {}) {
  const calls = { verify: [], emails: [] };
  const handler = createContactHandler({
    env,
    fetchImpl: async (...args) => {
      calls.verify.push(args);
      return Response.json({ success: true, action: "contact_form" });
    },
    sendEmail: async (...args) => {
      calls.emails.push(args);
      return { data: { id: "email-id" }, error: null };
    },
    ...overrides,
  });
  const send = (body = valid, options = {}) => handler(new Request("https://portfolio.example/api/contact", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), ...options,
  }));
  return { calls, send, handler };
}

test("Vercel endpoint exports a Web fetch handler", () => {
  assert.equal(typeof endpoint.fetch, "function");
});

test("valid input is trimmed, verified, and sent as plain text with a fixed sender", async () => {
  const { send, calls } = setup();
  const response = await send({ ...valid, message: " <b>Plain text only</b> " });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(calls.verify.length, 1);
  assert.equal(calls.verify[0][0], "https://challenges.cloudflare.com/turnstile/v0/siteverify");
  assert.equal(calls.verify[0][1].body.get("secret"), env.CLOUDFLARE_TURNSTILE_SECRET_KEY);
  assert.equal(calls.verify[0][1].body.get("response"), "test-token");
  assert.deepEqual(calls.emails, [[env.RESEND_API_KEY, {
    from: "Portfolio Contact <contact@example.com>", to: ["inbox@example.com"],
    replyTo: "visitor@example.com", subject: "Portfolio contact from Visitor",
    text: "Name: Visitor\nEmail: visitor@example.com\n\nMessage:\n<b>Plain text only</b>",
  }]]);
});

test("honeypot returns normal success without contacting either provider", async () => {
  for (const website of ["spam.example", " "]) {
    const { send, calls } = setup();
    const response = await send({ ...valid, website, turnstileToken: "" });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.deepEqual(calls, { verify: [], emails: [] });
  }
});

test("invalid input is rejected before provider calls", async () => {
  const invalid = [null, [], {}, { ...valid, website: null }, { ...valid, message: 123 }];
  for (const [field, values] of Object.entries({
    name: ["", "   ", "a".repeat(101), "Name\r\nBcc: attack@example.com"],
    email: ["bad", "a@b", "a@b.com\nBcc:x@y.com", "a".repeat(250) + "@b.com"],
    message: ["short", " ".repeat(10), "x".repeat(5001), "hello\0world"],
    turnstileToken: ["", " ", "x".repeat(2049)],
  })) for (const value of values) invalid.push({ ...valid, [field]: value });
  for (const input of invalid) {
    const { send, calls } = setup();
    assert.equal((await send(input)).status, 400);
    assert.deepEqual(calls, { verify: [], emails: [] });
  }
});

test("valid boundary lengths and Unicode are accepted", async () => {
  for (const message of ["x".repeat(10), "界".repeat(5000)]) {
    const { send } = setup();
    assert.equal((await send({ ...valid, name: "é".repeat(100), message, turnstileToken: "x".repeat(2048) })).status, 200);
  }
});

test("method, JSON, and request size are enforced", async () => {
  const { handler, send, calls } = setup();
  const get = await handler(new Request("https://portfolio.example/api/contact"));
  assert.equal(get.status, 405);
  assert.equal(get.headers.get("allow"), "POST");
  assert.equal((await send(valid, { headers: { "Content-Type": "text/plain" } })).status, 415);
  assert.equal((await send(valid, { body: "{" })).status, 400);
  assert.equal((await send(valid, { headers: { "Content-Type": "application/json", "Content-Length": "40000" } })).status, 413);
  assert.equal((await send({ ...valid, extra: "x".repeat(33000) })).status, 413);
  assert.deepEqual(calls, { verify: [], emails: [] });
});

test("streamed requests cannot bypass the size limit", async () => {
  const { handler, calls } = setup();
  const body = new ReadableStream({ start(controller) {
    controller.enqueue(new Uint8Array(20000));
    controller.enqueue(new Uint8Array(20000));
    controller.close();
  } });
  const response = await handler(new Request("https://portfolio.example/api/contact", {
    method: "POST", headers: { "Content-Type": "application/json" }, body, duplex: "half",
  }));
  assert.equal(response.status, 413);
  assert.deepEqual(calls, { verify: [], emails: [] });
});

test("failed, expired, reused, or wrong-action tokens never send email", async () => {
  for (const result of [
    { success: false }, { success: false, "error-codes": ["timeout-or-duplicate"] },
    { success: true }, { success: true, action: "login" }, { success: "true", action: "contact_form" },
  ]) {
    const { send, calls } = setup({ fetchImpl: async () => Response.json(result) });
    assert.equal((await send()).status, 400);
    assert.equal(calls.emails.length, 0);
  }
});

test("provider failures expose only generic errors", async () => {
  const internal = "private provider details and test-secret";
  for (const fetchImpl of [
    async () => { throw new Error(internal); },
    async () => new Response(internal, { status: 500 }),
    async () => new Response("invalid JSON"),
  ]) {
    const { send, calls } = setup({ fetchImpl });
    const response = await send();
    assert.equal(response.status, 503);
    assert.equal((await response.text()).includes(internal), false);
    assert.equal(calls.emails.length, 0);
  }
  for (const sendEmail of [
    async () => { throw new Error(internal); },
    async () => ({ error: { message: internal }, data: null }),
    async () => ({ data: null, error: null }),
  ]) {
    const { send } = setup({ sendEmail });
    const response = await send();
    assert.equal(response.status, 502);
    assert.equal((await response.text()).includes(internal), false);
  }
});

test("missing configuration fails closed without exposing it", async () => {
  for (const key of Object.keys(env)) {
    const { send, calls } = setup({ env: { ...env, [key]: "" } });
    const response = await send();
    assert.equal(response.status, 503);
    assert.equal((await response.text()).includes(key), false);
    assert.deepEqual(calls, { verify: [], emails: [] });
  }
});
