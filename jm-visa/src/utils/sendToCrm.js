export async function sendLeadToCrm(payload) {
  const webhookUrl = process.env.CRM_WEBHOOK_URL || "http://localhost:3001/api/webhook/website";
  const webhookSecret = process.env.CRM_WEBHOOK_SECRET || "test_webhook_secret";
  let lastStatus = 0;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: webhookSecret, ...payload }),
      });
      if (res.ok) return { ok: true, status: res.status };
      lastStatus = res.status;
      console.error("CRM webhook rejected the lead:", res.status);
    } catch (error) {
      console.error("CRM webhook request failed:", error);
    }
  }

  return { ok: false, status: lastStatus };
}
