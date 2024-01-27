export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <svg
        className="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        fill="none"
        viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v0M4 12a8 8 0 018 8v0"></path>
      </svg>
      <p className="text-white">Loading...</p>
    </div>
  );
}
