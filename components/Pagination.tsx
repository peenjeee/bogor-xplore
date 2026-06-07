import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function pageHref(page: number, search?: string, category?: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/places?${query}` : "/places";
}

export function Pagination({
  page,
  totalPages,
  search,
  category,
}: {
  page: number;
  totalPages: number;
  search?: string;
  category?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((item) => {
    return item === 1 || item === totalPages || Math.abs(item - page) <= 2;
  });

  return (
    <PaginationRoot className="mt-10">
      <PaginationContent>
        {page > 1 ? (
          <PaginationItem>
            <PaginationPrevious href={pageHref(page - 1, search, category)} />
          </PaginationItem>
        ) : null}
        {pages.map((item, index) => {
          const previous = pages[index - 1];
          return (
            <span key={item} className="contents">
              {previous && item - previous > 1 ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              <PaginationItem>
                {item === page ? (
                  <PaginationLink href={pageHref(item, search, category)} isActive>
                    {item}
                  </PaginationLink>
                ) : (
                  <PaginationLink href={pageHref(item, search, category)}>{item}</PaginationLink>
                )}
              </PaginationItem>
            </span>
          );
        })}
        {page < totalPages ? (
          <PaginationItem>
            <PaginationNext href={pageHref(page + 1, search, category)} />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </PaginationRoot>
  );
}
