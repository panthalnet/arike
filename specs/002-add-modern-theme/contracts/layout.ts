// TypeScript Interface: Layout Engine Contract
// Purpose: Define layout mode selection and bento grid configuration

export type LayoutMode = 'uniform-grid' | 'bento-grid';

export interface LayoutPreference {
  id: integer;                  // Always 1 in v1
  layoutMode: LayoutMode;       // Selected layout mode
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
}

export type TileSize = 'small' | 'medium' | 'large';

// Bento grid configuration
export interface BentoGridConfig {
  desktopColumns: number;       // 6 columns on ≥1024px
  tabletColumns: number;        // 3 columns on 768-1023px
  mobileColumns: number;        // 1 column on <768px
  gapPx: number;                // Gap between tiles in pixels
  minTileWidthPx: number;       // Min tile width before wrapping
  autoFlow: 'dense' | 'sparse'; // CSS Grid auto-flow mode
}

export const DEFAULT_BENTO_CONFIG: BentoGridConfig = {
  desktopColumns: 6,
  tabletColumns: 3,
  mobileColumns: 1,
  gapPx: 12,
  minTileWidthPx: 120,
  autoFlow: 'dense',
};

// Tile span configuration
export interface TileSpanConfig {
  small: { desktopSpan: number; tabletSpan: number; mobileSpan: number };
  medium: { desktopSpan: number; tabletSpan: number; mobileSpan: number };
  large: { desktopSpan: number; tabletSpan: number; mobileSpan: number };
}

export const DEFAULT_TILE_SPANS: TileSpanConfig = {
  small: { desktopSpan: 1, tabletSpan: 1, mobileSpan: 1 },
  medium: { desktopSpan: 2, tabletSpan: 2, mobileSpan: 1 },
  large: { desktopSpan: 3, tabletSpan: 2, mobileSpan: 1 },
};

// Viewport breakpoints
export interface ViewportBreakpoints {
  mobile: number;               // < 480px
  mobileBase: number;           // 480–768px
  tablet: number;               // 768–1024px
  desktop: number;              // ≥ 1024px
}

export const DEFAULT_BREAKPOINTS: ViewportBreakpoints = {
  mobile: 480,
  mobileBase: 768,
  tablet: 1024,
  desktop: 1024,
};

// Layout service interface
export interface LayoutService {
  // Get current layout mode
  getLayoutMode(): Promise<LayoutMode>;
  
  // Set layout mode
  setLayoutMode(mode: LayoutMode): Promise<void>;
  
  // Get tile size for a bookmark
  getTileSize(bookmarkId: string): Promise<TileSize>;
  
  // Set tile size for a bookmark
  setTileSize(bookmarkId: string, size: TileSize): Promise<void>;
  
  // Calculate grid span based on viewport width
  calculateSpan(tileSize: TileSize, viewportWidth: number): number;
  
  // Get CSS Grid configuration for current viewport
  getBentoGridCSS(viewportWidth: number): { columns: number; gap: string };
}

// Helper: Determine viewport category
export function getViewportCategory(widthPx: number): 'mobile' | 'mobileBase' | 'tablet' | 'desktop' {
  if (widthPx < DEFAULT_BREAKPOINTS.mobile) return 'mobile';
  if (widthPx < DEFAULT_BREAKPOINTS.mobileBase) return 'mobileBase';
  if (widthPx < DEFAULT_BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

// Helper: Get tile span for viewport
export function getTileSpan(
  tileSize: TileSize,
  viewportCategory: ReturnType<typeof getViewportCategory>
): number {
  const spanMap: Record<typeof viewportCategory, Record<TileSize, number>> = {
    mobile: { small: 1, medium: 1, large: 1 },
    mobileBase: { small: 1, medium: 1, large: 1 },
    tablet: DEFAULT_TILE_SPANS.large[viewportCategory === 'tablet' ? 'tabletSpan' : 'mobileSpan'],
    desktop: DEFAULT_TILE_SPANS[tileSize]['desktopSpan'],
  };
  
  return spanMap[viewportCategory][tileSize];
}

// Helper: Generate Bento Grid CSS
export function generateBentoGridCSS(viewportWidth: number): string {
  const config = DEFAULT_BENTO_CONFIG;
  const category = getViewportCategory(viewportWidth);
  
  let columns = config.desktopColumns;
  if (category === 'tablet') columns = config.tabletColumns;
  if (category === 'mobile' || category === 'mobileBase') columns = config.mobileColumns;
  
  return `
    display: grid;
    grid-template-columns: repeat(${columns}, minmax(${config.minTileWidthPx}px, 1fr));
    grid-auto-flow: ${config.autoFlow};
    gap: ${config.gapPx}px;
  `;
}
