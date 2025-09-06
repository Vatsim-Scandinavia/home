const Skeleton = ({ count = 1 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <tr key={i}>
        <td colSpan={4} className="text-center">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-100 dark:bg-secondary rounded w-4/4 mx-1"></div>
            <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-4/4 mx-1"></div>
            <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-4/4 mx-1"></div>
            <div className="h-4 bg-gray-50 dark:bg-secondary rounded w-4/4 mx-1"></div>
            <div className="h-4 bg-gray-100 dark:bg-secondary rounded w-4/4 mx-1"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export default Skeleton;


