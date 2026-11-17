import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date } = req.body;
  if (!date) {
    return res.status(400).json({ error: 'Missing date' });
  }

  const notifyEmail = process.env.NOTIFY_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;

  if (!notifyEmail || !resendKey) {
    return res.status(500).json({ error: 'Missing env config' });
  }

  const tripDate = new Date(date);
  const sunday = new Date(tripDate);
  sunday.setDate(sunday.getDate() + 1);

  const fmt = (d) => {
    const day = d.getDate();
    const months = [
      'ledna','února','března','dubna','května','června',
      'července','srpna','září','října','listopadu','prosince'
    ];
    return `${day}. ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const resend = new Resend(resendKey);

  try {
    await resend.emails.send({
      from: 'Wingman <onboarding@resend.dev>',
      to: notifyEmail,
      subject: `Termín vybrán! ${fmt(tripDate)}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #0a0a0f; color: #e8e8f0; border-radius: 16px;">
          <h1 style="text-align: center; font-size: 2rem; margin-bottom: 0.5rem;">🎯 Termín je vybraný!</h1>
          <p style="text-align: center; color: #8888aa; margin-bottom: 2rem;">Tvůj kámo si vybral víkend pro výlet.</p>
          <div style="background: #12121a; border: 1px solid #2a2a3a; border-radius: 12px; padding: 1.5rem; text-align: center; margin-bottom: 1.5rem;">
            <div style="font-size: 0.8rem; color: #00cec9; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Vybraný termín</div>
            <div style="font-size: 1.4rem; font-weight: 700;">Sobota ${fmt(tripDate)}</div>
            <div style="color: #8888aa; margin-top: 0.25rem;">→ Neděle ${fmt(sunday)}</div>
          </div>
          <p style="color: #8888aa; font-size: 0.9rem; text-align: center;">Čas začít plánovat! 🚗⛰️🎉</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
