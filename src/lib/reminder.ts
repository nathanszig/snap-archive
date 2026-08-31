const STORAGE_KEY = "snaparchive-pending-export";

export interface PendingExportReminder {
  createdAt: string;
  dismissedAt?: string;
}

export function markExportRequested(): PendingExportReminder {
  const reminder: PendingExportReminder = {
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminder));
  return reminder;
}

export function getPendingExportReminder(): PendingExportReminder | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingExportReminder;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function dismissPendingExportReminder(): void {
  const current = getPendingExportReminder();
  if (!current) return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...current, dismissedAt: new Date().toISOString() }),
  );
}

export function clearPendingExportReminder(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function shouldShowPendingBanner(): boolean {
  const reminder = getPendingExportReminder();
  if (!reminder || reminder.dismissedAt) return false;

  const ageMs = Date.now() - new Date(reminder.createdAt).getTime();
  const maxAgeMs = 14 * 24 * 60 * 60 * 1000;
  return ageMs < maxAgeMs;
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function downloadCalendarReminder(hoursFromNow: number, siteUrl: string): void {
  const start = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const stamp = formatIcsDate(new Date());
  const uid = `snaparchive-${hoursFromNow}h-${stamp}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SnapArchive//FR//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    "SUMMARY:Rappel — exporte tes Memories Snapchat",
    "DESCRIPTION:Tu as demandé ton export Snap il y a quelques jours. Ouvre SnapArchive et importe ton ZIP ou memories_history.json.",
    `URL:${siteUrl}/export`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT0M",
    "ACTION:DISPLAY",
    "DESCRIPTION:SnapArchive — importe ton export Snapchat",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `snaparchive-rappel-${hoursFromNow}h.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyExportPageUrl(siteUrl: string): Promise<void> {
  await navigator.clipboard.writeText(`${siteUrl}/export`);
}

export async function scheduleBrowserReminder(hoursFromNow: number, siteUrl: string): Promise<boolean> {
  if (!("Notification" in window)) return false;

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") return false;

  const delayMs = hoursFromNow * 60 * 60 * 1000;
  window.setTimeout(() => {
    new Notification("SnapArchive — ton export Snap est peut-être prêt", {
      body: "Reviens importer ton ZIP ou memories_history.json.",
      icon: "/icon.svg",
    });
    window.open(`${siteUrl}/export`, "_blank", "noopener,noreferrer");
  }, delayMs);

  return true;
}
