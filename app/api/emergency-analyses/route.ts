import { NextResponse } from "next/server";
import { saveEmergencyAnalysisForUser } from "@/db/repositories/emergency-analyses";
import { SaveEmergencyAnalysisPayloadSchema } from "@/schemas/emergency-analysis";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const json = await request.json();
  const parsed = SaveEmergencyAnalysisPayloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid emergency analysis payload.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const result = await saveEmergencyAnalysisForUser(session.user.id, parsed.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to save emergency analysis." }, { status: 500 });
  }
}
