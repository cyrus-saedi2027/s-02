import { identity } from "@/data/site";

/**
 * Where a submitted enquiry goes.
 *
 * Set `VITE_CONTACT_ENDPOINT` to a URL that accepts a JSON POST — a Formspree
 * form, a Resend-backed function, a Worker, whatever the site is hosted
 * beside — and the form posts to it. That is the whole configuration.
 *
 * Left unset, the form does what it did before: composes the message and hands
 * it to the visitor's own mail client. That fallback is not a placeholder to
 * be embarrassed about. This site can be served as a single file from disk,
 * where there is no server to post to at all, and a form that quietly failed
 * there would be worse than one that says plainly where the message went.
 */
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

export type Enquiry = { name: string; email: string; message: string };

/** How the message actually left, so the confirmation can say the truth. */
export type SendResult = { via: "endpoint" | "mail" };

export function hasEndpoint() {
  return Boolean(ENDPOINT);
}

export async function sendEnquiry(enquiry: Enquiry): Promise<SendResult> {
  if (!ENDPOINT) {
    const body = `${enquiry.message}\n\n— ${enquiry.name} (${enquiry.email})`;
    window.location.href =
      `mailto:${identity.email}` +
      `?subject=${encodeURIComponent(`Project enquiry from ${enquiry.name}`)}` +
      `&body=${encodeURIComponent(body)}`;
    return { via: "mail" };
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(enquiry),
  });

  // Anything but a 2xx is a failure the visitor needs to hear about, rather
  // than a spinner that stops and a form that looks like it worked.
  if (!res.ok) {
    throw new Error(`The form endpoint answered ${res.status}.`);
  }

  return { via: "endpoint" };
}
