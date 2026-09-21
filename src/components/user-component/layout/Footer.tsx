"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Link className={styles.brand} href="/">
        <span className={styles.brandMark}>✦</span>
        <span>FoodSaver</span>
      </Link>
      <p>Nền tảng giải pháp thông minh tối ưu và tiết kiệm thực phẩm.</p>
      <span>© 2026 FoodSaver</span>
    </footer>
  );
}
