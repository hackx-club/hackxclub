import { useState } from "react";

interface AddToCalendarProps {
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  location?: string;
}

export function AddToCalendarButton({
  title,
  description,
  startDate,
  location = "Coimbatore, Tamil Nadu, India",
}: AddToCalendarProps) {
  const [open, setOpen] = useState(false);

  const cleanDate = startDate.replace(/-/g, "");
  // 9:00 AM to 9:00 PM IST (03:30 to 15:30 UTC)
  const gCalDates = `${cleanDate}T033000Z/${cleanDate}T153000Z`;

  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title,
  )}&dates=${gCalDates}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(
    location,
  )}`;

  const downloadIcs = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//HackX Club//HackX 1.0//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
      `LOCATION:${location}`,
      `DTSTART:${cleanDate}T033000Z`,
      `DTEND:${cleanDate}T153000Z`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "hackx-1-0.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-accent"
        aria-expanded={open}
      >
        <span>📅 Add to Calendar</span>
        <span className="text-xs text-muted-foreground">▼</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-52 rounded-xl border border-border bg-popover p-1.5 shadow-xl z-30">
          <a
            href={gCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <span>Google Calendar</span>
          </a>
          <button
            type="button"
            onClick={downloadIcs}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-popover-foreground text-left transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <span>Apple / Outlook (.ics)</span>
          </button>
        </div>
      )}
    </div>
  );
}
