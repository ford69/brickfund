'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Link from 'next/link';

export default function ContactUs() {
  return (
    <section
      id="contact"
      className="py-16 sm:py-20 lg:py-24 bg-foreground text-background relative overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-brown-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            Contact Us
          </h2>
          <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto">
            Have questions? Get in touch with our team. We&apos;re here to help
            with your investment journey.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">
                Get in touch
              </h3>
              <div className="space-y-6">
                <a
                  href="mailto:Emmagus12@gmail.com"
                  className="flex items-start gap-4 text-white/85 hover:text-white transition-colors"
                >
                  <div className="p-2 rounded-lg bg-white/10 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Email</p>
                    <p>Emmagus12@gmail.com</p>
                  </div>
                </a>
                <a
                  href="tel:+233598321546"
                  className="flex items-start gap-4 text-white/85 hover:text-white transition-colors"
                >
                  <div className="p-2 rounded-lg bg-white/10 shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Phone</p>
                    <p>0598321546 / 0277159203</p>
                  </div>
                </a>
                <div className="flex items-start gap-4 text-white/85">
                  <div className="p-2 rounded-lg bg-white/10 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Address</p>
                    <p>Sanyo Road, Opposite PZ Cusson location</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              Send us a message
            </h3>
            <p className="text-white/75 text-sm mb-6">
              For general inquiries or support, reach out via email or give us a
              call.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:Emmagus12@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:opacity-90 text-white font-medium transition-opacity"
              >
                <Send className="h-4 w-4" />
                Email Us
              </a>
              <a
                href="tel:+233598321546"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 font-medium transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
