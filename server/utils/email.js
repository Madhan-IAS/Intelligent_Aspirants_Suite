const sendResendEmail = async (to, subject, html) => {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[DEVELOPMENT MOCK EMAIL] -> ${subject} to: ${to}`);
        return true;
    }

    const payload = {
        from: process.env.RESEND_SENDER || 'IASuite <onboarding@resend.dev>',
        to,
        subject,
        html
    };

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('[RESEND HTTP API ERROR]', errorText);
        throw new Error(`Resend API failed: ${errorText}`);
    }

    return true;
};

module.exports = { sendResendEmail };
