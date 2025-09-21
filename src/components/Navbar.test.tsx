// src/components/Navbar.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";

describe("Navbar", () => {
  it("renders brand and GitHub link", () => {
    render(<Navbar />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open github/i })).toBeInTheDocument();
  });
});
