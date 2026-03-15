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
          // Parse the numeric value
          const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
          const duration = 2000; // 2 seconds
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

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  // Format the displayed number
  const formatValue = (num: number): string => {
    if (value.includes('Billion')) {
      return num.toFixed(1);
    } else if (value.includes('+')) {
      return Math.floor(num).toLocaleString();
    } else if (value.includes('%')) {
      return num.toFixed(1);
    } else if (value.includes('-')) {
      return Math.floor(num).toString();
    }
    return Math.floor(num).toString();
  };

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-charcoal-700/40 bg-gradient-to-br from-charcoal-800/85 to-charcoal-900/85 p-6 backdrop-blur-sm shadow-glass transition-all duration-300 hover:border-accent-500/30 hover:shadow-dark"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background glow effect */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-500/10 blur-2xl transition-all duration-300 group-hover:bg-accent-500/20" />

      <div className="relative">
        {/* Icon */}
        <div className="mb-4 inline-flex rounded-xl bg-accent-500/10 p-3 text-accent-400 transition-all duration-300 group-hover:bg-accent-500/15 group-hover:text-accent-300">
          {icon}
        </div>

        {/* Value */}
        <div className="mb-2">
          <span className="text-3xl font-bold text-clinical-white md:text-4xl">
            {hasAnimated ? formatValue(count) : '0'}
          </span>
          <span className="ml-1 text-2xl font-bold text-accent-400 md:text-3xl">
            {suffix}
          </span>
        </div>

        {/* Label */}
        <p className="text-sm font-medium text-charcoal-300 md:text-base">{label}</p>
      </div>
    </div>
  );
}

export function MarketStats() {
  return (
    <section className="border-y border-charcoal-700/40 bg-gradient-to-b from-charcoal-800/95 to-charcoal-900 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-clinical-white md:text-4xl">
            The Peptide Research Revolution
          </h2>
          <p className="mt-4 text-lg text-charcoal-300 md:text-xl">
            Leading the advancement of peptide science and human health research
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatItem
            icon={<ChartBar className="h-6 w-6" />}
            value="5.2"
            suffix=" Billion"
            label="Global Peptide Market 2024"
            delay={0}
          />

          <StatItem
            icon={<TrendingUp className="h-6 w-6" />}
            value="14.2"
            suffix="% CAGR"
            label="Annual Market Growth Rate"
            delay={100}
          />

          <StatItem
            icon={<FlaskConical className="h-6 w-6" />}
            value="2000"
            suffix="+"
            label="Active Clinical Trials Worldwide"
            delay={200}
          />

          <StatItem
            icon={<Award className="h-6 w-6" />}
            value="140"
            suffix="+"
            label="FDA-Approved Peptide Drugs"
            delay={300}
          />

          <StatItem
            icon={<Target className="h-6 w-6" />}
            value="99.5"
            suffix="%+"
            label="Average Purity Guarantee"
            delay={400}
          />

          <StatItem
            icon={<Truck className="h-6 w-6" />}
            value="48"
            suffix="-Hour"
            label="Domestic Shipping Time"
            delay={500}
          />
        </div>

        {/* Supporting Text */}
        <div className="mt-12 text-center">
          <p className="mx-auto max-w-3xl text-sm text-charcoal-400 md:text-base">
            MAHA Peptides supports America&apos;s research leadership with pharmaceutical-grade compounds,
            rigorous quality standards, and a commitment to scientific innovation. Every product meets
            stringent purity requirements verified through independent third-party testing.
          </p>
        </div>
      </div>
    </section>
  );
}
