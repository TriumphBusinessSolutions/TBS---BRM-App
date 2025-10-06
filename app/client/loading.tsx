import styles from "./loading.module.css";

export default function ClientLoading() {
  return (
    <div className={styles.skeletonLayout}>
      <div className={styles.skeletonCard} />
      <div className={styles.skeletonCard} />
      <div className={styles.skeletonCard} />
    </div>
  );
}
