import { NextResponse } from "next/server";
import { saveTrainingSessionForUser } from "@/db/repositories/training-sessions";
import { SaveTrainingSessionPayloadSchema } from "@/schemas/training-session";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const json = await request.json();
  const parsed = SaveTrainingSessionPayloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid training session payload.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const result = await saveTrainingSessionForUser(session.user.id, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "LEVEL_NOT_FOUND") {
        return NextResponse.json({ error: "Level not found." }, { status: 404 });
      }

      if (error.message === "SESSION_OWNERSHIP_CONFLICT") {
        return NextResponse.json({ error: "Training session belongs to another user." }, { status: 409 });
      }

      if (error.message === "SESSION_LEVEL_CONFLICT") {
        return NextResponse.json({ error: "Training session conflicts with another level." }, { status: 409 });
      }
    }

    return NextResponse.json({ error: "Failed to save training session." }, { status: 500 });
  }
}
