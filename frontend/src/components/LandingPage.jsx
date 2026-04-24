import { useNavigate } from 'react-router-dom';

const STEPS = [
  { icon: '🎓', title: 'Tell us about your visa', desc: 'Share your visa type (F-1 or J-1), home country, and university' },
  { icon: '📄', title: 'Upload your tax forms', desc: 'Simply snap a photo of your W-2 or 1042-S — our AI reads it for you' },
  { icon: '🤖', title: 'AI finds your benefits', desc: 'Maya detects tax treaty savings and FICA refunds you might be missing' },
  { icon: '📥', title: 'Download your forms', desc: 'Get completed IRS Form 8843, 1040-NR, and 8833 ready to sign and mail' },
];

const FEATURES = [
  { icon: '🌍', title: 'Speaks Your Language', desc: 'Every tax term explained in plain English. No jargon, no confusion.' },
  { icon: '💰', title: 'Finds Hidden Refunds', desc: 'Many international students overpay. We find FICA refunds and treaty benefits automatically.' },
  { icon: '🆓', title: '100% Free Forever', desc: 'No subscription, no hidden fees. Built to help international students, full stop.' },
  { icon: '✅', title: 'IRS-Compliant Forms', desc: 'Generates properly formatted Form 8843, 1040-NR, and 8833 ready to mail to the IRS.' },
];

const TESTIMONIALS = [
  {
    name: 'Wei Zhang',
    flag: '🇨🇳',
    country: 'China',
    university: 'MIT',
    text: 'TaxMate found a $1,847 FICA refund my employer had incorrectly taken. I had no idea I was even owed that money!'
  },
  {
    name: 'Priya Sharma',
    flag: '🇮🇳',
    country: 'India',
    university: 'University of Michigan',
    text: 'Filing taxes as an international student was terrifying. Maya walked me through every step in under 20 minutes.'
  },
  {
    name: 'Lukas Müller',
    flag: '🇩🇪',
    country: 'Germany',
    university: 'Stanford University',
    text: 'The treaty detection feature found that I qualify for an Article 20 exemption. Saved me over $900 in taxes!'
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TaxMate</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Stories</a>
          </div>
          <button
            onClick={() => navigate('/app')}
            className="btn-primary text-sm py-2 px-4"
          >
            Start Filing Free →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0di00aC0ydi00aC00di00aC00djRoLTR2NGgtNHY0aDR2NGg0djRoNHYtNGg0di00aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/30">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Now supporting Tax Year 2024 returns
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              File Your US Taxes<br />
              <span className="text-sky-200">with Confidence</span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed max-w-3xl mx-auto">
              Free AI-powered tax help built specifically for F-1 and J-1 international students.
              Meet Maya — your personal tax assistant who speaks plain English.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {['100% Free', 'Secure & Private', 'Built for International Students', 'No Account Required'].map((badge) => (
                <span key={badge} className="bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full border border-white/30">
                  ✓ {badge}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/app')}
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-lg py-4 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95"
              >
                Start Filing Now — It's Free →
              </button>
              <a
                href="#how-it-works"
                className="bg-transparent border-2 border-white/60 text-white hover:bg-white/10 font-semibold text-lg py-4 px-8 rounded-2xl transition-all duration-200"
              >
                ▶ How It Works
              </a>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              {[
                { value: '15+', label: 'Countries with Tax Treaties' },
                { value: '$1.2K', label: 'Average Refund Found' },
                { value: '20min', label: 'Average Completion Time' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-blue-200 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-20">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full">
            <path d="M0 80L60 72C120 64 240 48 360 44C480 40 600 48 720 52C840 56 960 56 1080 52C1200 48 1320 40 1380 36L1440 32V80H0Z" fill="#F8FAFC"/>
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              File in 4 Simple Steps
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No tax knowledge required. Maya guides you through everything in plain, friendly language.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map((step, idx) => (
              <div key={idx} className="relative text-center group">
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-3/4 w-1/2 h-0.5 bg-gradient-to-r from-blue-200 to-sky-200 -translate-y-1/2 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                    {step.icon}
                  </div>
                  <div className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center mx-auto -mt-2 mb-4">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/app')}
              className="btn-primary text-lg py-4 px-10"
            >
              Try It Now — Completely Free
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Students Choose TaxMate
            </h2>
            <p className="text-lg text-gray-600">Everything you need, nothing you don't.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="card hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Feature highlight: Treaty detection */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-sky-500 rounded-3xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-sm font-semibold text-blue-200 mb-2 uppercase tracking-wider">Automatic Detection</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  We Find Money You Didn't Know You Had
                </h3>
                <p className="text-blue-100 leading-relaxed mb-6">
                  Many international students overpay taxes because they don't know about tax treaties or FICA exemptions.
                  TaxMate automatically checks if you qualify — and most students from China, India, South Korea, and 15+ other countries do.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['FICA Refunds', 'Tax Treaty Benefits', 'Form 8833 Filing', 'Scholarship Exemptions'].map((item) => (
                    <span key={item} className="bg-white/20 text-white text-sm px-3 py-1 rounded-full border border-white/30">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                  <div className="text-5xl mb-3">🎉</div>
                  <div className="text-xl font-bold mb-1">Treaty Found!</div>
                  <div className="text-blue-100 text-sm mb-4">China — Article 20</div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <div className="text-3xl font-extrabold">$2,400</div>
                    <div className="text-blue-200 text-sm mt-1">Estimated tax savings</div>
                  </div>
                  <p className="text-blue-100 text-xs mt-3">
                    Student income fully exempt for 5 years under Article 20
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Students Around the World Trust TaxMate
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="card hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-sky-100 rounded-full flex items-center justify-center text-2xl">
                    {t.flag}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.university} · {t.country}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed italic">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-700 to-sky-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to File Your Taxes?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of international students who filed confidently with TaxMate.
            Free, private, and built just for you.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-xl py-5 px-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95"
          >
            Start Filing Now — It's Free →
          </button>
          <p className="text-blue-200 text-sm mt-4">No account required · No data stored after session</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-sky-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-white font-bold text-lg">TaxMate</span>
              </div>
              <p className="text-sm leading-relaxed">
                Free AI-powered tax preparation for F-1 and J-1 international students. Built with care.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm">
                <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <button onClick={() => navigate('/app')} className="text-left hover:text-white transition-colors">Start Filing</button>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Important Notes</h4>
              <p className="text-xs leading-relaxed">
                TaxMate is an AI-powered tool and is not a licensed tax professional.
                Always review forms before submitting. For complex situations, consult your
                university's international student services office or a certified CPA.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            <p>© 2025 TaxMate. Built for international students. · TaxMate does not store personal tax data beyond your current session.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
