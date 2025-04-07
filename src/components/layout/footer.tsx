"use client"

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NewsletterCTA() {
  return (
    <section className="bg-primary/5 border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
          <p className="text-muted-foreground mb-6">
            Subscribe to our newsletter for the latest workspace updates and exclusive offers.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const footerLinks = {
    "Support": [
      { label: "Help Center", href: "/help" },
      { label: "AirCover", href: "/aircover" },
      { label: "Anti-discrimination", href: "/anti-discrimination" },
      { label: "Disability Support", href: "/accessibility" },
      { label: "Cancellation Options", href: "/cancellation" },
      { label: "Report Neighborhood Concern", href: "/report" },
    ],
    "Hosting": [
      { label: "List Your Workspace", href: "/host" },
      { label: "AirCover for Hosts", href: "/host/aircover" },
      { label: "Host Resources", href: "/host/resources" },
      { label: "Community Forum", href: "/community" },
      { label: "Hosting Responsibly", href: "/host/responsible" },
      { label: "Hosting Guide", href: "/host/guide" },
      { label: "Co-Host Program", href: "/host/co-host" },
    ],
    "WorkspaceShare": [
      { label: "Newsroom", href: "/news" },
      { label: "New Features", href: "/features" },
      { label: "Careers", href: "/careers" },
      { label: "Investors", href: "/investors" },
      { label: "Gift Cards", href: "/gift" },
    ],
  }

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span> 2025 WorkspaceShare, Inc.</span>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/sitemap" className="hover:text-foreground">Sitemap</Link>
            <Link href="/company" className="hover:text-foreground">Company Details</Link>
          </div>
          <div className="flex gap-6">
            <select 
              className="bg-transparent text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              defaultValue="EUR"
            >
              <option value="EUR"> EUR</option>
              <option value="USD">$ USD</option>
              <option value="GBP"> GBP</option>
            </select>
            <select
              className="bg-transparent text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              defaultValue="NL"
            >
              <option value="NL">Nederlands (NL)</option>
              <option value="EN">English (EN)</option>
              <option value="DE">Deutsch (DE)</option>
            </select>
            <div className="flex gap-4">
              <Link href="https://facebook.com" className="text-muted-foreground hover:text-foreground">
                <span className="material-icons">facebook</span>
              </Link>
              <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
                <span className="material-icons">twitter</span>
              </Link>
              <Link href="https://instagram.com" className="text-muted-foreground hover:text-foreground">
                <span className="material-icons">instagram</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
