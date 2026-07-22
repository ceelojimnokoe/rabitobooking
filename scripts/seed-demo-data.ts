/**
 * Seeds the appointments table with fictional demo data for the pitch
 * demo: ~4 pending requests, 3 confirmed appointments, 1 rejected request.
 *
 * Run with: npm run seed
 * (Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, loaded
 * automatically from .env.local if present.)
 *
 * All patients below are entirely fictional, using an obviously fake email
 * domain — never real patient data.
 */
import { createClient } from "@supabase/supabase-js";
import { generateRequestReference, generateAppointmentReference } from "../src/lib/reference";
import { services, branches, teams } from "../src/config/clinic";
import { selectableDateKeys, allTimeSlotsForDay } from "../src/lib/scheduling";
import { buildConfirmationEmail, buildRejectionEmail } from "../src/lib/email/templates";

const DEMO_EMAIL_DOMAIN = "demo.rabitoclinic.example";

function serviceLabel(id: string): string {
  return services.find((s) => s.id === id)!.label;
}
function branchLabel(id: string): string {
  return branches.find((b) => b.id === id)!.label;
}
function teamLabel(id: string): string {
  return teams.find((t) => t.id === id)!.label;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "\nCannot seed demo data: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are not set.\n" +
        "Add them to .env.local first — see README-DEMO-SETUP.md.\n",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const now = new Date();
  const dates = selectableDateKeys(now);
  const slots = allTimeSlotsForDay();

  // Pick a handful of distinct future dates/times so nothing collides.
  const futureDate = (offset: number) => dates[Math.min(offset, dates.length - 1)];
  const slotAt = (index: number) => slots[index % slots.length];

  console.log(`Clearing previous demo data (@${DEMO_EMAIL_DOMAIN})...`);
  const { error: deleteError } = await supabase
    .from("appointments")
    .delete()
    .like("email", `%@${DEMO_EMAIL_DOMAIN}`);

  if (deleteError) {
    console.error("Couldn't clear previous demo data:", deleteError.message);
    process.exit(1);
  }

  const pendingRequests = [
    {
      patient_name: "Kwame Boateng",
      phone: "0244000001",
      email: `kwame.boateng@${DEMO_EMAIL_DOMAIN}`,
      service: serviceLabel("general-health"),
      requested_branch: branchLabel("accra-clinic"),
      requested_date: futureDate(1),
      requested_time: slotAt(0),
    },
    {
      patient_name: "Efua Owusu",
      phone: "+233201234567",
      email: `efua.owusu@${DEMO_EMAIL_DOMAIN}`,
      service: serviceLabel("general-dermatology"),
      requested_branch: branchLabel("tema-clinic"),
      requested_date: futureDate(2),
      requested_time: slotAt(3),
    },
    {
      patient_name: "Yaw Asante",
      phone: "0244000003",
      email: `yaw.asante@${DEMO_EMAIL_DOMAIN}`,
      service: serviceLabel("cosmetic-centre"),
      requested_branch: branchLabel("kumasi-clinic"),
      requested_date: futureDate(3),
      requested_time: slotAt(6),
    },
    {
      patient_name: "Abena Sarpong",
      phone: "+233244000004",
      email: `abena.sarpong@${DEMO_EMAIL_DOMAIN}`,
      service: serviceLabel("mycarenow-online"),
      requested_branch: branchLabel("online-consultation"),
      requested_date: futureDate(4),
      requested_time: slotAt(9),
    },
  ];

  console.log(`Inserting ${pendingRequests.length} pending requests...`);
  for (const request of pendingRequests) {
    const { error } = await supabase.from("appointments").insert({
      request_reference: generateRequestReference(),
      status: "pending",
      email_status: "not_sent",
      ...request,
    });
    if (error) throw new Error(`Failed to insert pending request: ${error.message}`);
  }

  const confirmedRequests = [
    {
      patient_name: "Kojo Mensah",
      phone: "0244000005",
      email: `kojo.mensah@${DEMO_EMAIL_DOMAIN}`,
      service: serviceLabel("chief-dermatology"),
      branch: branchLabel("accra-clinic"),
      date: futureDate(5),
      time: slotAt(2),
      team: teamLabel("dermatology-team"),
    },
    {
      patient_name: "Adjoa Frimpong",
      phone: "+233244000006",
      email: `adjoa.frimpong@${DEMO_EMAIL_DOMAIN}`,
      service: serviceLabel("general-health"),
      branch: branchLabel("tema-clinic"),
      date: futureDate(6),
      time: slotAt(5),
      team: teamLabel("general-health-team"),
    },
    {
      patient_name: "Nana Yeboah",
      phone: "0244000007",
      email: `nana.yeboah@${DEMO_EMAIL_DOMAIN}`,
      service: serviceLabel("cosmetic-centre"),
      branch: branchLabel("kumasi-clinic"),
      date: futureDate(7),
      time: slotAt(8),
      team: teamLabel("cosmetic-centre-team"),
    },
  ];

  console.log(`Inserting ${confirmedRequests.length} confirmed appointments...`);
  for (const request of confirmedRequests) {
    const appointmentReference = generateAppointmentReference();
    const emailContent = buildConfirmationEmail({
      patientName: request.patient_name,
      service: request.service,
      branch: request.branch,
      date: request.date,
      time: request.time,
      assignedTeam: request.team,
      appointmentReference,
    });

    const { error } = await supabase.from("appointments").insert({
      request_reference: generateRequestReference(),
      appointment_reference: appointmentReference,
      patient_name: request.patient_name,
      phone: request.phone,
      email: request.email,
      service: request.service,
      requested_branch: request.branch,
      confirmed_branch: request.branch,
      requested_date: request.date,
      requested_time: request.time,
      confirmed_date: request.date,
      confirmed_time: request.time,
      assigned_team: request.team,
      status: "confirmed",
      email_status: "preview_only",
      email_preview: {
        to: request.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        generatedAt: new Date().toISOString(),
      },
      confirmed_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Failed to insert confirmed appointment: ${error.message}`);
  }

  const rejectedReason =
    "That time slot is no longer available. Please submit a new request for a different date.";
  const rejectedEmail = buildRejectionEmail({
    patientName: "Efe Adjei",
    service: serviceLabel("cosmetic-centre"),
    date: futureDate(2),
    time: slotAt(1),
    reason: rejectedReason,
    bookingUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/book`,
  });

  console.log("Inserting 1 rejected request...");
  {
    const { error } = await supabase.from("appointments").insert({
      request_reference: generateRequestReference(),
      patient_name: "Efe Adjei",
      phone: "0244000008",
      email: `efe.adjei@${DEMO_EMAIL_DOMAIN}`,
      service: serviceLabel("cosmetic-centre"),
      requested_branch: branchLabel("accra-clinic"),
      requested_date: futureDate(2),
      requested_time: slotAt(1),
      status: "rejected",
      patient_message: rejectedReason,
      email_status: "preview_only",
      email_preview: {
        to: `efe.adjei@${DEMO_EMAIL_DOMAIN}`,
        subject: rejectedEmail.subject,
        html: rejectedEmail.html,
        text: rejectedEmail.text,
        generatedAt: new Date().toISOString(),
      },
    });
    if (error) throw new Error(`Failed to insert rejected request: ${error.message}`);
  }

  console.log("\nDemo data seeded successfully:");
  console.log(`  ${pendingRequests.length} pending, ${confirmedRequests.length} confirmed, 1 rejected.`);
  console.log("Open /admin to view them.\n");
}

main().catch((error) => {
  console.error("\nSeed script failed:", error.message ?? error);
  process.exit(1);
});
