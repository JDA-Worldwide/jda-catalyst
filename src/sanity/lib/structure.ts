import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Global Settings")
        .schemaType("globalSettings")
        .child(
          S.editor().title("Global Settings").schemaType("globalSettings").documentId("globalSettings")
        ),
      S.divider(),
      S.documentTypeListItem("page").title("Pages"),
      S.documentTypeListItem("blogPost").title("Blog Posts"),
      S.documentTypeListItem("teamMember").title("Team Members"),
      S.divider(),
      S.listItem()
        .title("Navigation")
        .schemaType("navigation")
        .child(
          S.editor().title("Navigation").schemaType("navigation").documentId("navigation")
        ),
      S.listItem()
        .title("Footer")
        .schemaType("footer")
        .child(
          S.editor().title("Footer").schemaType("footer").documentId("footer")
        ),
      S.divider(),
      S.documentTypeListItem("formSubmission").title("Form Submissions"),
    ]);
