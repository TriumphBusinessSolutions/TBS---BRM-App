"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";

type AccountType = "single" | "multi";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  accountType: AccountType;
  companiesIncluded: number;
};

const defaultState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  companyName: "",
  accountType: "single",
  companiesIncluded: 3,
};

const accountOptions: Array<{
  id: AccountType;
  label: string;
  price: string;
  description: string;
  details: string;
}> = [
  {
    id: "single",
    label: "Single Business Owner",
    price: "$49 / month",
    description: "Perfect for founders building momentum in one company.",
    details: "Includes one active company workspace with mentor collaboration.",
  },
  {
    id: "multi",
    label: "Multi-Company Suite",
    price: "$99 / month",
    description: "Ideal for mentors and operators supporting multiple brands.",
    details: "Covers up to three companies, then $39 / month for each additional company.",
  },
];

export default function RegisterForm() {
  const [form, setForm] = useState<FormState>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

  const totalEstimate = useMemo(() => {
    if (form.accountType === "single") {
      return 49;
    }

    const includedCompanies = 3;
    if (form.companiesIncluded <= includedCompanies) {
      return 99;
    }

    const additionalCompanies = form.companiesIncluded - includedCompanies;
    return 99 + additionalCompanies * 39;
  }, [form.accountType, form.companiesIncluded]);

  const handleChange = <Field extends keyof FormState>(field: Field) =>
    (value: FormState[Field]) => {
      setForm((current) => ({
        ...current,
        [field]: value,
      }));
    };

  const handleInputChange = (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "companiesIncluded" ? Number(event.target.value) || 0 : event.target.value;
      handleChange(field)(value as FormState[typeof field]);
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage(null);

    const payload = {
      ...form,
      totalEstimate,
    };

    setTimeout(() => {
      console.log("Mock registration payload", payload);
      setIsSubmitting(false);
      setSubmissionMessage("Thanks! A Triumph specialist will reach out to finish your onboarding.");
      setForm(defaultState);
    }, 900);
  };

  return (
    <section className="form-shell" aria-live="polite">
      <header>
        <h2>Create your account</h2>
        <p>
          Tell us who is getting started and choose the membership that fits today. We’ll confirm your
          Triumph mentor and schedule your onboarding session.
        </p>
      </header>

      <form className="form-panel form-panel--signup is-active" onSubmit={handleSubmit}>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="register-firstName">First Name</label>
            <div className="input-shell">
              <input
                id="register-firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Jordan"
                value={form.firstName}
                onChange={handleInputChange("firstName")}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="register-lastName">Last Name</label>
            <div className="input-shell">
              <input
                id="register-lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Rivera"
                value={form.lastName}
                onChange={handleInputChange("lastName")}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="register-companyName">Primary Company Name</label>
          <div className="input-shell">
            <input
              id="register-companyName"
              name="companyName"
              type="text"
              autoComplete="organization"
              placeholder="Triumph Ventures"
              value={form.companyName}
              onChange={handleInputChange("companyName")}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="register-email">Work Email</label>
          <div className="input-shell">
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@triumph.com"
              value={form.email}
              onChange={handleInputChange("email")}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="register-password">Create Password</label>
          <div className="input-shell">
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleInputChange("password")}
              required
              minLength={8}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <fieldset className="field fieldset">
          <legend>Select your account type</legend>
          <div className="plan-grid">
            {accountOptions.map((option) => {
              const isActive = form.accountType === option.id;
              return (
                <label
                  key={option.id}
                  className={`plan-card ${isActive ? "is-selected" : ""}`}
                  htmlFor={`plan-${option.id}`}
                >
                  <input
                    id={`plan-${option.id}`}
                    type="radio"
                    name="accountType"
                    value={option.id}
                    checked={isActive}
                    onChange={() => handleChange("accountType")(option.id)}
                    disabled={isSubmitting}
                  />
                  <span className="plan-card__label">{option.label}</span>
                  <span className="plan-card__price">{option.price}</span>
                  <span className="plan-card__description">{option.description}</span>
                  <span className="plan-card__details">{option.details}</span>
                </label>
              );
            })}
          </div>
          {form.accountType === "multi" ? (
            <div className="field plan-addon">
              <label htmlFor="register-companiesIncluded">How many companies do you manage?</label>
              <div className="input-shell">
                <input
                  id="register-companiesIncluded"
                  name="companiesIncluded"
                  type="number"
                  min={1}
                  value={form.companiesIncluded}
                  onChange={handleInputChange("companiesIncluded")}
                  disabled={isSubmitting}
                />
              </div>
              <p className="help-text">
                {form.companiesIncluded <= 3
                  ? "Your first three companies are included in the monthly rate."
                  : `Estimated monthly total: $${totalEstimate.toLocaleString()}.`}
              </p>
            </div>
          ) : (
            <p className="help-text">
              Manage one business today and upgrade any time as your portfolio grows.
            </p>
          )}
        </fieldset>

        <div className="plan-summary">
          <p>
            <strong>Estimated monthly investment:</strong> ${totalEstimate.toLocaleString()} USD
          </p>
          {form.accountType === "multi" && form.companiesIncluded > 3 ? (
            <p>
              Includes ${Math.min(form.companiesIncluded, 3)} companies in the base plan plus {" "}
              {form.companiesIncluded - 3} additional at $39 each.
            </p>
          ) : (
            <p>Includes Triumph mentor onboarding and full access for your core team.</p>
          )}
        </div>

        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Submitting" : "Create Account"}
        </button>

        {submissionMessage ? <p className="success-message">{submissionMessage}</p> : null}
      </form>
    </section>
  );
}
