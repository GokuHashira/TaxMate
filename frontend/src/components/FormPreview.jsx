export default function FormPreview({ taxData }) {
  const profile = taxData?.studentProfile || {};
  const income = taxData?.income || {};
  const withholding = taxData?.withholding || {};
  const treatyInfo = taxData?.treatyInfo || {};
  const formsNeeded = taxData?.formsNeeded || [];

  const totalWages = (parseFloat(income.wagesOnCampus || 0) + parseFloat(income.wagesCPT || 0) + parseFloat(income.wagesOPT || 0));
  const totalScholarship = parseFloat(income.scholarshipTaxable || 0) + parseFloat(income.fellowshipIncome || 0);
  const totalIncome = totalWages + totalScholarship;

  const hasAnyData = profile.fullName || profile.visaType || profile.homeCountry || totalIncome > 0;

  if (!hasAnyData) {
    return (
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center">
        <div className="text-3xl mb-2">📋</div>
        <p className="text-gray-500 text-sm">Your tax information will appear here as we go</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-4">
      <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
        <span>📋</span> Your Tax Profile
      </h3>

      {/* Personal Info */}
      {(profile.fullName || profile.visaType || profile.homeCountry) && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {profile.fullName && <DataRow label="Name" value={profile.fullName} />}
            {profile.visaType && <DataRow label="Visa" value={profile.visaType} />}
            {profile.homeCountry && <DataRow label="Country" value={profile.homeCountry} />}
            {profile.university && <DataRow label="University" value={profile.university} ellipsis />}
            {(profile.ssn || profile.itin) && (
              <DataRow label={profile.ssn ? 'SSN' : 'ITIN'} value="•••-••-••••" />
            )}
          </div>
        </div>
      )}

      {/* Income */}
      {totalIncome > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Income</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {totalWages > 0 && <DataRow label="Wages" value={`$${totalWages.toLocaleString()}`} />}
            {totalScholarship > 0 && <DataRow label="Scholarship" value={`$${totalScholarship.toLocaleString()}`} />}
            {withholding.federalIncomeTax > 0 && <DataRow label="Fed. Withheld" value={`$${parseFloat(withholding.federalIncomeTax).toLocaleString()}`} />}
          </div>
        </div>
      )}

      {/* Treaty */}
      {treatyInfo.treatyApplies && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <span className="text-lg">🎉</span>
            <div>
              <p className="font-semibold text-sm">Tax Treaty Active</p>
              <p className="text-xs text-emerald-600">{treatyInfo.treatyCountry} — Article {treatyInfo.treatyArticle}</p>
            </div>
          </div>
        </div>
      )}

      {/* FICA */}
      {withholding.ficaError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 text-amber-700">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold text-sm">FICA Refund Available</p>
              <p className="text-xs text-amber-600">${parseFloat(withholding.ficaRefundAmount || 0).toFixed(2)} incorrectly withheld</p>
            </div>
          </div>
        </div>
      )}

      {/* Forms needed */}
      {formsNeeded.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Forms to Generate</h4>
          <div className="flex flex-wrap gap-2">
            {formsNeeded.map((form) => (
              <span key={form} className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                Form {form}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DataRow({ label, value, ellipsis }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className={`text-gray-800 font-medium text-sm ${ellipsis ? 'truncate' : ''}`}>{value}</span>
    </div>
  );
}
