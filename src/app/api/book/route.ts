import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { bookingRequestSchema } from "@/lib/validation/booking";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateRequestReference } from "@/lib/reference";
import { insertAppointmentRequest } from "@/lib/db/appointments";
import { checkServerEnv } from "@/lib/env/server";
import { devLog } from "@/lib/dev-log";

function getClientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}

const UNIQUE_VIOLATION = "23505";

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);
  const rateLimit = checkRateLimit(`book:${clientKey}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many booking requests from this device. Please wait a moment and try again.",
      },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    devLog("book:validation", { fieldErrors: Object.keys(z.flattenError(parsed.error).fieldErrors) });
    return NextResponse.json(
      {
        error: "Please correct the highlighted fields and try again.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { fullName, phone, email, patientType, service, branch, date, time } =
    parsed.data;

  const envCheck = checkServerEnv();
  if (!envCheck.ok) {
    devLog("book:config", { issues: envCheck.issues });
    return NextResponse.json(
      {
        error:
          "Booking isn't available yet — the demo's Supabase connection hasn't been configured. See README-DEMO-SETUP.md.",
      },
      { status: 503 },
    );
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const requestReference = generateRequestReference();

    const { data, error } = await insertAppointmentRequest({
      request_reference: requestReference,
      patient_name: fullName,
      phone,
      email,
      patient_type: patientType as "new" | "existing",
      service,
      requested_branch: branch,
      requested_date: date,
      requested_time: time,
    });

    if (!error && data) {
      return NextResponse.json({ reference: data.request_reference }, { status: 201 });
    }

    if (error && error.code !== UNIQUE_VIOLATION) {
      // Full error (code/message/details/hint) logged in dev only — never
      // includes the patient's name/phone/email, only the operation and
      // the database's own error description.
      devLog("book:insert", {
        operation: "insertAppointmentRequest",
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { error: "We couldn't save your request. Please try again shortly." },
        { status: 500 },
      );
    }
    // Unique violation on request_reference — extremely unlikely; retry with a fresh code.
  }

  devLog("book:insert", { note: "Exhausted retries on request_reference unique violations" });
  return NextResponse.json(
    { error: "We couldn't save your request. Please try again shortly." },
    { status: 500 },
  );
}
