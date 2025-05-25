import { Search } from "lucide-react";

interface ArticlesFiltersProps {
  onSearch: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDateFilterChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function ArticlesFilters({
  onSearch,
  onCategoryChange,
  onDateFilterChange,
  onSortChange,
}: ArticlesFiltersProps) {
  return (
    <section className="py-8 border-b">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#548281]"
              onChange={(e) => onSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Filters */}
          <div className="flex gap-4 w-full md:w-auto">
            <select
              className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#548281]"
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Peace">Peace</option>
              <option value="Democracy">Democracy</option>
              <option value="Politics">Politics</option>
              <option value="Conflict">Conflict</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#548281]"
              onChange={(e) => onDateFilterChange(e.target.value)}
            >
              <option value="">Filter Date</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#548281]"
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
