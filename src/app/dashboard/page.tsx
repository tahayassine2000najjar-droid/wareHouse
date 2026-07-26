"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-surface-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const loginDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="dashboard-container">
      <div className="dash-card">
        <div className="dash-card-header">
          <div>
            <h1 className="dash-welcome">
              Welcome, {session.user.name}!
            </h1>
            <p className="dash-date">{loginDate}</p>
          </div>
        </div>

        <div className="welcome-banner">
          <h2>WarehouseOS Dashboard</h2>
          <p>
            Manage your products, categories and stock. Everything is ready for
            the next sprint.
          </p>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon user">&#9786;</div>
            <div>
              <p className="info-label">Full Name</p>
              <p className="info-value">{session.user.name}</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon email">&#9993;</div>
            <div>
              <p className="info-label">Email</p>
              <p className="info-value">{session.user.email}</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon calendar">&#9719;</div>
            <div>
              <p className="info-label">Login Date</p>
              <p className="info-value">{loginDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
