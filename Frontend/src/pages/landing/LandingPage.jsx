import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LandingPageLayout from '../../components/layout/LandingPageLayout';
import AOS from 'aos';
import 'aos/dist/aos.css';

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  Truck,
  Recycle,
  Leaf,
  Users,
  CheckCircle2,
  Monitor,
  BatteryCharging,
  Building2,
  ClipboardCheck,
  Factory,
  PhoneCall,
  Smartphone,
  Laptop,
  Tv,
  Cpu,
} from 'lucide-react';

/* HERO BANNERS */
import banner1 from '../../assets/banners/banner1.png';
import banner2 from '../../assets/banners/banner2.png';
import banner3 from '../../assets/banners/banner3.png';
import banner4 from '../../assets/banners/banner4.png';
import mobileImage from '../../assets/categories/mobile.png';
import laptopImage from '../../assets/categories/laptop.png';
import tvImage from '../../assets/categories/tv.png';
import accessoriesImage from '../../assets/categories/accessories.png';
import banner5 from '../../assets/banners/banner5.png';

const HERO_SLIDES = [
  {
    id: 1,
    image: banner1,
    badge: 'EcoCycle Smart Recycling',
    title: 'Turn e-waste into measurable environmental impact.',
    description: 'Track collections and build a cleaner future.',
    primaryText: 'Get Started',
    secondaryText: 'Learn More',
  },
  {
    id: 2,
    image: banner2,
    badge: 'Data-Driven Sustainability',
    title: 'See recycling performance through analytics.',
    description: 'Monitor trends and environmental contribution.',
    primaryText: 'Explore Platform',
    secondaryText: 'View Impact',
  },
  {
    id: 3,
    image: banner3,
    badge: 'Safe Disposal',
    title: 'Recycle electronics the responsible way.',
    description: 'Manage e-waste properly with EcoCycle.',
    primaryText: 'Book Pickup',
    secondaryText: 'Contact Us',
  },
];

const IMPACT_STATS = [
  { value: '10K+', label: 'Items Recycled' },
  { value: '2500+', label: 'Active Users' },
  { value: '120+', label: 'Pickup Routes' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Track Data',
    description:
      'Monitor recycling performance, item flow, and environmental progress through one clean dashboard.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Process',
    description:
      'Create a safer, more responsible workflow for handling electronic waste and related materials.',
  },
  {
    icon: Truck,
    title: 'Easy Pickup',
    description:
      'Simplify collection scheduling and improve coordination between users and pickup teams.',
  },
];

const CATEGORY_SHOWCASE = [
  {
    id: 1,
    title: 'Mobile',
    subtitle: 'Smartphones | Tablets | Accessories',
    description:
      'Recycle damaged phones, old devices, chargers, and unused mobile accessories responsibly.',
    dateNumber: '01',
    dateLabel: 'Category',
    image: mobileImage,
    icon: Smartphone,
  },
  {
    id: 2,
    title: 'Laptop',
    subtitle: 'Laptops | Chargers | Peripherals',
    description:
      'Manage outdated laptops, computer accessories, and work devices through a cleaner process.',
    dateNumber: '02',
    dateLabel: 'Category',
    image: laptopImage,
    icon: Laptop,
  },
  {
    id: 3,
    title: 'TV',
    subtitle: 'Televisions | Displays | Screens',
    description:
      'Handle old televisions and display devices with safer and more structured recycling support.',
    dateNumber: '03',
    dateLabel: 'Category',
    image: tvImage,
    icon: Tv,
  },
  {
    id: 4,
    title: 'Accessories',
    subtitle: 'Components | Cables | Gadgets',
    description:
      'Collect and process cables, adapters, computer parts, and electronic accessories more efficiently.',
    dateNumber: '04',
    dateLabel: 'Category',
    image: accessoriesImage,
    icon: Cpu,
  },
];

const SERVICES = [
  {
    icon: Monitor,
    title: 'Electronic Device Collection',
    description:
      'Manage laptops, desktops, monitors, and accessories with a more organized recycling flow.',
  },
  {
    icon: BatteryCharging,
    title: 'Battery Handling',
    description:
      'Support careful battery disposal and improve safety in collection and recycling processes.',
  },
  {
    icon: Building2,
    title: 'Business Support',
    description:
      'Help organizations and institutions manage larger e-waste volumes in a structured way.',
  },
  {
    icon: Recycle,
    title: 'Sustainability Reporting',
    description:
      'Present environmental impact through visible metrics and stronger recycling transparency.',
  },
];

const PROCESS = [
  {
    icon: ClipboardCheck,
    title: 'Submit Request',
    description:
      'Users begin by registering or submitting a recycling need through the platform.',
  },
  {
    icon: Truck,
    title: 'Schedule Pickup',
    description:
      'Pickup coordination becomes easier with a cleaner digital workflow and better visibility.',
  },
  {
    icon: Factory,
    title: 'Process Responsibly',
    description:
      'Items move into the proper recycling and disposal channels with more structure and accountability.',
  },
  {
    icon: Leaf,
    title: 'Measure Impact',
    description:
      'Track progress with clear results that support sustainability goals and operational decisions.',
  },
];

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
      offset: 80,
    });
  }, []);

  const activeSlide = useMemo(() => HERO_SLIDES[currentSlide], [currentSlide]);

  return (
    <LandingPageLayout>
      <div className="min-h-screen bg-slate-50">
        {/* HERO SECTION */}
        <section className="relative h-screen w-full overflow-hidden">
          <img
            src={activeSlide.image}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/20" />

          <div className="relative z-10 h-full flex items-center max-w-[1400px] mx-auto px-6">
            <div
              className="text-white max-w-3xl"
              data-aos="fade-up"
            >
              <div className="mb-6 text-sm bg-white/20 px-4 py-2 rounded-full inline-block">
                {activeSlide.badge}
              </div>

              <h1 className="text-5xl font-bold mb-6 leading-tight">
                {activeSlide.title}
              </h1>

              <p className="text-lg mb-8 text-white/90">
                {activeSlide.description}
              </p>

              <div className="flex gap-4">
                <Link
                  to="/register"
                  className="bg-white text-[#0f55a7] px-6 py-3 rounded-full font-semibold hover:scale-105 transition inline-flex items-center gap-2"
                >
                  {activeSlide.primaryText}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#stats"
                  className="border border-white px-6 py-3 rounded-full hover:bg-white/10 transition"
                >
                  {activeSlide.secondaryText}
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              setCurrentSlide(
                (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
              )
            }
            className="absolute left-6 bottom-20 bg-white p-3 rounded-full shadow hover:scale-110 transition"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
            }
            className="absolute right-6 bottom-20 bg-white p-3 rounded-full shadow hover:scale-110 transition"
          >
            <ChevronRight />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-20 flex gap-2">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? 'w-6 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </section>

        {/* STATS */}
        <section id="stats" className="pt-4 pb-8 bg-slate-100">
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {IMPACT_STATS.map((item, index) => (
              <div
                key={item.label}
                className="bg-white p-8 rounded-2xl text-center shadow hover:shadow-lg transition"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <h3 className="text-4xl font-bold text-[#2a9322]">
                  {item.value}
                </h3>
                <p className="text-gray-500 mt-2">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-8 bg-slate-100">
          <div className="max-w-[1400px] mx-auto px-6 text-center">
            <div data-aos="fade-up">
              <h2 className="text-4xl font-bold mb-5">
                <span className="text-[#0f55a7]">Smart</span>{' '}
                <span className="text-[#4db848]">Recycling Platform</span>
              </h2>

              <p className="max-w-3xl mx-auto text-gray-600 text-lg leading-8 mb-10">
                EcoCycle helps users, organizations, and collection teams manage electronic waste
                through a cleaner digital workflow, stronger environmental visibility, and a more
                professional recycling experience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((item, index) => (
                <div
                  key={item.title}
                  className="bg-white p-6 rounded-xl shadow"
                  data-aos="fade-up"
                  data-aos-delay={index * 120}
                >
                  <item.icon className="mx-auto mb-4 text-[#0f55a7]" />
                  <h3 className="font-bold mb-3 text-lg">{item.title}</h3>
                  <p className="text-gray-500 leading-7">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOVER CATEGORY SECTION */}
        <section className="py-16 bg-white">
          <div className="max-w-[1400px] mx-auto px-6">
            <div
              className="flex items-end justify-between gap-6 mb-10 flex-wrap"
              data-aos="fade-up"
            >
              <div>
                <p className="text-[#0f55a7] font-semibold text-sm uppercase tracking-[0.2em] mb-3">
                  E-Waste Categories
                </p>
                <h2 className="text-4xl font-bold leading-tight mb-4">
                  <span className="text-[#0f55a7]">Explore what you can</span>{' '}
                  <span className="text-[#4db848]">recycle with EcoCycle</span>
                </h2>
                <p className="max-w-3xl text-gray-600 text-lg leading-8">
                  This section works like the example you showed. When users hover on a category
                  card, the image appears and the card becomes more interactive.
                </p>
              </div>

              <a
                href="#services"
                className="text-[#0f55a7] font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
              >
                View Services
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {CATEGORY_SHOWCASE.map((item) => (
                <div
                  key={item.id}
                  className="group relative h-[420px] overflow-hidden border border-slate-200 bg-[#f3f4f6] shadow-sm"
                  data-aos="fade-up"
                  data-aos-delay={item.id * 100}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition duration-500" />

                  <div className="relative z-10 h-full flex flex-col justify-between p-6">
                    <div>
                      <div className="w-12 h-12 bg-white/90 group-hover:bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6 transition">
                        <item.icon className="w-6 h-6 text-[#0f55a7] group-hover:text-white transition" />
                      </div>

                      <p className="text-sm font-semibold text-slate-700 group-hover:text-white/90 mb-4 transition">
                        {item.subtitle}
                      </p>

                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white leading-tight transition mb-4">
                        {item.title}
                      </h3>

                      <p className="text-slate-600 group-hover:text-white/85 leading-7 text-sm transition">
                        {item.description}
                      </p>
                    </div>

                    <div>
                      <div className="h-px bg-slate-300 group-hover:bg-white/40 transition mb-5" />
                      <div className="flex items-end justify-between">
                        <div className="text-6xl font-bold text-slate-900 group-hover:text-white transition leading-none">
                          {item.dateNumber}
                        </div>
                        <div className="text-right">
                          <p className="text-base text-slate-700 group-hover:text-white transition">
                            {item.dateLabel}
                          </p>
                          <p className="text-sm text-slate-500 group-hover:text-white/80 transition">
                            EcoCycle
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY ECOCYCLE */}
        <section className="py-16 bg-slate-100">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div data-aos="fade-right">
                <p className="text-[#0f55a7] font-semibold text-sm uppercase tracking-[0.2em] mb-3">
                  Why EcoCycle
                </p>
                <h2 className="text-4xl font-bold leading-tight mb-6">
                  <span className="text-[#0f55a7]">A better way to manage</span>{' '}
                  <span className="text-[#4db848]">electronic waste.</span>
                </h2>
                <p className="text-gray-600 text-lg leading-8 mb-8">
                  A strong recycling platform should do more than collect requests. It should
                  improve user trust, reduce manual effort, support sustainability goals, and give
                  teams the visibility they need to operate efficiently.
                </p>

                <div className="space-y-4">
                  {[
                    'Improve recycling coordination through a cleaner digital process.',
                    'Strengthen environmental credibility with measurable impact reporting.',
                    'Create a more professional experience for public users and business partners.',
                    'Support long-term sustainability messaging with a modern platform design.',
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-start gap-3"
                      data-aos="fade-right"
                      data-aos-delay={index * 100}
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#2a9322] mt-1 shrink-0" />
                      <p className="text-gray-700 leading-7">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm"
                data-aos="fade-left"
              >
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200">
                    <Users className="w-8 h-8 text-[#0f55a7] mb-4" />
                    <h3 className="font-bold mb-2">User Friendly</h3>
                    <p className="text-sm text-gray-500 leading-6">
                      Make the recycling process easier for users and teams.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200">
                    <Leaf className="w-8 h-8 text-[#2a9322] mb-4" />
                    <h3 className="font-bold mb-2">Eco Focused</h3>
                    <p className="text-sm text-gray-500 leading-6">
                      Reinforce sustainability with stronger environmental messaging.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200">
                    <ShieldCheck className="w-8 h-8 text-[#0f55a7] mb-4" />
                    <h3 className="font-bold mb-2">Reliable Process</h3>
                    <p className="text-sm text-gray-500 leading-6">
                      Add structure to the collection and disposal workflow.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-slate-200">
                    <BarChart3 className="w-8 h-8 text-[#2a9322] mb-4" />
                    <h3 className="font-bold mb-2">Data Visibility</h3>
                    <p className="text-sm text-gray-500 leading-6">
                      Use metrics and trends to support better decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MIDDLE BANNER 4 */}
        <section className="bg-white" data-aos="zoom-in">
          <div className="w-full flex justify-center">
            <img
              src={banner4}
              alt="EcoCycle banner"
              className="w-full h-auto object-contain"
            />
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-16 bg-slate-100">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center mb-12" data-aos="fade-up">
              <p className="text-[#0f55a7] font-semibold text-sm uppercase tracking-[0.2em] mb-3">
                Services
              </p>
              <h2 className="text-4xl font-bold mb-5">
                <span className="text-[#0f55a7]">Designed for users,</span>{' '}
                <span className="text-[#4db848]">businesses, and institutions</span>
              </h2>
              <p className="max-w-3xl mx-auto text-gray-600 text-lg leading-8">
                A strong business landing page should clearly explain what the platform supports and
                why that matters to different audiences.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {SERVICES.map((item, index) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm hover:shadow-lg transition"
                  data-aos="fade-up"
                  data-aos-delay={index * 120}
                >
                  <item.icon className="w-10 h-10 text-[#2a9322] mb-5" />
                  <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-7 text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="py-16 bg-white">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center mb-12" data-aos="fade-up">
              <p className="text-[#0f55a7] font-semibold text-sm uppercase tracking-[0.2em] mb-3">
                How It Works
              </p>
              <h2 className="text-4xl font-bold mb-5">
                <span className="text-[#0f55a7]">Simple steps,</span>{' '}
                <span className="text-[#4db848]">clear results</span>
              </h2>
              <p className="max-w-3xl mx-auto text-gray-600 text-lg leading-8">
                Help visitors quickly understand the journey from request to responsible recycling.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {PROCESS.map((item, index) => (
                <div
                  key={item.title}
                  className="bg-slate-50 rounded-2xl p-7 shadow-sm border border-slate-200"
                  data-aos="fade-up"
                  data-aos-delay={index * 120}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0f55a7] to-[#4db848] text-white flex items-center justify-center font-bold mb-5">
                    {index + 1}
                  </div>
                  <item.icon className="w-7 h-7 text-[#0f55a7] mb-4" />
                  <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-7 text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

{/* FINAL CTA BANNER */}
<section id="contact" className="relative bg-white">
  <img
    src={banner5}
    alt="EcoCycle support banner"
    className="w-full h-auto object-cover block"
  />

  {/* 🔥 DARK GRADIENT OVERLAY */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />

  <div className="absolute inset-0 flex items-center">
    <div className="max-w-[1400px] mx-auto w-full px-6">
      <div className="max-w-[500px] text-white">

        {/* label */}
        <p className="uppercase tracking-[0.15em] text-xs text-white/80 mb-2">
          Ready to Start?
        </p>

        {/* heading */}
        <h2 className="text-2xl md:text-4xl font-semibold leading-[1.2] mb-4">
          Create a stronger recycling experience.
        </h2>

        {/* description */}
        <p className="text-sm md:text-base text-white/90 leading-6 mb-6">
          Manage e-waste responsibly with a smarter platform.
        </p>

        {/* buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            to="/register"
            className="bg-white text-[#0f55a7] px-6 py-3 rounded-full text-sm font-semibold hover:scale-105 transition"
          >
            Create Account
          </Link>

          <Link
            to="/login"
            className="border border-white/40 px-6 py-3 rounded-full text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Sign In
          </Link>
        </div>

      </div>
    </div>
  </div>
</section>
      </div>
    </LandingPageLayout>
  );
};

export default LandingPage;