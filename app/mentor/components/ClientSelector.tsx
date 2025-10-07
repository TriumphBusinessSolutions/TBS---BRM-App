"use client";

import type { ChangeEventHandler } from "react";

import Icon from "./Icon";
import styles from "./ClientSelector.module.css";
import { ArrowIcon, UsersIcon } from "./icons";

type ClientSelectorProps = {
  clients: { id: string; name: string }[];
  selectedClientId: string | null;
  onSelect: (id: string | null) => void;
  helperText?: string;
  disabled?: boolean;
};

export default function ClientSelector({
  clients,
  selectedClientId,
  onSelect,
  helperText,
  disabled,
}: ClientSelectorProps) {
  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const value = event.target.value;
    onSelect(value === "" ? null : value);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <span>Select a client to view activity</span>
        <Icon size="sm" aria-hidden>
          <UsersIcon />
        </Icon>
      </div>
      <div className={styles.selectControl}>
        <select value={selectedClientId ?? ""} onChange={handleChange} disabled={disabled} aria-label="Select client">
          <option value="" disabled>
            {clients.length > 0 ? "Choose a client" : "No clients available"}
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <span className={styles.caret} aria-hidden>
          <Icon size="sm">
            <ArrowIcon />
          </Icon>
        </span>
      </div>
      {helperText ? <span className={styles.helperText}>{helperText}</span> : null}
    </div>
  );
}
