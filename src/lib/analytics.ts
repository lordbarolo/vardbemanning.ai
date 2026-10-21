import type { PostHog } from "posthog-js";

export const POSTHOG_KEY = "phc_AFPm7q5MQPFhR8cNu3LiRapyRaanNZNKWN2hzZrRkDoY";
export type LookupProps = {
  outcome: "single" | "candidates" | "empty";
  role_code?: string | undefined;
  municipality_code?: string | undefined;
  zone?: number | undefined;
  role_match?: string | undefined;
  municipality_match?: string | undefined;
  candidate_count: number;
};

let client: Promise<PostHog | undefined> | undefined;
let lastPageUrl: string | undefined;

export function isInternalTraffic(hostname: string) {
  return hostname === "localhost" || hostname.endsWith(".lovableproject.com") ||
    hostname.endsWith(".lovable.app") || hostname.startsWith("id-preview--");
}

function loadAnalytics() {
  if (typeof window === "undefined") return Promise.resolve(undefined);
  client ??= import("posthog-js").then(({ default: posthog }) => {
    posthog.init(POSTHOG_KEY, {
      api_host: "https://zacslqpaqpzxmdyxwjll.supabase.co/functions/v1/ph-proxy",
      ui_host: "https://eu.posthog.com",
      persistence: "memory",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      person_profiles: "never",
      ip: false,
      advanced_disable_flags: true,
      loaded: (instance) => instance.register({
        $ip: null,
        site: "vardbemanning.ai",
        surface: "web",
        is_internal_traffic: isInternalTraffic(window.location.hostname),
      }),
    });
    return posthog;
  }).catch(() => undefined);
  return client;
}

function capture(event: string, properties: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const currentUrl = window.location.origin + window.location.pathname;
  void loadAnalytics().then((posthog) => {
    posthog?.capture(event, { ...properties, $ip: null, $current_url: currentUrl });
  }).catch(() => undefined);
}

export function trackPageview(navigation = false) {
  if (typeof window === "undefined") return;
  const url = window.location.origin + window.location.pathname;
  if (!navigation && url === lastPageUrl) return;
  lastPageUrl = url;
  capture("$pageview", {});
}

export function trackLookup(props: LookupProps) {
  // Explicit allowlist: never forward field text or arbitrary caller properties.
  capture("lookup_completed", {
    outcome: props.outcome,
    role_code: props.role_code,
    municipality_code: props.municipality_code,
    zone: props.zone,
    role_match: props.role_match,
    municipality_match: props.municipality_match,
    candidate_count: props.candidate_count,
  });
}

export function trackConnectorCta(target: "claude" | "chatgpt" | "docs") {
  capture("connector_cta_clicked", { target });
}