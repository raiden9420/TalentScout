"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Interview", href: "/interview" },
    { name: "Resume", href: "/resume" },
    { name: "Admin", href: "/admin" },
  ];

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-content">
        <Link href="/" className="brand">
          <span className="logo-icon">🌿</span>
          TalentScout
        </Link>
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 20px 0;
          transition: all 0.3s ease;
        }
        .navbar.scrolled {
          padding: 12px 0;
          background: rgba(248, 253, 245, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(34, 197, 94, 0.1);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);
        }
        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand {
          font-weight: 700;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
        }
        .logo-icon {
          font-size: 1.4rem;
        }
        .nav-links {
          display: flex;
          gap: 32px;
        }
        .nav-link {
          font-weight: 500;
          color: var(--text-secondary);
          transition: color 0.2s;
          position: relative;
          font-size: 0.95rem;
        }
        .nav-link:hover,
        .nav-link.active {
          color: var(--accent-green);
        }
        .nav-link.active::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent-gradient);
          border-radius: 2px;
        }
      `}</style>
    </nav>
  );
}
