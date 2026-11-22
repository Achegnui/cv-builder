import type { CVData } from "@/lib/schema";
import type { VaultFact } from "@/lib/vault";

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: number;
}

export interface CVVersion {
  id: string;
  userId: string;
  title: string;
  cvData: CVData;
  vaultData?: VaultFact[];
  createdAt: string;
  updatedAt: string;
}

export interface CVVersionListItem {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
