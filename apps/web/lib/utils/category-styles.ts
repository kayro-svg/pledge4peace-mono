// Utility functions to replace inline styles with CSS classes

export function getCategoryClassName(category: string): string {
  const categoryMap: { [key: string]: string } = {
    "Peace Initiatives": "category-peace-initiatives",
    "Community": "category-community", 
    "Events": "category-events",
    "General": "category-general",
  };

  return categoryMap[category] || "category-general";
}

// Legacy function for backward compatibility - now returns CSS class
export function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    "Peace Initiatives": "#548281",
    "Community": "#FF6B6B", 
    "Events": "#4ECDC4",
    "General": "#95A5A6",
  };

  return colors[category] || colors["General"];
}

// Performance optimization utilities
export const imageOptimizationClasses = {
  autoSize: "image-auto-size",
  loading: "image-loading",
  loaded: "image-loaded",
  gpuAccelerated: "gpu-accelerated",
  willChangeTransform: "will-change-transform",
} as const;
