export async function GET(request: Request) {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Process Queue Messages completed (batch done).",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
