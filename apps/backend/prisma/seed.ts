import { PrismaClient, ViolationSeverity } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Forbidden terms from GUARDRAILS.md (lines 63-87)
 * These terms are BANNED from all product descriptions, content, and user-generated text
 */
const forbiddenTerms = [
  // CRITICAL SEVERITY - Immediate rejection
  {
    term: 'supplement',
    severity: 'CRITICAL' as ViolationSeverity,
    category: 'medical',
    replacement: 'research peptide',
  },
  {
    term: 'dietary supplement',
    severity: 'CRITICAL' as ViolationSeverity,
    category: 'medical',
    replacement: 'research material',
  },
  {
    term: 'treatment',
    severity: 'CRITICAL' as ViolationSeverity,
    category: 'medical',
    replacement: 'research application',
  },
  {
    term: 'therapy',
    severity: 'CRITICAL' as ViolationSeverity,
    category: 'medical',
    replacement: 'laboratory study',
  },
  {
    term: 'therapeutic',
    severity: 'CRITICAL' as ViolationSeverity,
    category: 'medical',
    replacement: 'analytical',
  },
  {
    term: 'dosage',
    severity: 'CRITICAL' as ViolationSeverity,
    category: 'dosing',
    replacement: 'concentration',
  },
  {
    term: 'dose',
    severity: 'CRITICAL' as ViolationSeverity,
    category: 'dosing',
    replacement: 'amount',
  },
  {
    term: 'dosing',
    severity: 'CRITICAL' as ViolationSeverity,
    category: 'dosing',
    replacement: 'measurement',
  },
  {
    term: 'clinical use',
    severity: 'CRITICAL' as ViolationSeverity,
    category: 'medical',
    replacement: 'research use',
  },
  {
    term: 'for patients',
    severity: 'CRITICAL' as ViolationSeverity,
    category: 'medical',
    replacement: 'for research',
  },

  // HIGH SEVERITY - Strong violation
  {
    term: 'wellness',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'laboratory use',
  },
  {
    term: 'health benefits',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'research properties',
  },
  {
    term: 'medical',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'research',
  },
  {
    term: 'medicine',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'research compound',
  },
  {
    term: 'drug',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'research chemical',
  },
  {
    term: 'improves',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'affects (in research context)',
  },
  {
    term: 'treats',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'studied for',
  },
  {
    term: 'cures',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'research target',
  },
  {
    term: 'prevents',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'studied in context of',
  },
  {
    term: 'weight loss',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'metabolic research',
  },
  {
    term: 'anti-aging',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'cellular aging research',
  },
  {
    term: 'anti-ageing',
    severity: 'HIGH' as ViolationSeverity,
    category: 'medical',
    replacement: 'cellular aging research',
  },
  {
    term: 'fda approved',
    severity: 'HIGH' as ViolationSeverity,
    category: 'regulatory',
    replacement: 'research-grade',
  },
  {
    term: 'fda-approved',
    severity: 'HIGH' as ViolationSeverity,
    category: 'regulatory',
    replacement: 'research-grade',
  },

  // MEDIUM SEVERITY - Moderate violation
  {
    term: 'administration',
    severity: 'MEDIUM' as ViolationSeverity,
    category: 'dosing',
    replacement: 'handling',
  },
  {
    term: 'administer',
    severity: 'MEDIUM' as ViolationSeverity,
    category: 'dosing',
    replacement: 'apply (in research)',
  },
  {
    term: 'injectable',
    severity: 'MEDIUM' as ViolationSeverity,
    category: 'dosing',
    replacement: 'solution form',
  },
  {
    term: 'injection',
    severity: 'MEDIUM' as ViolationSeverity,
    category: 'dosing',
    replacement: 'reconstituted form',
  },
  {
    term: 'protocol',
    severity: 'MEDIUM' as ViolationSeverity,
    category: 'dosing',
    replacement: 'procedure',
  },
  {
    term: 'regimen',
    severity: 'MEDIUM' as ViolationSeverity,
    category: 'dosing',
    replacement: 'research schedule',
  },
  {
    term: 'cycle',
    severity: 'MEDIUM' as ViolationSeverity,
    category: 'dosing',
    replacement: 'study period',
  },

  // LOW SEVERITY - Minor violations (educational/informational context)
  {
    term: 'patient',
    severity: 'LOW' as ViolationSeverity,
    category: 'medical',
    replacement: 'research subject',
  },
  {
    term: 'prescription',
    severity: 'LOW' as ViolationSeverity,
    category: 'regulatory',
    replacement: 'research order',
  },
  {
    term: 'pharmacy',
    severity: 'LOW' as ViolationSeverity,
    category: 'regulatory',
    replacement: 'research supplier',
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing forbidden terms
  await prisma.forbiddenTerm.deleteMany({});
  console.log('✅ Cleared existing forbidden terms');

  // Insert forbidden terms
  for (const term of forbiddenTerms) {
    await prisma.forbiddenTerm.create({
      data: term,
    });
  }

  console.log(`✅ Seeded ${forbiddenTerms.length} forbidden terms`);

  // Count by severity
  const counts = {
    CRITICAL: forbiddenTerms.filter((t) => t.severity === 'CRITICAL').length,
    HIGH: forbiddenTerms.filter((t) => t.severity === 'HIGH').length,
    MEDIUM: forbiddenTerms.filter((t) => t.severity === 'MEDIUM').length,
    LOW: forbiddenTerms.filter((t) => t.severity === 'LOW').length,
  };

  console.log('\n📊 Forbidden Terms by Severity:');
  console.log(`   CRITICAL: ${counts.CRITICAL}`);
  console.log(`   HIGH:     ${counts.HIGH}`);
  console.log(`   MEDIUM:   ${counts.MEDIUM}`);
  console.log(`   LOW:      ${counts.LOW}`);

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
