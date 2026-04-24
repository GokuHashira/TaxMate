function checkFICA(w2Data) {
  const ssWithheld = parseFloat(w2Data.box4_socialSecurity || 0);
  const medicareWithheld = parseFloat(w2Data.box6_medicare || 0);
  const totalFICA = ssWithheld + medicareWithheld;

  if (totalFICA <= 0) {
    return {
      ficaError: false,
      socialSecurityWithheld: 0,
      medicareWithheld: 0,
      ficaRefundAmount: 0,
      message: null
    };
  }

  return {
    ficaError: true,
    socialSecurityWithheld: ssWithheld,
    medicareWithheld: medicareWithheld,
    ficaRefundAmount: totalFICA,
    message: `Your employer incorrectly withheld $${totalFICA.toFixed(2)} in FICA taxes ($${ssWithheld.toFixed(2)} Social Security + $${medicareWithheld.toFixed(2)} Medicare). As an F-1/J-1 student, you are EXEMPT from FICA taxes. You can claim this back!`,
    shortMessage: `Potential FICA refund of $${totalFICA.toFixed(2)} found!`,
    instructions: [
      'Contact your employer and request a corrected W-2 (W-2c)',
      'If the employer will not correct the W-2, you can claim the refund directly from the IRS',
      'File Form 843 (Claim for Refund) with your tax return',
      'Attach a statement explaining that you were an F-1/J-1 student and exempt from FICA',
      'Keep copies of your visa, I-20/DS-2019, and any communication with your employer'
    ]
  };
}

function estimateTaxRefund(taxData) {
  let totalRefund = 0;
  const breakdown = [];

  // Federal income tax withheld (potential refund if income is low/treaty applies)
  const federalWithheld = parseFloat(taxData.withholding?.federalIncomeTax || 0);
  const totalIncome = Object.values(taxData.income || {}).reduce((sum, v) => sum + parseFloat(v || 0), 0);

  // FICA refund
  const ficaRefund = parseFloat(taxData.withholding?.ficaRefundAmount || 0);
  if (ficaRefund > 0) {
    totalRefund += ficaRefund;
    breakdown.push({ label: 'FICA Refund (Social Security + Medicare)', amount: ficaRefund });
  }

  // Treaty exemption savings (rough estimate)
  if (taxData.treatyInfo?.treatyApplies) {
    const estimatedTaxSaving = totalIncome * 0.12; // rough 12% bracket estimate
    breakdown.push({
      label: `Tax Treaty Savings (${taxData.treatyInfo.treatyCountry} Article ${taxData.treatyInfo.treatyArticle})`,
      amount: estimatedTaxSaving,
      note: 'Estimated — exact amount depends on treaty terms'
    });
    totalRefund += estimatedTaxSaving;
  }

  // Simple federal refund estimate based on withholding vs standard deduction
  if (federalWithheld > 0 && totalIncome < 14600) {
    const potentialRefund = Math.min(federalWithheld, federalWithheld * 0.5);
    breakdown.push({ label: 'Estimated Federal Tax Refund', amount: potentialRefund });
    totalRefund += potentialRefund;
  }

  return {
    totalEstimatedRefund: Math.round(totalRefund * 100) / 100,
    breakdown,
    disclaimer: 'This is an estimate only. Actual refund may vary based on your specific situation.'
  };
}

module.exports = { checkFICA, estimateTaxRefund };
