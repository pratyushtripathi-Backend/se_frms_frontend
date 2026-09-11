from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT = "D:/Frontend-Frms/se_frms_frontend/docs/FRMS_Audit_Page_Requirements.pdf"


def page_header(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.drawString(0.55 * inch, 0.38 * inch, "FRMS Audit Page Requirements")
    canvas.drawRightString(A4[0] - 0.55 * inch, 0.38 * inch, f"Page {doc.page}")
    canvas.restoreState()


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="TitleCenter",
            parent=styles["Title"],
            alignment=TA_CENTER,
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#1F4E79"),
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubtitleCenter",
            parent=styles["Normal"],
            alignment=TA_CENTER,
            fontName="Helvetica-Oblique",
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#444444"),
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionHeading",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#2F5496"),
            spaceBefore=12,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Cell",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=9,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CellHeader",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=9,
            textColor=colors.white,
        )
    )
    return styles


def p(text, style):
    return Paragraph(str(text), style)


def add_table(story, styles, headers, rows, widths=None):
    data = [[p(header, styles["CellHeader"]) for header in headers]]
    for row in rows:
        data.append([p(value, styles["Cell"]) for value in row])
    table = Table(data, colWidths=widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2F5496")),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#C8D2E0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7F9FC")]),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 8))


def add_bullets(story, styles, items):
    for item in items:
        story.append(Paragraph(f"- {item}", styles["Body"]))
    story.append(Spacer(1, 4))


def main():
    styles = build_styles()
    doc = BaseDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=page_header)])

    story = []
    story.append(Paragraph("FRMS Audit Page Requirements", styles["TitleCenter"]))
    story.append(Paragraph("UI columns, filters, detail sections, and timeline structure", styles["SubtitleCenter"]))

    story.append(Paragraph("1. Purpose", styles["SectionHeading"]))
    story.append(
        Paragraph(
            "The Audit Page is an investigation and compliance screen. It should help an admin or fraud analyst trace the full lifecycle of a transaction across services, including transaction intake, fraud evaluation, scoring, decision, event publishing, audit creation, and analytics creation.",
            styles["Body"],
        )
    )

    story.append(Paragraph("2. Main Audit Table Columns", styles["SectionHeading"]))
    add_table(
        story,
        styles,
        ["Column", "Source", "Purpose"],
        [
            ["auditLogId", "se_frms_audit_log.id", "Unique audit log identifier."],
            ["transactionId", "se_frms_audit_log.transaction_id", "Used to open complete audit trail for one transaction."],
            ["serviceName", "se_frms_audit_log.service_name", "Shows which microservice generated the event."],
            ["eventType", "se_frms_audit_log.event_type", "Shows event type such as FRAUD_EVALUATION_COMPLETED."],
            ["referenceId", "se_frms_audit_log.reference_id", "Service-specific related ID, such as decisionId or scoringId."],
            ["finalDecision", "eventDetails.finalDecision", "ALLOW, REVIEW, or BLOCK decision."],
            ["totalRiskScore", "eventDetails.totalRiskScore", "Final fraud risk score."],
            ["status", "se_frms_audit_log.status", "Active/inactive audit record status."],
            ["performedBy", "se_frms_audit_log.performed_by", "Actor or service that performed the action."],
            ["createdBy", "se_frms_audit_log.created_by", "Creator of audit record, usually AUDIT_SERVICE."],
            ["createdAt", "se_frms_audit_log.created_at", "Audit record creation timestamp."],
            ["updatedAt", "se_frms_audit_log.updated_at", "Last updated timestamp."],
            ["action", "Frontend only", "View Details action."],
        ],
        [1.25 * inch, 1.85 * inch, 3.25 * inch],
    )

    story.append(Paragraph("3. Recommended Filters", styles["SectionHeading"]))
    add_table(
        story,
        styles,
        ["Filter", "Type", "Backend Field"],
        [
            ["transactionId", "Text / UUID", "transaction_id"],
            ["serviceName", "Dropdown", "service_name"],
            ["eventType", "Dropdown", "event_type"],
            ["finalDecision", "Dropdown", "event_details->finalDecision"],
            ["status", "Boolean dropdown", "status"],
            ["fromDate", "Date-time", "created_at"],
            ["toDate", "Date-time", "created_at"],
            ["referenceId", "Text / UUID", "reference_id"],
        ],
        [1.4 * inch, 1.7 * inch, 3.25 * inch],
    )

    story.append(Paragraph("4. Audit Details View", styles["SectionHeading"]))
    add_bullets(
        story,
        styles,
        [
            "auditLogId",
            "transactionId",
            "serviceName",
            "eventType",
            "referenceId",
            "performedBy",
            "status",
            "createdBy",
            "createdAt",
            "updatedAt",
        ],
    )

    story.append(Paragraph("5. Event Details Section", styles["SectionHeading"]))
    add_table(
        story,
        styles,
        ["Field", "Source", "Description"],
        [
            ["scoringId", "eventDetails.scoringId", "Scoring record linked to the transaction."],
            ["decisionId", "eventDetails.decisionId", "Decision record linked to the transaction."],
            ["totalRiskScore", "eventDetails.totalRiskScore", "Calculated cumulative risk score."],
            ["finalDecision", "eventDetails.finalDecision", "Final decision from Decision Service."],
            ["decisionReason", "eventDetails.decisionReason", "Reason generated from policy thresholds."],
            ["triggeredRules", "eventDetails.triggeredRules", "Matched fraud rules and their scores."],
            ["transactionData", "eventDetails.transactionData", "Full transaction payload snapshot."],
            ["eventTimestamp", "eventDetails.eventTimestamp", "Fraud event timestamp from Fraud Engine."],
        ],
        [1.35 * inch, 2.0 * inch, 3.0 * inch],
    )

    story.append(Paragraph("6. Transaction Data Section", styles["SectionHeading"]))
    add_table(
        story,
        styles,
        ["Field", "Purpose"],
        [
            ["externalTransactionId", "Bank or external reference ID for idempotency."],
            ["merchantId", "Merchant identifier."],
            ["merchantName", "Merchant display name."],
            ["merchantCategory", "Merchant category such as RETAIL."],
            ["userId", "Customer/user identifier."],
            ["customerAccountNumber", "Masked customer account number."],
            ["amount", "Transaction amount."],
            ["currency", "Transaction currency."],
            ["channel", "Channel such as UPI, WEB, ATM, POS."],
            ["transactionType", "Type such as PAYMENT, TRANSFER, WITHDRAWAL."],
            ["ipAddress", "IP address used for transaction."],
            ["latitude", "Transaction latitude."],
            ["longitude", "Transaction longitude."],
            ["deviceFingerprint", "Device fingerprint value."],
            ["deviceId", "Device identifier."],
            ["os", "Device operating system."],
            ["appVersion", "Application version."],
            ["upiId", "Customer UPI ID."],
            ["beneficiaryUpiId", "Beneficiary or merchant UPI ID."],
            ["paymentMode", "Payment mode such as UPI_COLLECT."],
            ["mobile", "Customer mobile number."],
            ["location", "Human-readable location."],
        ],
        [2.0 * inch, 4.35 * inch],
    )

    story.append(Paragraph("7. Triggered Rules Section", styles["SectionHeading"]))
    add_table(
        story,
        styles,
        ["Column", "Description"],
        [
            ["ruleCode", "Unique rule code from monolithic fraud rule module."],
            ["ruleName", "Business-readable rule name."],
            ["ruleExpression", "Expression evaluated by Scoring Service."],
            ["ruleScore", "Configured score from rule score module."],
            ["calculatedScore", "Score added to totalRiskScore after match."],
            ["matched", "Whether rule matched the transaction."],
            ["categoryName", "Rule category name."],
        ],
        [2.0 * inch, 4.35 * inch],
    )

    story.append(Paragraph("8. Transaction Timeline Section", styles["SectionHeading"]))
    add_table(
        story,
        styles,
        ["Step", "Event", "Description"],
        [
            ["1", "Transaction received", "Transaction Service accepts request."],
            ["2", "Fraud evaluation started", "Transaction Service triggers Fraud Engine."],
            ["3", "Rules loaded", "Fraud Engine uses active rules from local cache."],
            ["4", "Scoring completed", "Scoring Service calculates totalRiskScore and matched rules."],
            ["5", "Decision completed", "Decision Service returns ALLOW, REVIEW, or BLOCK."],
            ["6", "Fraud event published", "Fraud Engine publishes event to Kafka."],
            ["7", "Audit record created", "Audit Service consumes event and stores audit log."],
            ["8", "Analytics record created", "Analytics Service consumes event and stores reporting record."],
        ],
        [0.45 * inch, 1.85 * inch, 4.05 * inch],
    )

    story.append(Paragraph("9. Page Layout Recommendation", styles["SectionHeading"]))
    add_bullets(
        story,
        styles,
        [
            "Top area: summary counters for total audit events, blocked transactions, review transactions, and failed events.",
            "Filter bar: transactionId, serviceName, eventType, finalDecision, date range, and status.",
            "Main grid: audit table with pagination and View Details action.",
            "Details drawer/page: audit metadata, event details, transaction data, triggered rules, and timeline.",
            "Use JSON viewer only as an expandable advanced section, not as the default view.",
        ],
    )

    story.append(Paragraph("10. API Support Needed", styles["SectionHeading"]))
    add_table(
        story,
        styles,
        ["API", "Purpose"],
        [
            ["GET /api/v1/audit-logs", "Paginated audit list for main table."],
            ["GET /api/v1/audit-logs/{auditLogId}", "Open audit details by audit ID."],
            ["GET /api/v1/audit-logs/transaction/{transactionId}", "Show full timeline for one transaction."],
        ],
        [2.75 * inch, 3.6 * inch],
    )

    doc.build(story)


if __name__ == "__main__":
    main()
