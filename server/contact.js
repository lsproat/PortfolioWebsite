import { Resend } from "resend";

const MAX_BODY_BYTES = 32 * 1024;
// Reject header controls intentionally, including characters outside whitespace.
// eslint-disable-next-line no-control-regex
const emailPattern =
  /^[^\s@<>(),;:\\"\u0000-\u001f\u007f]+@[^\s@<>(),;:\\"\u0000-\u001f\u007f]+\.[^\s@<>(),;:\\"\u0000-\u001f\u007f]+$/;
// eslint-disable-next-line no-control-regex
const singleLine = /^[^\u0000-\u001f\u007f]+$/;
const success = { ok: true };
const reply = (status, body, headers = {}) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
const fail = (status, error) => reply(status, { error });

async function readBody(request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    throw new RangeError();
  }
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

export function createContactHandler({
  env = process.env,
  fetchImpl = fetch,
  sendEmail = (key, email) => new Resend(key).emails.send(email),
} = {}) {
  return async function contact(request) {
    if (request.method !== "POST") {
      return reply(405, { error: "Method not allowed." }, { Allow: "POST" });
    }
    if (
      request.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase() !== "application/json"
    ) {
      return fail(415, "Please submit JSON.");
    }
    let body;
    try {
      body = await readBody(request);
    } catch (error) {
      return fail(error instanceof RangeError ? 413 : 400, "Invalid request.");
    }
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !["name", "email", "message", "turnstileToken", "website"].every(
        (key) => typeof body[key] === "string",
      )
    ) {
      return fail(400, "Please check your form entries.");
    }
    // Deliberately indistinguishable from a delivered message for honeypot spam.
    if (body.website !== "") return reply(200, success);
    const name = body.name.trim();
    const email = body.email.trim();
    const message = body.message.trim();
    const token = body.turnstileToken.trim();
    if (
      !name ||
      name.length > 100 ||
      !singleLine.test(name) ||
      email.length > 254 ||
      !emailPattern.test(email) ||
      message.length < 10 ||
      message.length > 5000 ||
      message.includes("\0")
    ) {
      return fail(400, "Please check your form entries.");
    }
    if (!token || token.length > 2048)
      return fail(400, "Verification failed. Please try again.");

    const key = env.RESEND_API_KEY?.trim();
    const secret = env.CLOUDFLARE_TURNSTILE_SECRET_KEY?.trim();
    const to = env.CONTACT_TO_EMAIL?.trim();
    const from = env.RESEND_FROM_EMAIL?.trim();
    if (
      !key ||
      !secret ||
      !to ||
      !from ||
      !emailPattern.test(to) ||
      !emailPattern.test(from)
    ) {
      return fail(
        503,
        "Unable to send your message right now. Please try again later.",
      );
    }
    try {
      const verification = await fetchImpl(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: new URLSearchParams({ secret, response: token }),
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!verification.ok) throw new Error();
      const result = await verification.json();
      if (result.success !== true || result.action !== "contact_form") {
        return fail(400, "Verification failed. Please try again.");
      }
    } catch {
      return fail(503, "Verification is unavailable. Please try again.");
    }
    try {
      const result = await sendEmail(key, {
        from: `Portfolio Contact <${from}>`,
        to: [to],
        replyTo: email,
        subject: `Portfolio contact from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      });
      if (result.error || !result.data?.id) throw new Error();
      return reply(200, success);
    } catch {
      return fail(
        502,
        "Unable to send your message right now. Please try again later.",
      );
    }
  };
}
