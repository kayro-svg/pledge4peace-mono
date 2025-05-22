// structure/index.js
export const structure = (S) =>
  S.list()
    .title('Contenido del Sitio')
    .items([
      // Primer elemento: Contenido de páginas organizado por sección
      S.listItem()
        .title('Páginas del Sitio')
        .child(
          // Lista de documentos filtrados por tipo
          S.documentList()
            .title('Páginas y Secciones')
            .filter('_type == "pageContent"')
            .defaultOrdering([{ field: 'title', direction: 'asc' }]),
        ),

      // Otros elementos del menú aquí
      S.divider(),

      // Contenido del blog y otras secciones estándar
      S.listItem()
        .title('Blog')
        .child(
          S.list()
            .title('Contenido del Blog')
            .items([
              S.listItem().title('Artículos').child(S.documentTypeList('post')),
              S.listItem().title('Autores').child(S.documentTypeList('author')),
              S.listItem().title('Categorías').child(S.documentTypeList('category')),
            ]),
        ),
    ])
