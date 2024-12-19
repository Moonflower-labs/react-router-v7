const ReviewsSkeleton = () => {
  return (
    <div className="w-full h-60 text-center">
      <div className="carousel w-full bg-primary-content/25 lg:w-[70%] border rounded-lg shadow-lg mx-auto mb-8 px-8 py-4">
        <div className="carousel-item relative w-full flex-col items-center text-start">
          <div className="skeleton h-4 w-28 mb-3"></div>
          <div className="skeleton h-4 w-full mb-3"></div>
          <span className="skeleton h-4 w-full mb-3"></span>
          <span className="skeleton h-4 w-4/5 mb-3"></span>
          <div className="skeleton h-4 w-2/3 mb-3"></div>
          <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
            <div className="btn btn-circle btn-ghost text-primary">❮</div>
            <div className="btn btn-circle btn-ghost text-primary">❯</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSkeleton;
