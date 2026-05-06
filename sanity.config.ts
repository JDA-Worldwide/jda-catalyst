/**
 * Root re-export so `sanity` CLI commands (`manifest extract`, `schema deploy`)
 * resolve the studio config from the repository root.
 *
 * @see https://www.sanity.io/docs/dashboard/dashboard-configure
 */
export { default } from "./src/sanity/sanity.config";
