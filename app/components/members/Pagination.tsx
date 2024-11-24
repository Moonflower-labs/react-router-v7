import { Link, useLocation } from "react-router";
import { Pagination } from "~/models/post.server";

export function Paginator({ pagination }: { pagination: Pagination }) {
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const currentPage = Number(searchParams.get("page")) || 1;
  const createPageURL = (pageNumber: number | string) => {
    searchParams.set("page", pageNumber.toString());
    return `${pathname}?${searchParams.toString()}`;
  };

  // { totalCount, totalPages, page, pageSize }
  const totalPages = pagination?.totalPages;
  const pagesArray = Array.from({ length: totalPages }, (_, index) => index + 1);

  const numPagesToShow = 5; // Total number of page links to show in the pagination

  const getPages = () => {
    const totalPages = pagesArray.length;
    const pageLinks = [];

    // Edge cases when there are less than or equal to the desired numbers
    if (totalPages <= numPagesToShow) {
      return pagesArray;
    }

    // Add the first page
    pageLinks.push(1);

    // Add an ellipsis if the first section is skipped
    if (currentPage > 2) {
      pageLinks.push("...");
    }

    // Middle pages
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pageLinks.push(i);
    }

    // Add an ellipsis if the last section is skipped
    if (currentPage < totalPages - 2) {
      pageLinks.push("...");
    }

    // Add the last page
    if (totalPages > 1) {
      pageLinks.push(totalPages);
    }

    return pageLinks;
  };

  return (
    <>
      {totalPages > 1 && (
        <div aria-label="Page navigation" className="join pb-3">
          <Link
            preventScrollReset={true}
            className={`join-item btn btn-squarebtn btn-primary btn-sm ${currentPage === 1 ? "btn-disabled" : ""}`}
            to={createPageURL(currentPage - 1)}
            aria-label="Previous"
            viewTransition>
            <span aria-hidden="true">&laquo;</span>
          </Link>
          {getPages().map((page, index) =>
            page === "..." ? (
              <span key={index} className="join-item px-2 text-primary">
                ...
              </span>
            ) : (
              <Link
                preventScrollReset={true}
                className={`join-item btn btn-squarebtn btn-primary btn-sm ${currentPage === page ? "btn-active" : ""}`}
                key={`${page}/${index}`}
                to={createPageURL(page)}
                viewTransition>
                {page}
              </Link>
            )
          )}
          <Link
            preventScrollReset={true}
            className={`join-item btn btn-squarebtn btn-primary btn-sm ${currentPage === totalPages ? "btn-disabled" : ""}`}
            to={createPageURL(currentPage + 1)}
            aria-label="Next"
            viewTransition>
            <span aria-hidden="true">&raquo;</span>
          </Link>
        </div>
      )}
    </>
  );
}
