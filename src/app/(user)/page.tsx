import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers } from "lucide-react";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.badge}>
          <Sparkles className="size-3.5" />
          <span>Kiến trúc chuẩn Next.js & Redux Toolkit</span>
        </div>

        <h1 className={styles.title}>
          Xây dựng ứng dụng hiện đại với trải nghiệm mượt mà
        </h1>

        <p className={styles.subtitle}>
          Dự án được cấu hình sẵn Tailwind CSS v4, CSS Modules, Redux Toolkit Query, Shadcn UI và phân tách rõ ràng giữa phân hệ User và Admin.
        </p>

        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.primaryBtn}>
            <span>Khám phá Dashboard</span>
            <ArrowRight className="inline-block ml-2 size-4" />
          </Link>
          <Link href="/admin" className={styles.secondaryBtn}>
            <span>Cổng Quản Trị</span>
          </Link>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Zap className="size-5" />
          </div>
          <h3 className={styles.cardTitle}>Hiệu Năng & Tối Ưu</h3>
          <p className={styles.cardDesc}>
            Sử dụng Next.js App Router kết hợp tối ưu Server & Client Components, CSS Modules và Tailwind v4.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Layers className="size-5" />
          </div>
          <h3 className={styles.cardTitle}>Redux Toolkit (RTK)</h3>
          <p className={styles.cardDesc}>
            Quản lý Global State và RTK Query API caching mượt mà, cấu hình sẵn Base API và authentication tags.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <ShieldCheck className="size-5" />
          </div>
          <h3 className={styles.cardTitle}>Phân Quyền User / Admin</h3>
          <p className={styles.cardDesc}>
            Route Groups riêng biệt `(user)` và `(admin)` với Layout, Theme globals và Role Guard độc lập.
          </p>
        </div>
      </section>
    </div>
  );
}
