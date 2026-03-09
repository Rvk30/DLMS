/**
 * Shared HTML email layout wrapper.
 * All templates call wrapHtml(title, bodyContent) to get a consistent
 * branded email shell with DLMS header + footer.
 */
export function wrapHtml(title: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#F0F4F8; font-family:'Segoe UI',Arial,sans-serif; color:#2D2D2D; }
    .wrapper { max-width:600px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(30,58,95,0.10); }
    .header  { background:linear-gradient(135deg,#1E3A5F 0%,#2E4D7B 100%); padding:32px 40px; text-align:center; }
    .header img { height:48px; margin-bottom:12px; }
    .header h1  { margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:-0.3px; }
    .header p   { margin:4px 0 0; color:#8AABCC; font-size:13px; }
    .body    { padding:36px 40px; }
    .greeting{ font-size:16px; color:#2D2D2D; margin-bottom:20px; }
    .card    { background:#F9F9F9; border-radius:8px; border:1px solid #E5EAF0; padding:20px 24px; margin:20px 0; }
    .card-row{ display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #EEF1F5; font-size:14px; }
    .card-row:last-child { border-bottom:none; }
    .card-row .label { color:#6B7280; }
    .card-row .value { color:#1E3A5F; font-weight:600; }
    .badge   { display:inline-block; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; }
    .badge-green  { background:#D1FAE5; color:#065F46; }
    .badge-red    { background:#FEE2E2; color:#991B1B; }
    .badge-yellow { background:#FEF3C7; color:#92400E; }
    .btn     { display:inline-block; background:#1E3A5F; color:#ffffff !important; text-decoration:none; padding:13px 32px; border-radius:8px; font-size:15px; font-weight:600; margin:24px 0; }
    .btn-gold{ background:#F5A623; color:#1E3A5F !important; }
    .fine-box{ background:#FEF3C7; border:1px solid #F59E0B; border-radius:8px; padding:16px 20px; margin:20px 0; text-align:center; }
    .fine-amount { font-size:28px; font-weight:800; color:#B45309; }
    .overdue-box { background:#FEE2E2; border:1px solid #F87171; border-radius:8px; padding:16px 20px; margin:20px 0; }
    .divider { border:none; border-top:1px solid #EEF1F5; margin:24px 0; }
    .footer  { background:#F0F4F8; padding:24px 40px; text-align:center; font-size:12px; color:#9CA3AF; }
    .footer a { color:#1E3A5F; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>📚 DLMS Library</h1>
      <p>Digital Library Management System</p>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} DLMS — Digital Library Management System</p>
      <p>This is an automated message. Please do not reply to this email.</p>
      <p><a href="${process.env.FRONTEND_URL}">Visit Library Portal</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Template helpers ─────────────────────────────────────────────────────

/** Format a Date to readable dd Mon yyyy */
function fmtDate(d: Date): string {
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─────────────────────────────────────────────────────────────
//  1. Email verification
// ─────────────────────────────────────────────────────────────
export function emailVerificationTemplate(name: string, verifyUrl: string): { subject: string; html: string } {
    return {
        subject: '✅ Verify your DLMS email address',
        html: wrapHtml('Email Verification', `
      <p class="greeting">Hello <strong>${name}</strong>,</p>
      <p>Welcome to the <strong>Digital Library Management System</strong>! Before you can borrow books, please verify your email address.</p>
      <div style="text-align:center">
        <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      </div>
      <p style="font-size:13px;color:#6B7280;">This link expires in <strong>24 hours</strong>. If you did not create an account, please ignore this email.</p>
      <hr class="divider"/>
      <p style="font-size:12px;color:#9CA3AF;">Or copy this URL into your browser:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
    `),
    };
}

// ─────────────────────────────────────────────────────────────
//  2. Book issued confirmation
// ─────────────────────────────────────────────────────────────
export interface BookIssuedParams {
    studentName: string;
    studentEmail: string;
    bookTitle: string;
    bookAuthor: string;
    isbn: string;
    issueDate: Date;
    dueDate: Date;
    transactionId: string;
}

export function bookIssuedTemplate(p: BookIssuedParams): { subject: string; html: string } {
    const portalUrl = `${process.env.FRONTEND_URL}/transactions`;
    return {
        subject: `📖 Book Issued — "${p.bookTitle}" | DLMS`,
        html: wrapHtml('Book Issued', `
      <p class="greeting">Hello <strong>${p.studentName}</strong>,</p>
      <p>A book has been successfully issued to you. Please return it by the due date to avoid fines.</p>

      <div class="card">
        <div class="card-row"><span class="label">Book Title</span><span class="value">${p.bookTitle}</span></div>
        <div class="card-row"><span class="label">Author</span><span class="value">${p.bookAuthor}</span></div>
        <div class="card-row"><span class="label">ISBN</span><span class="value">${p.isbn}</span></div>
        <div class="card-row"><span class="label">Issue Date</span><span class="value">${fmtDate(p.issueDate)}</span></div>
        <div class="card-row">
          <span class="label">Due Date</span>
          <span class="value" style="color:#D97706;">${fmtDate(p.dueDate)}</span>
        </div>
        <div class="card-row"><span class="label">Status</span><span class="badge badge-green">Issued</span></div>
      </div>

      <p style="font-size:13px;color:#4B5563;">
        ⓘ Fine of <strong>₹2 per day</strong> will apply if returned after the due date.
        Maximum borrow limit is <strong>3 books</strong>.
      </p>

      <div style="text-align:center">
        <a href="${portalUrl}" class="btn">View My Books</a>
      </div>
    `),
    };
}

// ─────────────────────────────────────────────────────────────
//  3. Due date reminder (3 days before)
// ─────────────────────────────────────────────────────────────
export interface DueDateReminderParams {
    studentName: string;
    bookTitle: string;
    bookAuthor: string;
    dueDate: Date;
    daysLeft: number;
    transactionId: string;
}

export function dueDateReminderTemplate(p: DueDateReminderParams): { subject: string; html: string } {
    const portalUrl = `${process.env.FRONTEND_URL}/dashboard`;
    const urgency = p.daysLeft === 1 ? 'TOMORROW' : `in ${p.daysLeft} days`;
    return {
        subject: `⏰ Reminder: "${p.bookTitle}" is due ${urgency} | DLMS`,
        html: wrapHtml('Due Date Reminder', `
      <p class="greeting">Hello <strong>${p.studentName}</strong>,</p>
      <p>This is a friendly reminder that a book borrowed from the library is due <strong>${urgency}</strong>.</p>

      <div class="card">
        <div class="card-row"><span class="label">Book Title</span><span class="value">${p.bookTitle}</span></div>
        <div class="card-row"><span class="label">Author</span><span class="value">${p.bookAuthor}</span></div>
        <div class="card-row">
          <span class="label">Due Date</span>
          <span class="value" style="color:#D97706;">${fmtDate(p.dueDate)}</span>
        </div>
        <div class="card-row">
          <span class="label">Days Remaining</span>
          <span class="badge ${p.daysLeft <= 1 ? 'badge-red' : 'badge-yellow'}">${p.daysLeft} day${p.daysLeft !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <p style="font-size:13px;color:#4B5563;">
        ⚠️ Returning after the due date will incur a fine of <strong>₹2/day</strong>.
        Please return the book to the library counter on time.
      </p>

      <div style="text-align:center">
        <a href="${portalUrl}" class="btn btn-gold">View My Dashboard</a>
      </div>
    `),
    };
}

// ─────────────────────────────────────────────────────────────
//  4. Overdue alert with fine amount
// ─────────────────────────────────────────────────────────────
export interface OverdueAlertParams {
    studentName: string;
    bookTitle: string;
    bookAuthor: string;
    dueDate: Date;
    daysOverdue: number;
    fineAmount: number;
    transactionId: string;
}

export function overdueAlertTemplate(p: OverdueAlertParams): { subject: string; html: string } {
    const portalUrl = `${process.env.FRONTEND_URL}/transactions`;
    return {
        subject: `🚨 OVERDUE: "${p.bookTitle}" — Fine ₹${p.fineAmount} | DLMS`,
        html: wrapHtml('Overdue Alert', `
      <p class="greeting">Hello <strong>${p.studentName}</strong>,</p>

      <div class="overdue-box">
        <strong>⚠️ The following book is overdue.</strong>
        Please return it immediately to prevent further fines.
      </div>

      <div class="card">
        <div class="card-row"><span class="label">Book Title</span><span class="value">${p.bookTitle}</span></div>
        <div class="card-row"><span class="label">Author</span><span class="value">${p.bookAuthor}</span></div>
        <div class="card-row"><span class="label">Due Date</span><span class="value" style="color:#DC2626;">${fmtDate(p.dueDate)}</span></div>
        <div class="card-row"><span class="label">Days Overdue</span><span class="badge badge-red">${p.daysOverdue} day${p.daysOverdue !== 1 ? 's' : ''}</span></div>
        <div class="card-row"><span class="label">Status</span><span class="badge badge-red">OVERDUE</span></div>
      </div>

      <div class="fine-box">
        <div style="font-size:12px;color:#92400E;margin-bottom:4px;">CURRENT FINE</div>
        <div class="fine-amount">₹${p.fineAmount}</div>
        <div style="font-size:12px;color:#92400E;margin-top:4px;">₹2 × ${p.daysOverdue} days overdue</div>
      </div>

      <p style="font-size:13px;color:#4B5563;">
        Fine increases by <strong>₹2 every day</strong> until the book is returned.
        Visit the library counter to return the book and settle your fine.
      </p>

      <div style="text-align:center">
        <a href="${portalUrl}" class="btn">View Transaction Details</a>
      </div>
    `),
    };
}

// ─────────────────────────────────────────────────────────────
//  5. Password reset
// ─────────────────────────────────────────────────────────────
export function passwordResetTemplate(name: string, resetUrl: string): { subject: string; html: string } {
    return {
        subject: '🔐 Reset your DLMS password',
        html: wrapHtml('Password Reset', `
      <p class="greeting">Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your DLMS account password. Click the button below to set a new password.</p>
      <div style="text-align:center">
        <a href="${resetUrl}" class="btn">Reset My Password</a>
      </div>
      <p style="font-size:13px;color:#6B7280;">
        This link expires in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email.
      </p>
      <hr class="divider"/>
      <p style="font-size:12px;color:#9CA3AF;">Or copy this URL:<br/><a href="${resetUrl}">${resetUrl}</a></p>
    `),
    };
}
