"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { CrownAvatar } from "@/components/user-component/common";
import {
  User,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { href: "/", label: "HOME" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/profile", label: "PROFILE" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className={styles.headerWrapper}>
      <div className={styles.headerInner}>
        <Link className={styles.logo} href="/">
          <span className={styles.logoSymbol}>✦</span>
          <span>FoodSaver</span>
        </Link>

        <nav className={styles.nav} aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink || ""} ${isActive(item.href) ? styles.active : ""}`}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`${styles.navLink || ""} ${isActive("/admin") ? styles.active : ""}`}
            >
              ADMIN
            </Link>
          )}
        </nav>

        <div className={styles.headerActions || "flex items-center justify-end gap-3"}>
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-stone-200/50 transition cursor-pointer"
              >
                <CrownAvatar
                  size="sm"
                  initials={user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  src={user.avatar_url}
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white/95 backdrop-blur-md shadow-xl border border-stone-200/60 p-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="font-semibold text-stone-800 truncate">{user.full_name || "User"}</p>
                    <p className="text-stone-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 text-stone-700 transition"
                  >
                    <User className="size-3.5" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 text-stone-700 transition"
                    >
                      <Shield className="size-3.5" />
                      <span>Quản trị viên</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 text-xs font-semibold rounded-full hover:bg-stone-200/60 transition"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-[#211914] text-[#f8f4ee] hover:opacity-90 transition shadow-sm"
              >
                Bắt đầu
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
