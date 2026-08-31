export type SearchableDrawing = {
  id: string;
  category: string;
  status: string;
};

export function getDrawingSearchText(
  drawing: SearchableDrawing,
  labels: { category: string; descriptor: string; title: string },
) {
  return `${drawing.id} ${labels.category} ${labels.descriptor} ${labels.title} ${drawing.category} ${drawing.status}`.toLocaleLowerCase("pt-BR");
}

export function matchesDrawingSearch(
  drawing: SearchableDrawing,
  searchTerm: string,
  labels: { category: string; descriptor: string; title: string },
) {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");
  return !normalizedSearch || getDrawingSearchText(drawing, labels).includes(normalizedSearch);
}
