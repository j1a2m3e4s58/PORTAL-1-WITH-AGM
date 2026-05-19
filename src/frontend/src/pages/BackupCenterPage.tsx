import { AppShell } from "@/components/AppShell";
import { LiveSyncBadge } from "@/components/LiveSyncBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiDownloadProductionBackup } from "@/lib/backend-client";
import { useAuth } from "@/store/auth";
import { AlertTriangle, Database, Download, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const BACKUP_ITEMS = [
  "Staff directory and profile records",
  "Announcements, forms, training videos, and training documents",
  "Notifications, video progress, document opens, and reminders",
  "Presence/session stores and audit logs",
];
const BACKUP_STORAGE_KEY = "bcb_last_backup_download";
const BACKUP_SAFETY_STEPS = [
  "Download a fresh backup before any major cPanel edit or migration.",
  "Keep one copy on your laptop and one in a secure IT-only folder.",
  "Never share the backup JSON through public WhatsApp groups.",
];

interface BackupDownloadSnapshot {
  filename: string;
  downloadedAt: number;
}

function loadLastBackupSnapshot(): BackupDownloadSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BackupDownloadSnapshot;
  } catch {
    return null;
  }
}

function persistLastBackupSnapshot(snapshot: BackupDownloadSnapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(snapshot));
}

const BACKUP_INCLUDED_ITEMS = [
  "Announcements, forms, training videos, and training documents",
  "Notifications, video progress, document opens, and reminders",
  "Presence/session stores and audit logs",
];

export default function BackupCenterPage() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [lastBackup, setLastBackup] = useState<BackupDownloadSnapshot | null>(
    () => loadLastBackupSnapshot(),
  );
  const canBackup =
    user?.role === "SuperAdmin" || user?.role === "HRAdmin";
  const lastBackupLabel = useMemo(() => {
    if (!lastBackup) return "No backup downloaded on this browser yet.";
    return `${lastBackup.filename} • ${new Date(lastBackup.downloadedAt).toLocaleString(
      "en-GB",
    )}`;
  }, [lastBackup]);

  async function handleDownload() {
    setDownloading(true);
    const result = await apiDownloadProductionBackup();
    setDownloading(false);
    if ("err" in result) {
      toast.error(result.err);
      return;
    }
    const snapshot = {
      filename: result.ok,
      downloadedAt: Date.now(),
    };
    persistLastBackupSnapshot(snapshot);
    setLastBackup(snapshot);
    toast.success(`Backup downloaded: ${result.ok}`);
  }

  return (
    <AppShell>
      <div className="container-page py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              IT/HR protected
            </Badge>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Backup Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Download one production JSON backup before migration, major
              deployments, or client handover.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={!canBackup || downloading}
            className="gap-2"
            data-ocid="backup.download_production_backup"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Preparing backup..." : "Download Backup"}
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <LiveSyncBadge eventNames={[]} />
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Last backup:</span>{" "}
            {lastBackupLabel}
          </div>
        </div>

        <Card className="glass-card-elevated">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              What This Backup Includes
            </CardTitle>
            <CardDescription>
              The file is meant for IT/HR only and should be stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {BACKUP_INCLUDED_ITEMS.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Recommended backup routine
            </CardTitle>
            <CardDescription>
              These steps help you avoid panic before client handover, cPanel
              work, or major content updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {BACKUP_SAFETY_STEPS.map((step) => (
              <div
                key={step}
                className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-muted-foreground"
              >
                {step}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="flex gap-3 pt-6 text-sm text-amber-900 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Security warning</p>
              <p className="mt-1 leading-6">
                This backup can contain sensitive staff and authentication data.
                Do not send it through public WhatsApp groups or leave it on a
                shared computer.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
