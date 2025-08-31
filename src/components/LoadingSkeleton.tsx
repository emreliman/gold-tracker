export default function LoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gray-300 dark:bg-gray-600 p-6">
        <div className="h-6 bg-gray-400 dark:bg-gray-500 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-400 dark:bg-gray-500 rounded w-64"></div>
      </div>

      {/* Main Price Skeleton */}
      <div className="p-6 bg-gray-100 dark:bg-gray-700 border-b">
        <div className="text-center">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24 mx-auto mb-2"></div>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-8 mb-1"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            </div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-8 mb-1"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            </div>
          </div>
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto"></div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="px-6 pb-6">
        <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-xl w-full"></div>
      </div>
    </div>
  );
}
