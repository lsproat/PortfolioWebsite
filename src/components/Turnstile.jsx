import { useEffect, useRef, useState } from "react";

let scriptPromise;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const timeout = window.setTimeout(fail, 15000);
      function fail() {
        window.clearTimeout(timeout);
        script.remove();
        scriptPromise = undefined;
        reject(new Error("Verification unavailable"));
      }
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => {
        window.clearTimeout(timeout);
        if (window.turnstile) resolve(window.turnstile);
        else fail();
      };
      script.onerror = fail;
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export function Turnstile({ onToken, resetKey }) {
  const container = useRef(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const sitekey = import.meta.env.CLOUDFLARE_TURNSTILE_SITE_KEY?.trim();

  useEffect(() => {
    if (!sitekey) return;
    let active = true;
    let widget;
    let api;
    const invalidate = () => { if (active) onToken(""); };
    const error = () => {
      if (!active) return;
      onToken("");
      setFailed(true);
    };
    loadTurnstile().then((turnstile) => {
      if (!active) return;
      api = turnstile;
      widget = api.render(container.current, {
        sitekey,
        theme: "auto",
        appearance: "interaction-only",
        action: "contact_form",
        "response-field": false,
        callback: (token) => {
          if (!active) return;
          setFailed(false);
          onToken(token);
        },
        "expired-callback": invalidate,
        "timeout-callback": error,
        "error-callback": error,
      });
    }).catch(error);
    return () => {
      active = false;
      if (widget !== undefined) api.remove(widget);
    };
  }, [sitekey, onToken, resetKey, attempt]);

  return (
    <div>
      <div ref={container} />
      {(!sitekey || failed) && (
        <p role="status" className="text-sm text-muted-foreground">
          Verification is unavailable. Please try again later.
          {sitekey && (
            <button type="button" className="ml-2 underline focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => { onToken(""); setFailed(false); setAttempt((value) => value + 1); }}>
              Retry verification
            </button>
          )}
        </p>
      )}
    </div>
  );
}
