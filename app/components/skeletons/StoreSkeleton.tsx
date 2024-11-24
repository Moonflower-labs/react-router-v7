const StoreSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center pb-4">
      {[...Array(10)].map((_, index) => (
        <div key={index} className="flex flex-col gap-4 w-[95%] my-3 border-2 p-10 rounded-xl">
          <div className="skeleton h-40 w-full"></div>
          <div className="skeleton h-6 w-28"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-12 w-1/2 mx-auto"></div>
        </div>
      ))}
    </div>
  );
};

export default StoreSkeleton;
