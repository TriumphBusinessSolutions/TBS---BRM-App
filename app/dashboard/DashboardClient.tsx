"use client";

import { useState } from "react";

import BusinessInformationModal from "./BusinessInformationModal";

export default function DashboardClient() {
  const [isModalOpen, setModalOpen] = useState(true);

  return (
    <div className="dashboard-shell">
      <div className="dashboard-inner">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <span className="brand-glyph">TB</span>
            <div className="brand-title">
              <span>Triumph dashboard</span>
              <span>Business Revenue Model</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="settings-button" type="button" aria-label="Open settings menu">
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 7h12M5 11h12M5 15h12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="primary-button" type="button" onClick={() => setModalOpen(true)}>
              Update business info
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <section className="hero-panel">
            <div className="hero-copy">
              <span className="hero-kicker">Client growth dashboard</span>
              <h1 className="hero-title">Build momentum with clarity</h1>
              <p className="hero-description">
                Every session starts with the metrics that matter. Track revenue targets, highlight the offers propelling your
                growth, and uncover the next best move for your team.
              </p>
              <div className="hero-actions">
                <button className="primary-button" type="button" onClick={() => setModalOpen(true)}>
                  Complete business snapshot
                </button>
                <button className="secondary-button" type="button">
                  Explore roadmap
                </button>
              </div>
            </div>
            <div className="hero-metrics">
              <div className="metric-card">
                <span className="metric-label">Monthly revenue goal</span>
                <span className="metric-value">$40k</span>
                <span className="metric-caption">Keep the target visible to focus every sprint.</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Active growth lever</span>
                <span className="metric-value">Pipeline</span>
                <span className="metric-caption">Double down on the channel bringing in ready buyers.</span>
              </div>
            </div>
          </section>

          <section className="dashboard-grid">
            <article className="dashboard-card">
              <h2 className="card-title">Weekly focus</h2>
              <p className="card-description">
                Align your mentor sessions around one growth lever. Capture the plays moving revenue, retention, and fulfillment
                forward.
              </p>
              <p className="card-footnote">Updated every Monday</p>
            </article>
            <article className="dashboard-card">
              <h2 className="card-title">Offer stack</h2>
              <p className="card-description">
                Map the signature offer plus ascension paths. Ensure pricing, promise, and delivery are dialed to your current
                BRM level.
              </p>
              <p className="card-footnote">3 slots to refine</p>
            </article>
            <article className="dashboard-card">
              <h2 className="card-title">Growth milestones</h2>
              <p className="card-description">
                Visualize the next checkpoints on your roadmap. Celebrate wins and unlock resources tailored to what’s next.
              </p>
              <p className="card-footnote">Automated from Supabase</p>
            </article>
          </section>

          <section className="dashboard-updates">
            <h2>What happens next</h2>
            <ul className="update-list">
              <li>Finalize your business profile so Triumph can personalize prompts and resources.</li>
              <li>Invite your mentor to review this dashboard ahead of your next accountability call.</li>
              <li>Drop upcoming launches, hiring milestones, or constraints in the notes section of the form.</li>
            </ul>
          </section>
        </main>
      </div>

      <BusinessInformationModal open={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
