import Link from "next/link";
import { Activity, Zap, ShieldCheck, ArrowRight } from "lucide-react";

const highlights = [
  {
    title: "Live Orchestration",
    description: "Stream every milestone directly from carriers, ERPs, or n8n workflows in seconds.",
    icon: Activity,
  },
  {
    title: "AI Situation Room",
    description: "Summaries keep operators ahead of delays without digging through emails.",
    icon: Zap,
  },
  {
    title: "Enterprise Guardrails",
    description: "Secure SSE channels, audit trails, and Prisma-backed persistence by default.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-24 lg:px-12">
        <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">ChainTrack AI</p>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
              Real-time supply chain automation for ops teams who need answers, not dashboards.
            </h1>
            <p className="text-lg text-slate-300">
              Spin up a live control tower that captures webhooks, streams updates over SSE, and lets your
              team react before a shipment derails your SLA.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/run"
                className="inline-flex items-center rounded-full bg-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400"
              >
                Launch Live Tracking
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="https://github.com/PreeNJ/supplychain-pipeline-orchestrator"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                View Source
              </a>
            </div>
            <div className="flex flex-wrap gap-8 text-sm text-slate-400">
              <div>
                <p className="text-3xl font-semibold text-white">2 min</p>
                <p>Mock pipeline to full delivery</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-white">∞</p>
                <p>Extensible connectors</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-white">100%</p>
                <p>Server-driven UI updates</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-white/5 p-8 shadow-2xl shadow-indigo-900/40">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6">
              <p className="text-sm text-indigo-200">Live event stream</p>
              <div className="mt-4 space-y-4">
                {["Label created", "Picked up", "In transit", "Arrived at hub"].map((event, index) => (
                  <div key={event} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                    <div>
                      <p className="font-semibold text-white">{event}</p>
                      <p className="text-sm text-slate-400">+{index * 32} mins · AI verdict looks good</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-slate-400">
              Powered by Next.js App Router • SSE • Prisma
            </p>
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 md:grid-cols-3">
          {highlights.map(({ title, description, icon: Icon }) => (
            <div key={title} className="space-y-3">
              <div className="inline-flex rounded-full bg-indigo-500/20 p-3 text-indigo-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="text-slate-300">{description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
