import React, { useState, useEffect } from "react";
import {
  unstable_Form as Form,
  unstable_FormMessage as FormMessage,
  unstable_FormRadioGroup as FormRadioGroup,
  unstable_FormRadio as FormRadio,
  unstable_FormInput as FormInput,
  unstable_FormSubmitButton as FormSubmitButton,
  unstable_FormCheckbox as FormCheckbox,
  unstable_FormLabel as FormLabel,
} from "reakit/Form";
import SkeletonComponent from "../Skeleton/Skeleton";

import classNames from "classnames";

import InfoModal from "../InfoModal/InfoModal";
import { levelsToShow, compettionsInfo } from "../../utils/functions";
import styles from "./RegistrationForm.module.scss";
import countries from "../../utils/countries";
import { useDialogState } from "reakit/Dialog";
const flatProps = {
  options: countries.map((option) => option.title),
};
export default function RegistrationForm({ form, tickets, isClicked }) {
  const dialog = useDialogState();
  const handleTicket = (ticket) => {
    if (ticket === 1) {
      form.update("ticket", "weekend_pass");
    } else {
      form.update("ticket", "partyPass");
      form.update("role", "");
      form.update("level", "");
    }
  };

  const getTicketCapacity = (ticketName) => {
    if (ticketName === "partyPass") {
      const [ticket] = tickets.filter(({ name }) => name === ticketName);
      return ticket["capacity"];
    }
  };
  const disabled = (value) =>
    (form.values.role === "follow" &&
      (value === "trumpet" ||
        value === "drums" ||
        value === "guitar" ||
        value === "saxophone")) ||
    (form.values.role === "lead" &&
      (value === "trumpet" || value === "guitar" || value === "saxophone"));

  return (
    <>
      {!isClicked && (
        <Form className={styles.container} {...form}>
          <h3 className={styles.personalTitle}>Your Personal Data:</h3>

          <FormInput
            required
            {...form}
            label="First Name"
            defaultValue={form.values.firstname}
            className={styles.input}
            name="firstname"
            placeholder="first name"
          />
          <FormMessage
            className={styles.errorMessage}
            {...form}
            name="firstname"
          />
          <FormInput
            {...form}
            required
            label="Last Name"
            defaultValue={form.values.lastname}
            className={styles.input}
            name="lastname"
            placeholder="last name"
          />
          <FormMessage
            className={styles.errorMessage}
            {...form}
            name="lastname"
          />
          <FormInput
            {...form}
            required
            label="E-mail"
            className={styles.input}
            defaultValue={form.values.email}
            name="email"
            placeholder="email"
          />
          <FormMessage className={styles.errorMessage} {...form} name="email" />
          <select
            onChange={(e) => form.update("country", e.target.value)}
            className={classNames(styles.select, styles.countrySelect)}
          >
            {countries?.map(({ title }) => (
              <option value={title} key={title}>
                {title}
              </option>
            ))}
          </select>

          <FormMessage
            className={styles.errorMessage}
            {...form}
            name="country"
          />
          <h3 className={styles.title}>Choose your Ticket:</h3>
          <div className={styles.cardWrapper}>
            <div
              onClick={() => handleTicket(1)}
              className={classNames(styles.card, {
                [styles.selected]: form.values.ticket === "weekend_pass",
              })}
            >
              <h3>Weekend pass</h3>
              <p>€90</p>
            </div>
          </div>

          {form.values.ticket === "weekend_pass" && (
            <>
              <h3 className={styles.title}>Choose your primary dance role:</h3>
              <FormRadioGroup
                className={styles.radioGroup}
                {...form}
                name="role"
              >
                <label>
                  <FormRadio {...form} name="role" value="follow" />{" "}
                  <p>Mainly follower</p>
                </label>
                <label>
                  <FormRadio {...form} name="role" value="lead" />
                  <p>Mainly leader</p>
                </label>
                <label>
                  <FormRadio {...form} name="role" value="switch" />
                  <p>True Switch</p>
                </label>
              </FormRadioGroup>
            </>
          )}
          <h3 className={styles.title}>I want to pay:</h3>
          <FormRadioGroup className={styles.radioGroup} {...form} name="price">
            <label>
              <FormRadio {...form} name="price" value={90} /> <p>€90</p>
            </label>
            <label>
              <FormRadio {...form} name="price" value={100} /> <p>€100</p>
            </label>
            <label>
              <FormRadio {...form} name="price" value={110} /> <p>€110</p>
            </label>
          </FormRadioGroup>

          <div className={styles.checkboxWrapper}>
            <FormCheckbox {...form} name="terms" />
            <FormLabel {...form} name="terms">
              By accepting this you agree to our{" "}
              <a
                style={{ color: "blue" }}
                rel="noreferrer"
                href="https://www.thegrindhelsinki.com/coc"
                target="_blank"
              >
                Code of Conduct.
              </a>
            </FormLabel>
          </div>
          <FormMessage className={styles.errorMessage} {...form} name="terms" />
          <FormSubmitButton
            disabled={isClicked}
            className={classNames(styles.button, {
              [styles.disabled]: isClicked,
            })}
            {...form}
          >
            Register
          </FormSubmitButton>
        </Form>
      )}
      {isClicked && <SkeletonComponent />}
    </>
  );
}
