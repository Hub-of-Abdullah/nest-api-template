export interface Migration {
  name: string;
  version: number;
  up(): Promise<void>;
  down(): Promise<void>;
}