// TypeScript Interface: Wallpaper Asset Contract
// Purpose: Define wallpaper types and operations

export type WallpaperSourceType = 'upload' | 'builtin';

export interface WallpaperAsset {
  id: string;                   // UUID
  sourceType: WallpaperSourceType;
  sourceReference: string;      // File path or built-in name
  filePath: string | null;      // Absolute path on disk; null for built-ins
  displayName: string;          // User-facing display name
  isActive: boolean;            // Currently selected wallpaper
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
}

export interface BuiltInWallpaper {
  id: string;
  name: string;
  label: string;
  cssUrl: string;               // URL to CSS gradient or image
}

// Built-in wallpaper definitions
export const BUILTIN_WALLPAPERS: BuiltInWallpaper[] = [
  {
    id: 'builtin-1',
    name: 'gradient-ocean',
    label: 'Ocean Gradient',
    cssUrl: 'linear-gradient(135deg, #0a3d62 0%, #1a5c7a 100%)',
  },
  {
    id: 'builtin-2',
    name: 'gradient-forest',
    label: 'Forest Gradient',
    cssUrl: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
  },
  {
    id: 'builtin-3',
    name: 'gradient-sunset',
    label: 'Sunset Gradient',
    cssUrl: 'linear-gradient(135deg, #5d2c3e 0%, #8b4f9f 50%, #e8a555 100%)',
  },
];

// Validation rules for wallpaper uploads
export interface WallpaperValidationRules {
  maxFileSizeBytes: number;     // 2 MB
  maxDimensionsPx: number;      // 1024×1024 px
  allowedMimeTypes: string[];   // PNG, JPEG, WebP, SVG
}

export const WALLPAPER_VALIDATION_RULES: WallpaperValidationRules = {
  maxFileSizeBytes: 2 * 1024 * 1024, // 2 MB
  maxDimensionsPx: 1024,
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
};

// Wallpaper upload response
export interface WallpaperUploadResult {
  success: boolean;
  wallpaper?: WallpaperAsset;
  error?: string;               // Error message if upload fails
  validationError?: string;     // Specific validation error
}

// Service interface for wallpaper operations
export interface WallpaperService {
  // Fetch all wallpapers (built-in + uploaded)
  getAllWallpapers(): Promise<WallpaperAsset[]>;
  
  // Get active wallpaper
  getActiveWallpaper(): Promise<WallpaperAsset | null>;
  
  // Set wallpaper as active
  setActiveWallpaper(wallpaperId: string): Promise<void>;
  
  // Upload a new wallpaper
  uploadWallpaper(file: File, displayName: string): Promise<WallpaperUploadResult>;
  
  // Delete uploaded wallpaper
  deleteWallpaper(wallpaperId: string): Promise<void>;
  
  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string };
  
  // Get CSS background value for wallpaper
  getBackgroundCss(wallpaper: WallpaperAsset): string;
}

// Helper: Validate file
export async function validateWallpaperFile(file: File): Promise<{ valid: boolean; error?: string }> {
  const rules = WALLPAPER_VALIDATION_RULES;
  
  // Check file size
  if (file.size > rules.maxFileSizeBytes) {
    return { valid: false, error: `File exceeds ${rules.maxFileSizeBytes / (1024 * 1024)}MB limit` };
  }
  
  // Check MIME type
  if (!rules.allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type. Allowed: PNG, JPEG, WebP, SVG' };
  }
  
  // Check dimensions for image files
  if (file.type !== 'image/svg+xml') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width > rules.maxDimensionsPx || img.height > rules.maxDimensionsPx) {
            resolve({ valid: false, error: `Image exceeds ${rules.maxDimensionsPx}×${rules.maxDimensionsPx}px` });
          } else {
            resolve({ valid: true });
          }
        };
        img.onerror = () => {
          resolve({ valid: false, error: 'Invalid image file' });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
  
  return { valid: true };
}

// Helper: Get CSS background for wallpaper
export function getWallpaperBackgroundCss(wallpaper: WallpaperAsset): string {
  if (wallpaper.sourceType === 'builtin') {
    const builtin = BUILTIN_WALLPAPERS.find((w) => w.id === wallpaper.id);
    return builtin ? builtin.cssUrl : '';
  } else {
    // For uploaded wallpapers, use file path
    return `url('${wallpaper.filePath}')`;
  }
}
