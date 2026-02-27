import { useState } from 'react';
import type { RRListItem, ActiveFill } from '../../lib/messages';
import { colors, fonts, fontSizes, spacing, radii, mixins } from '../../lib/theme';

const FINISHLINE_URL = import.meta.env.DEV ? 'http://localhost:3000' : 'https://finishlinebyner.com';

interface RRListProps {
  items: RRListItem[];
}

interface Section {
  label: string;
  statuses: string[];
  accentColor: string;
  dimmed: boolean;
}

const SECTIONS: Section[] = [
  {
    label: 'Ready for Concur',
    statuses: ['PENDING_SABO_SUBMISSION', 'PENDING_FINANCE'],
    accentColor: colors.primary,
    dimmed: false
  },
  {
    label: 'Submitted',
    statuses: ['SABO_SUBMITTED', 'ADVISOR_APPROVED'],
    accentColor: '#2196f3',
    dimmed: false
  },
  {
    label: 'Reimbursed',
    statuses: ['REIMBURSED'],
    accentColor: colors.success,
    dimmed: false
  },
  {
    label: 'Pending Approval',
    statuses: ['PENDING_LEADERSHIP_APPROVAL', 'LEADERSHIP_APPROVED', 'DENIED'],
    accentColor: colors.textMuted,
    dimmed: true
  }
];

export default function RRList({ items }: RRListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p style={{ ...mixins.subtleText, textAlign: 'center', marginTop: spacing.xl }}>
        No reimbursement requests found.
      </p>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      {SECTIONS.map((section) => {
        const sectionItems = items.filter((item) => section.statuses.includes(item.status));
        if (sectionItems.length === 0) return null;

        return (
          <div key={section.label} style={{ marginBottom: spacing.lg }}>
            <div
              style={{
                ...mixins.sectionHeader,
                color: section.accentColor,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs
              }}
            >
              {section.label}
              <span
                style={{
                  fontFamily: fonts.body,
                  fontSize: fontSizes.xs,
                  fontWeight: 400,
                  color: colors.textMuted,
                  marginLeft: spacing.xs
                }}
              >
                ({sectionItems.length})
              </span>
            </div>
            {sectionItems.map((item) => (
              <RRRow
                key={item.reimbursementRequestId}
                item={item}
                section={section}
                expanded={expandedId === item.reimbursementRequestId}
                onToggle={() => toggleExpand(item.reimbursementRequestId)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

interface RRRowProps {
  item: RRListItem;
  section: Section;
  expanded: boolean;
  onToggle: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function RRRow({ item, section, expanded, onToggle }: RRRowProps) {
  const isReadyForConcur = item.status === 'PENDING_SABO_SUBMISSION' || item.status === 'PENDING_FINANCE';
  const productSummary =
    item.products.length > 0
      ? item.products.length <= 2
        ? item.products.join(', ')
        : `${item.products[0]}, ${item.products[1]} +${item.products.length - 2} more`
      : null;

  return (
    <div
      style={{
        ...mixins.card,
        marginBottom: spacing.sm,
        borderLeft: `3px solid ${section.accentColor}`,
        opacity: section.dimmed ? 0.5 : 1,
        transition: 'opacity 0.15s'
      }}
    >
      {/* Main row — always visible */}
      <div
        style={{
          padding: `${spacing.sm}px ${spacing.md}px`,
          cursor: 'pointer',
          background: expanded ? colors.bgHover : 'transparent',
          borderRadius: expanded ? `${radii.md}px ${radii.md}px 0 0` : radii.md
        }}
        onClick={onToggle}
      >
        {/* Top line: identifier + vendor + cost */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, minWidth: 0 }}>
            <span
              style={{
                fontFamily: fonts.heading,
                fontWeight: 600,
                fontSize: fontSizes.md,
                color: colors.textPrimary,
                whiteSpace: 'nowrap'
              }}
            >
              RR #{item.identifier}
            </span>
            <span
              style={{
                fontSize: fontSizes.sm,
                color: colors.textSecondary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {item.vendorName}
            </span>
          </div>
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: 700,
              fontSize: fontSizes.md,
              color: colors.textPrimary,
              whiteSpace: 'nowrap',
              marginLeft: spacing.sm
            }}
          >
            ${(item.totalCost / 100).toFixed(2)}
          </span>
        </div>

        {/* Detail line: date, products, account code */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            marginTop: 3,
            fontSize: fontSizes.xs,
            color: colors.textMuted,
            overflow: 'hidden'
          }}
        >
          <span>{formatDate(item.dateOfExpense ?? item.dateCreated)}</span>
          {productSummary && (
            <>
              <span style={{ color: colors.border }}>|</span>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {productSummary}
              </span>
            </>
          )}
          {item.accountCodeName && (
            <>
              <span style={{ color: colors.border }}>|</span>
              <span style={{ whiteSpace: 'nowrap' }}>{item.accountCodeName}</span>
            </>
          )}
        </div>
      </div>

      {/* Expanded actions */}
      {expanded && (
        <div
          style={{
            padding: `${spacing.sm}px ${spacing.md}px`,
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm
          }}
        >
          {isReadyForConcur && (
            <button
              style={{
                ...mixins.primaryButton,
                padding: '5px 10px',
                fontSize: fontSizes.sm
              }}
              onClick={() => {
                const payload: ActiveFill = {
                  reimbursementRequestId: item.reimbursementRequestId,
                  identifier: item.identifier,
                  vendorName: item.vendorName,
                  totalCost: item.totalCost,
                  dateOfExpense: item.dateOfExpense,
                  products: item.products,
                  accountCodeName: item.accountCodeName
                };
                chrome.runtime.sendMessage({ type: 'fill:start', payload });
              }}
            >
              Fill in Concur
            </button>
          )}
          <button
            style={mixins.outlineButton}
            onClick={() => {
              chrome.tabs.create({
                url: `${FINISHLINE_URL}/finance/reimbursement-requests/my-requests/${item.reimbursementRequestId}`
              });
            }}
          >
            View on FinishLine
          </button>
          {item.saboId != null && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: fontSizes.xs,
                color: colors.textMuted
              }}
            >
              SABO #{item.saboId}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
