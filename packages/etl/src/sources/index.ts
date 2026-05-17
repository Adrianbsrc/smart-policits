export * from "./camara/camara";

export interface DataSource {
  name: string;
  fetch: () => Promise<unknown[]>;
}
