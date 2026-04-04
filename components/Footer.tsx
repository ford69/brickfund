import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10 lg:mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center mb-6" aria-label="BrickFund Home">
              <Image
                src="/images/logo.png"
                alt="BrickFund"
                width={160}
                height={160}
                className="h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 object-contain"
              />
            </Link>
            <p className="text-background/70 text-sm sm:text-base leading-relaxed max-w-sm mb-6">
              Democratizing real estate investment through crowdfunding. Building wealth, brick by
              brick, for everyone.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/90 mb-4">
              Investors
            </h3>
            <ul className="space-y-3 text-sm text-background/70">
              <li>
                <Link href="/projects" className="hover:text-background transition-colors">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-background transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-background transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/risk-disclosure" className="hover:text-background transition-colors">
                  Risk Disclosure
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-background transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/90 mb-4">
              Developers
            </h3>
            <ul className="space-y-3 text-sm text-background/70">
              <li>
                <Link href="/developer-guide" className="hover:text-background transition-colors">
                  Developer Guide
                </Link>
              </li>
              <li>
                <Link href="/verification-process" className="hover:text-background transition-colors">
                  Verification Process
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:text-background transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-background transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/90 mb-4">
              Contact
            </h3>
            <div className="space-y-4 text-sm text-background/70">
              <a
                href="mailto:brickfundglobal@gmail.com"
                className="flex items-center gap-3 hover:text-background transition-colors"
              >
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <span>brickfundglobal@gmail.com</span>
              </a>
              <a
                href="tel:+233598321546"
                className="flex items-center gap-3 hover:text-background transition-colors"
              >
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <span>0598321546 / 0277159203</span>
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <span>Sanyo Road, Opposite PZ Cusson location</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} BrickFund. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-background/60">
              <Link href="/privacy-policy" className="hover:text-background transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-background transition-colors">
                Terms of Service
              </Link>
              <Link href="/securities" className="hover:text-background transition-colors">
                Securities
              </Link>
              <Link href="/compliance" className="hover:text-background transition-colors">
                Compliance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
