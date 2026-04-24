const TREATIES = {
  'China': {
    article: '20',
    exemptYears: 5,
    maxAmount: null,
    description: 'Student income fully exempt for 5 years',
    details: 'Under Article 20 of the US-China tax treaty, students from China are exempt from US tax on income from employment or services performed in the US for up to 5 years.'
  },
  'India': {
    article: '21',
    exemptYears: null,
    maxAmount: null,
    description: 'Scholarship and fellowship exemptions apply',
    details: 'Under Article 21 of the US-India tax treaty, scholarships and fellowships received by Indian students may be exempt from US tax.'
  },
  'South Korea': {
    article: '21',
    exemptYears: 5,
    maxAmount: null,
    description: 'Student income exempt for 5 years',
    details: 'Under Article 21 of the US-South Korea tax treaty, students from South Korea are exempt from US tax on wages for up to 5 years.'
  },
  'Korea': {
    article: '21',
    exemptYears: 5,
    maxAmount: null,
    description: 'Student income exempt for 5 years',
    details: 'Under Article 21 of the US-South Korea tax treaty, students from South Korea are exempt from US tax on wages for up to 5 years.'
  },
  'Germany': {
    article: '20',
    exemptYears: null,
    maxAmount: 9000,
    description: 'Up to $9,000 of student income exempt',
    details: 'Under Article 20 of the US-Germany tax treaty, students from Germany may exempt up to $9,000 of US-source income per year.'
  },
  'France': {
    article: '21',
    exemptYears: 5,
    maxAmount: null,
    description: 'Student grants and fellowships exempt',
    details: 'Under Article 21 of the US-France tax treaty, grants, scholarships, and fellowships received by French students are exempt from US tax.'
  },
  'United Kingdom': {
    article: '20',
    exemptYears: null,
    maxAmount: null,
    description: 'Student grants and scholarships exempt',
    details: 'Under Article 20 of the US-UK tax treaty, grants and scholarships received by UK students may be exempt from US tax.'
  },
  'UK': {
    article: '20',
    exemptYears: null,
    maxAmount: null,
    description: 'Student grants and scholarships exempt',
    details: 'Under Article 20 of the US-UK tax treaty, grants and scholarships received by UK students may be exempt from US tax.'
  },
  'Canada': {
    article: '15',
    exemptYears: null,
    maxAmount: 10000,
    description: 'Up to $10,000 of student income may be exempt',
    details: 'Under Article 15 of the US-Canada tax treaty, certain student income may be partially exempt from US tax.'
  },
  'Japan': {
    article: '20',
    exemptYears: null,
    maxAmount: null,
    description: 'Student grants, stipends, and scholarships exempt',
    details: 'Under Article 20 of the US-Japan tax treaty, grants, stipends, and scholarships received by Japanese students may be exempt from US tax.'
  },
  'Thailand': {
    article: '22',
    exemptYears: 5,
    maxAmount: null,
    description: 'Student income exempt for 5 years',
    details: 'Under Article 22 of the US-Thailand tax treaty, students from Thailand are exempt from US tax on certain income for up to 5 years.'
  },
  'Philippines': {
    article: '22',
    exemptYears: null,
    maxAmount: null,
    description: 'Scholarship and fellowship exemptions apply',
    details: 'Under Article 22 of the US-Philippines tax treaty, certain scholarships and fellowships may be exempt from US tax.'
  },
  'Netherlands': {
    article: '22',
    exemptYears: null,
    maxAmount: null,
    description: 'Student grants and scholarships exempt',
    details: 'Under Article 22 of the US-Netherlands tax treaty, grants and scholarships received by Dutch students may be exempt from US tax.'
  },
  'Mexico': {
    article: '22',
    exemptYears: null,
    maxAmount: null,
    description: 'Student income exemptions may apply',
    details: 'Under Article 22 of the US-Mexico tax treaty, certain student income may be exempt from US tax.'
  },
  'Indonesia': {
    article: '19',
    exemptYears: 5,
    maxAmount: null,
    description: 'Student income exempt for 5 years',
    details: 'Under Article 19 of the US-Indonesia tax treaty, students from Indonesia may be exempt from US tax on certain income for up to 5 years.'
  },
  'Pakistan': {
    article: '15',
    exemptYears: null,
    maxAmount: null,
    description: 'Student scholarships and fellowships exempt',
    details: 'Under Article 15 of the US-Pakistan tax treaty, scholarships and fellowships received by Pakistani students may be exempt from US tax.'
  },
  'Egypt': {
    article: '23',
    exemptYears: 5,
    maxAmount: null,
    description: 'Student income exempt for 5 years',
    details: 'Under Article 23 of the US-Egypt tax treaty, students from Egypt are exempt from US tax on certain income for up to 5 years.'
  }
};

function detectTreaty(homeCountry) {
  if (!homeCountry) return { treatyApplies: false };

  const normalizedCountry = homeCountry.trim();

  const treaty = TREATIES[normalizedCountry];

  if (!treaty) {
    return {
      treatyApplies: false,
      message: `No tax treaty found between the US and ${normalizedCountry}. You may still qualify for certain exemptions — consult your university's international student office.`
    };
  }

  return {
    treatyApplies: true,
    treatyCountry: normalizedCountry,
    treatyArticle: treaty.article,
    exemptYears: treaty.exemptYears,
    maxAmount: treaty.maxAmount,
    description: treaty.description,
    details: treaty.details,
    formsNeeded: ['8833'],
    message: `Great news! Your country (${normalizedCountry}) has a tax treaty with the US under Article ${treaty.article}. ${treaty.description}.`
  };
}

function getAllTreatyCountries() {
  return Object.keys(TREATIES);
}

module.exports = { detectTreaty, getAllTreatyCountries, TREATIES };
