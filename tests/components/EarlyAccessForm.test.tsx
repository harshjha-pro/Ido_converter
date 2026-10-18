// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EarlyAccessForm } from "@/components/marketing/EarlyAccessForm";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function fillValid() {
  fireEvent.change(screen.getByLabelText("Email or WhatsApp number"), { target: { value: "98765 43210" } });
  fireEvent.click(screen.getByLabelText("I do listings for sellers"));
  fireEvent.click(screen.getByLabelText("Meesho"));
  fireEvent.click(screen.getByLabelText("200–1,000"));
  fireEvent.click(screen.getByLabelText(/may contact me/));
}

describe("EarlyAccessForm", () => {
  it("shows field errors and does not call the API when invalid", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    render(<EarlyAccessForm />);
    fireEvent.click(screen.getByRole("button", { name: "Join early access" }));
    expect(await screen.findByText("Enter your email or WhatsApp number.")).toBeTruthy();
    expect(screen.getByText("Choose at least one.")).toBeTruthy();
    expect(screen.getByText("Please agree so we can contact you.")).toBeTruthy();
    expect(spy).not.toHaveBeenCalled();
  });

  it("submits normalised data and shows the success state", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true, data: { status: "created" } }), { status: 201 }));
    render(<EarlyAccessForm source="tool" />);
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: "Join early access" }));
    expect(await screen.findByText("You’re on the list.")).toBeTruthy();
    expect(screen.getByText(/\+919876543210/)).toBeTruthy();
    const body = JSON.parse(String(spy.mock.calls[0][1]!.body));
    expect(body).toMatchObject({ role: "cataloguer", marketplaces: ["meesho"], monthlyPhotos: "200_1000", source: "tool", consent: true, website: "" });
  });

  it("shows server field errors and rate-limit messages", async () => {
    const spy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, error: { code: "validation_failed", message: "x", fields: { contact: "Server says no." } } }), { status: 422 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, error: { code: "rate_limited", message: "x" } }), { status: 429 }));
    render(<EarlyAccessForm />);
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: "Join early access" }));
    expect(await screen.findByText("Server says no.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Join early access" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/Too many attempts/));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("handles being offline", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    render(<EarlyAccessForm />);
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: "Join early access" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/offline/));
  });
});
