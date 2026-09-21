"use client";

import React, { useState } from "react";
import styles from "./CrownAvatar.module.css";

export interface CrownAvatarProps {
  size?: "sm" | "md" | "lg";
  src?: string | null;
  initials?: string;
  alt?: string;
  isSubscribed?: boolean;
  className?: string;
  avatarClassName?: string;
  crownClassName?: string;
  interactive?: boolean;
  onClick?: () => void;
  crownSrc?: string;
  showOnline?: boolean;
}

export function CrownAvatar({
  size = "md",
  src,
  initials = "U",
  alt = "User Avatar",
  isSubscribed = false,
  className = "",
  avatarClassName = "",
  crownClassName = "",
  interactive = false,
  onClick,
  crownSrc = "/images/crown.png",
  showOnline = false,
}: CrownAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: styles.avatarSm,
    md: styles.avatarMd,
    lg: styles.avatarLg,
  };

  return (
    <div
      className={`${styles.container} ${className} ${interactive ? styles.interactive : ""}`}
      onClick={interactive ? onClick : undefined}
    >
      <div className={`${styles.avatarWrapper} ${sizeClasses[size]} ${avatarClassName}`}>
        {src && !imgError ? (
          <img
            src={src}
            alt={alt}
            className={styles.avatarImage}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.initialsFallback}>{initials}</div>
        )}
        {showOnline && <span className={styles.onlineDot} />}
      </div>
      {isSubscribed && (
        <img
          src={crownSrc}
          alt="Premium Member"
          className={`${styles.crownIcon} ${crownClassName}`}
        />
      )}
    </div>
  );
}
