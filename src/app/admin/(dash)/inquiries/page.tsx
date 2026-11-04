import { requireAdmin } from "@/lib/admin/auth";
import { adminInquiries } from "@/lib/admin/queries";
import { StatusSelect } from "@/components/admin/status-select";
import { WhatsAppIcon } from "@/components/brand/icons";

export const metadata = { title: "Inquiries" };

function waReply(phone: string, name: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(`Hi ${name}, this is Fitzone Supplements replying to your website inquiry.`)}`;
}

export default async function AdminInquiriesPage() {
  const { sb } = await requireAdmin();
  const inquiries = await adminInquiries(sb);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-5xl">Inquiries</h1>
        <p className="mt-1 text-sm text-mist">
          Inquiries submitted through the website’s contact form. (Messages sent directly on WhatsApp stay in WhatsApp
          and are not listed here.)
        </p>
      </div>
      {inquiries.length === 0 ? (
        <div className="metal-border rounded-2xl p-10 text-center text-mist">No inquiries yet.</div>
      ) : (
        <ul className="space-y-3">
          {inquiries.map((q) => (
            <li key={q.id} className="metal-border rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-heading font-semibold">
                    {q.name} <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-mist uppercase">{q.kind}</span>
                  </p>
                  <p className="text-xs text-mist">
                    <a href={`tel:${q.phone}`} className="hover:text-lime">{q.phone}</a> ·{" "}
                    {new Date(q.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={waReply(q.phone, q.name)} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-xs font-semibold text-[#062b15]">
                    <WhatsAppIcon className="size-4" /> Reply
                  </a>
                  <StatusSelect id={q.id} value={q.status} kind="inquiry" />
                </div>
              </div>
              {q.product_ref && <p className="mt-3 text-sm text-lime">Product: {q.product_ref}</p>}
              <p className="mt-2 text-sm whitespace-pre-line text-white/85">{q.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
