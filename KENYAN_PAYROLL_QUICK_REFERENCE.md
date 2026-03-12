# Kenyan Payroll Quick Reference (2024)

## Tax Brackets at a Glance

| Income Range | Tax Rate | Annual | Monthly (50K) |
|---|---|---|---|
| 0 - 288,000 | 10% | 28,800 | 2,400 |
| 288,001 - 388,000 | 15% | 58,000 | 4,833 |
| 388,001 - 6M | 20% | 1,122,400 | 93,533 |
| 6M - 9.6M | 25% | 2,200,000 | 183,333 |
| 9.6M+ | 30% | 3,600,000+ | 300,000+ |

## Standard Deductions

### NSSF (National Social Security Fund)
- **Tier 1**: 6% of salary (max KES 18,000)
- **Tier 2**: 6% of salary above KES 300,000
- **Total**: Tier 1 + Tier 2

**Example - KES 500,000 salary:**
```
Tier 1: 300,000 × 6% = 18,000 (capped)
Tier 2: 200,000 × 6% = 12,000
TOTAL: 30,000
```

### PAYE (Income Tax)
- **Brackets**: 5 progressive brackets (10%-30%)
- **Personal Relief**: KES 2,400 monthly (deducted from tax)
- **Taxable Income**: Gross - NSSF - Housing Levy

**Formula:**
```
1. Calculate annual taxable income
2. Apply progressive brackets
3. Convert to monthly (÷ 12)
4. Deduct personal relief (KES 2,400)
5. Result = Net PAYE tax deduction
```

### SHIF (Social Health Insurance Fund)
- **Rate**: 2.5% of gross salary
- **Monthly Cap**: KES 15,000
- **Formula**: Gross × 2.5% (max 15,000)

**Example - KES 600,000 salary:**
```
600,000 × 2.5% = 15,000 (at cap)
```

### Housing Levy (Building Levy)
- **Rate**: 1.5% of gross salary
- **Monthly Cap**: KES 15,000
- **Formula**: Gross × 1.5% (max 15,000)

**Example - KES 1M salary:**
```
1,000,000 × 1.5% = 15,000 (at cap)
```

## Calculation Sequence

```
STEP 1: Determine Gross Salary
  Basic Salary: ___________
+ Allowances: ___________
= GROSS SALARY: ___________

STEP 2: Calculate NSSF
  Tier 1: Min(Gross × 6%, 18,000) = ___________
  Tier 2: Max(0, (Gross-300K) × 6%) = ___________
  TOTAL NSSF: ___________

STEP 3: Calculate Housing Levy
  Min(Gross × 1.5%, 15,000) = ___________

STEP 4: Determine Taxable Income
  Gross - NSSF - Housing Levy = ___________

STEP 5: Calculate PAYE
  Apply brackets to (Taxable × 12)
  Convert to monthly (÷ 12)
  Deduct personal relief (2,400)
  = PAYE TAX: ___________

STEP 6: Calculate SHIF
  Min(Gross × 2.5%, 15,000) = ___________

STEP 7: Calculate Total Deductions
  NSSF + PAYE + SHIF + Housing = ___________

STEP 8: Calculate Net Salary
  Gross - Total Deductions = ___________
```

## Common Salary Examples

### Example 1: KES 50,000/month
```
Gross: 50,000
NSSF: 3,000
Housing: 750
Taxable: 46,250
PAYE: 0 (below tax threshold in bracket)
SHIF: 1,250
Total Deductions: 5,000
NET: 45,000
```

### Example 2: KES 100,000/month
```
Gross: 100,000
NSSF: 6,000
Housing: 1,500
Taxable: 92,500
PAYE: ~1,590 (after relief)
SHIF: 2,500
Total Deductions: 11,590
NET: 88,410
```

### Example 3: KES 300,000/month
```
Gross: 300,000
NSSF: 18,000 (Tier 1 only, at cap)
Housing: 4,500
Taxable: 277,500
PAYE: ~3,990 (after relief)
SHIF: 7,500
Total Deductions: 33,990
NET: 266,010
```

### Example 4: KES 500,000/month
```
Gross: 500,000
NSSF: 30,000 (18K + 12K Tier 2)
Housing: 7,500
Taxable: 462,500
PAYE: ~6,690 (after relief)
SHIF: 12,500
Total Deductions: 56,690
NET: 443,310
```

### Example 5: KES 1,000,000/month
```
Gross: 1,000,000
NSSF: 60,000 (18K + 42K Tier 2)
Housing: 15,000 (capped)
Taxable: 925,000
PAYE: ~13,890 (after relief)
SHIF: 15,000 (capped)
Total Deductions: 103,890
NET: 896,110
```

## Quick Tax Lookup

### PAYE Tax Deduction by Salary Range
| Monthly Salary | Approx PAYE (after relief) |
|---|---|
| 30,000 | 0 |
| 50,000 | 210 |
| 100,000 | 1,590 |
| 150,000 | 3,090 |
| 200,000 | 4,590 |
| 300,000 | 3,990 |
| 500,000 | 6,690 |
| 1,000,000 | 13,890 |
| 2,000,000 | 35,890 |
| 5,000,000 | 95,890 |

## NSSF Rate Chart

| Salary | Tier 1 | Tier 2 | Total NSSF |
|---|---|---|---|
| 100,000 | 6,000 | - | 6,000 |
| 250,000 | 15,000 | - | 15,000 |
| 300,000 | 18,000 (cap) | - | 18,000 |
| 400,000 | 18,000 (cap) | 6,000 | 24,000 |
| 500,000 | 18,000 (cap) | 12,000 | 30,000 |
| 1,000,000 | 18,000 (cap) | 42,000 | 60,000 |

## Cap Limits (Monthly)

| Deduction | Rate | Cap |
|---|---|---|
| NSSF Tier 1 | 6% | 18,000 |
| SHIF | 2.5% | 15,000 |
| Housing Levy | 1.5% | 15,000 |

## Personal Relief

- **Monthly**: KES 2,400
- **Annual**: KES 28,800
- **Applied to**: PAYE tax only (reduces tax owed)

## Important Notes

1. **Monetary Values**: All calculations in whole KES (not cents in manual calculation)
2. **System Storage**: All values stored in cents (KES × 100) in database
3. **Decimals**: Round to nearest whole number
4. **Caps**: SHIF and Housing Levy have maximum monthly deductions
5. **Tier 2 NSSF**: Only applies if salary > KES 300,000
6. **Taxable Income**: Calculated on (Gross - NSSF - Housing Levy)
7. **Personal Relief**: Automatically deducted in system

## Compliance Checklist

- [ ] PAYE rates updated (check KRA quarterly updates)
- [ ] NSSF Tier 2 threshold verified
- [ ] SHIF cap confirmed (KES 15,000)
- [ ] Housing Levy cap confirmed (KES 15,000)
- [ ] Personal relief amount checked (KES 2,400)
- [ ] Tax brackets reviewed for updates
- [ ] Employee tax numbers verified

## Resources

**Government Portals:**
- KRA: https://www.kra.go.ke/
- NSSF: https://www.nssf.or.ke/
- SHIF: https://www.shif.go.ke/

**For Updates:**
- Check tax rates quarterly with KRA
- NSSF contributions may change annually
- SHIF cap may be adjusted per government directive
- Housing Levy regulations evolving

---

**Last Updated**: February 2024  
**Version**: Quick Ref v1.0  
**Format**: For manual calculation & system verification
