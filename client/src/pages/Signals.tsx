import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bot, Download, Loader2, LockKeyhole } from "lucide-react";
import { Link } from "wouter";

export default function Signals() {
  const { user, loading } = useAuth();
  const isPreview = typeof window !== "undefined" && (window.location.hostname.includes("manus.computer") || window.location.hostname === "localhost");
  const exportQuery = trpc.waitlist.exportCsv.useQuery(undefined, { enabled: user?.role === "admin" });
  const telegramSetup = trpc.telegram.configureReporting.useMutation();

  const downloadCsv = () => {
    if (!exportQuery.data) return;
    const blob = new Blob([exportQuery.data.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportQuery.data.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="signals-shell">
      <Link href="/" className="signals-back"><ArrowLeft size={15} /> Return to Edison</Link>
      <section className="signals-card">
        <div className="signals-kicker"><LockKeyhole size={14} /> Owner access</div>
        <p className="eyebrow warm">Edison / Signals</p>
        <h1>Keep every signal<br /><em>within reach.</em></h1>
        <p>Download the complete waitlist ledger whenever you need it. This route is available only to the Edison owner.</p>
        {loading ? <Loader2 className="signals-loader" aria-label="Checking access" /> : !user ? (
          <button className="signals-action" onClick={startLogin}>Sign in to export <ArrowLeft size={16} className="reverse" /></button>
        ) : user.role !== "admin" ? (
          <p className="signals-notice">Your account does not have owner access to this export.</p>
        ) : (
          <>
            <button className="signals-action" disabled={exportQuery.isLoading || exportQuery.isError} onClick={downloadCsv}>
              {exportQuery.isLoading ? "Preparing export…" : "Download waitlist CSV"}<Download size={16} />
            </button>
            <button className="signals-action signals-action-secondary" disabled={isPreview || telegramSetup.isPending} onClick={() => telegramSetup.mutate()}>
              {isPreview ? "Publish to activate reporting" : telegramSetup.isPending ? "Activating reporting…" : "Activate Telegram reporting"}<Bot size={16} />
            </button>
            <p className="signals-bot-help">{isPreview ? "Telegram reporting needs the published Edison domain, so activation is intentionally unavailable in preview." : <>After activation, message your bot <b>/emails</b>, <b>/total</b>, or <b>/help</b>.</>}</p>
          </>
        )}
        {exportQuery.isError && <p className="signals-notice">The export is temporarily unavailable. Please try again.</p>}
        {telegramSetup.isError && <p className="signals-notice">Telegram activation is temporarily unavailable. Please try again from the published Edison site.</p>}
        {telegramSetup.data?.requiresPublishedDomain && <p className="signals-notice">Publish Edison first, then return here and activate Telegram reporting from the published site.</p>}
        {telegramSetup.data?.activated && <p className="signals-notice signals-success">Telegram reporting is active. Your bot is ready for commands.</p>}
      </section>
    </main>
  );
}
