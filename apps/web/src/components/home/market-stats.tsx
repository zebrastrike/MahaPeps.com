'use client';

import { useEffect, useRef, useState } from 'react';
import { TrendingUp, FlaskConical, Award, Truck, Target, ChartBar } from 'lucide-react';

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  suffix?: string;
  label: string;
  delay?: number;
}

function StatItem({ icon, value, suffix = '', label, delay = 0 }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
          const duration = 2000;
          const steps = 60;
          const increment = numericValue / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
              setCount(numericValue);
              clearInterval(timer);
            } else {
              setCount(current);
            }
          }, duration / steps);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  const formatValue = (num: number): string => {
    if (value.includes('Billion')) return num.toFixed(1);
    if (value.includes('+'))       return Math.floor(num).toLocaleString();
    if (value.includes('%'))       return num.toFixed(1);
    if (value.includes('-'))       return Math.floor(num).toString();
    return Math.floor(num).toString();
  };

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden border border-gold-500/10 bg-navy-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold-500/25 hover:bg-navy-700/60"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gold glow on hover */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-500/5 blur-2xl transition-all duration-300 group-hover:bg-gold-500/15" />

      <div className="relative">
        <div className="mb-4 inline-flex p-2 text-gold-500/50 transition-all duration-300 group-hover:text-gold-400">
          {icon}
        </div>

        <div className="mb-2">
          <span className="font-editorial text-3xl text-warm-white md:text-4xl">
            {hasAnimated ? formatValue(count) : '0'}
          </span>
          <span className="font-editorial ml-1 text-2xl text-gold-400 md:text-3xl">
            {suffix}
          </span>
        </div>

        <p className="font-label text-[0.58rem] tracking-widest text-warm-white/40">{label}</p>
      </div>
    </div>
  );
}

export function MarketStats() {
  return (
    <section className="border-y border-gold-500/10 bg-gradient-to-b from-navy-800/80 to-navy-900 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-12 text-center">
          <p className="font-label mb-4 text-gold-500/55 tracking-[0.18em]">By the Numbers</p>
          <h2 className="font-editorial text-4xl text-warm-white md:text-5xl">
            The Peptide Research Revolution
          </h2>
          <hr className="divider-gold mx-auto mt-6 w-16" />
        </div>

        <div className="grid gap-px border border-gold-500/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatItem icon={<ChartBar className="h-5 w-5" />}     value="5.2"  suffix=" Billion" label="Global Peptide Market 2024"    delay={0}   />
          <StatItem icon={<TrendingUp className="h-5 w-5" />}   value="14.2" suffix="% CAGR"   label="Annual Market Growth Rate"     delay={100} />
          <StatItem icon={<FlaskConical className="h-5 w-5" />} value="2000" suffix="+"         label="Active Clinical Trials"        delay={200} />
          <StatItem icon={<Award className="h-5 w-5" />}        value="140"  suffix="+"         label="FDA-Approved Peptide Drugs"    delay={300} />
          <StatItem icon={<Target className="h-5 w-5" />}       value="99.5" suffix="%+"        label="Average Purity Guarantee"      delay={400} />
          <StatItem icon={<Truck className="h-5 w-5" />}        value="48"   suffix="-Hour"     label="Domestic Shipping Time"        delay={500} />
        </div>

        <div className="mt-10 text-center">
          <p className="mx-auto max-w-3xl text-xs font-light leading-relaxed text-warm-white/30 md:text-sm">
            MAHA Peptides supports America&apos;s research leadership with pharmaceutical-grade compounds,
            rigorous quality standards, and a commitment to scientific innovation. Every product meets
            stringent purity requirements verified through independent third-party testing.
          </p>
        </div>
      </div>
    </section>
  );
}
