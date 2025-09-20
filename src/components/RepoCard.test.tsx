import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RepoCard } from "@/components/RepoCard";
import type { Repo } from "@/types/github";

const repo: Repo = {
  id: 1,
  full_name: "acme/widgets",
  description: "Toolkit para widgets de UI",
  stargazers_count: 1234,
  html_url: "https://github.com/acme/widgets",
  updated_at: "2024-01-02T03:04:05Z",
  owner: { login: "acme", avatar_url: "https://example.com/avatar.png" },
};

describe("RepoCard", () => {
  it("renderiza campos principais", () => {
    render(<RepoCard repo={repo} />);
    expect(screen.getByRole("link", { name: /acme\/widgets/i })).toBeInTheDocument();
    expect(screen.getByText(/Toolkit para widgets de UI/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/1234 estrelas/i)).toBeInTheDocument();
    expect(screen.getByText(/Atualizado em/i)).toBeInTheDocument();
  });
});
