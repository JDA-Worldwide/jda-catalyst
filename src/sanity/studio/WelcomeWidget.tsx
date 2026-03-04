"use client";

import { useClient } from "sanity";
import { useEffect, useState } from "react";
import { DashboardWidgetContainer } from "@sanity/dashboard";

interface ContentCounts {
  pages: number;
  posts: number;
  members: number;
  submissions: number;
}

function WelcomeWidgetComponent() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [counts, setCounts] = useState<ContentCounts | null>(null);

  useEffect(() => {
    client
      .fetch(
        `{
          "pages": count(*[_type == "page"]),
          "posts": count(*[_type == "blogPost"]),
          "members": count(*[_type == "teamMember"]),
          "submissions": count(*[_type == "formSubmission"])
        }`
      )
      .then(setCounts)
      .catch(() => setCounts(null));
  }, [client]);

  return (
    <DashboardWidgetContainer header="Overview">
      <div style={{ padding: "1.25rem" }}>
        {counts ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "1rem",
            }}
          >
            <StatCard label="Pages" count={counts.pages} />
            <StatCard label="Blog Posts" count={counts.posts} />
            <StatCard label="Team Members" count={counts.members} />
            <StatCard label="Submissions" count={counts.submissions} />
          </div>
        ) : (
          <p style={{ margin: 0, opacity: 0.6 }}>Loading...</p>
        )}
      </div>
    </DashboardWidgetContainer>
  );
}

function StatCard({ label, count }: { label: string; count: number }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "1rem",
        borderRadius: "6px",
        border: "1px solid var(--card-border-color)",
        background: "var(--card-bg-color)",
      }}
    >
      <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: "0.8125rem", marginTop: "0.375rem", opacity: 0.7 }}>{label}</div>
    </div>
  );
}

export default function welcomeWidget() {
  return {
    name: "welcome",
    component: WelcomeWidgetComponent,
    layout: { width: "full" as const },
  };
}
